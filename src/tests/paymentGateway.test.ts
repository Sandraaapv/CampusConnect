import { describe, it, expect, beforeEach } from 'vitest';
import {
  paymentService,
  isValidLuhn,
  detectCardNetwork,
  maskCardNumber,
  MockGateway,
  PAYMENT_CONFIG,
} from '../services/paymentService';
import { db } from '../services/db';

describe('Payment Gateway & State Machine Tests', () => {
  beforeEach(() => {
    db.resetToDefaults();
  });

  describe('1. Luhn Check & Test Card Validation', () => {
    it('accurately verifies Luhn checksum for valid cards', () => {
      // Standard test cards are Luhn valid
      expect(isValidLuhn('4111 1111 1111 1111')).toBe(true);
      expect(isValidLuhn('4000 0000 0000 0002')).toBe(true);
      expect(isValidLuhn('4000 0000 0000 9995')).toBe(true);
      // Invalid Luhn
      expect(isValidLuhn('4111 1111 1111 1112')).toBe(false);
      expect(isValidLuhn('12345')).toBe(false);
    });

    it('detects card networks correctly', () => {
      expect(detectCardNetwork('4111111111111111')).toBe('Visa');
      expect(detectCardNetwork('5123456789012345')).toBe('Mastercard');
      expect(detectCardNetwork('6012345678901234')).toBe('RuPay');
      expect(detectCardNetwork('371234567890123')).toBe('Amex');
    });

    it('masks card numbers and never leaks more than last 4 digits', () => {
      const masked = maskCardNumber('4111 1111 1111 1111');
      expect(masked).toContain('•••• •••• •••• 1111');
      expect(masked).not.toContain('4111 1111 1111');
    });

    it('rejects non-test cards even if Luhn-valid in demo mode', async () => {
      const orderRes = await paymentService.createOrder({
        amountType: 'full',
      });
      expect(orderRes.success).toBe(true);
      const order = orderRes.order!;

      // A real-looking Luhn-valid card that is NOT a test card
      const realLookingCard = '4242 4242 4242 4242';
      expect(isValidLuhn(realLookingCard)).toBe(true);

      const payRes = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'test_real_reject',
        instrument: {
          cardNumber: realLookingCard,
          cardHolder: 'Student',
          cardExpiry: '12/28',
          cardCvv: '123',
        },
      });

      expect(payRes.success).toBe(false);
      expect(payRes.error).toBe('This is a demo checkout. Please use a test card.');
    });
  });

  describe('2. Server-Side Amount Validation', () => {
    it('creates order with server-calculated full balance', async () => {
      const summary = db.getFeeStatusSummary(6);
      expect(summary.balanceDue).toBeGreaterThan(0);

      const res = await paymentService.createOrder({
        semester: 6,
        amountType: 'full',
      });

      expect(res.success).toBe(true);
      expect(res.order?.amount).toBe(summary.balanceDue);
      expect(res.order?.status).toBe('created');
    });

    it('rejects custom amount below config minimum or above balance due', async () => {
      const summary = db.getFeeStatusSummary(6);

      // Below min
      const resLow = await paymentService.createOrder({
        semester: 6,
        amountType: 'custom',
        customAmount: 100, // min is 500
      });
      expect(resLow.success).toBe(false);
      expect(resLow.error).toContain('Minimum payment amount');

      // Above balance
      const resHigh = await paymentService.createOrder({
        semester: 6,
        amountType: 'custom',
        customAmount: summary.balanceDue + 50000,
      });
      expect(resHigh.success).toBe(false);
      expect(resHigh.error).toContain('cannot exceed outstanding balance');
    });
  });

  describe('3. Order State Machine & Idempotency', () => {
    it('advances order state from created -> paid upon successful payment', async () => {
      const orderRes = await paymentService.createOrder({
        amountType: 'full',
      });
      const order = orderRes.order!;
      expect(order.status).toBe('created');

      const payRes = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'idem_key_test_1',
        instrument: {
          cardNumber: '4111 1111 1111 1111',
          cardHolder: 'Aarav Sharma',
          cardExpiry: '12/28',
          cardCvv: '123',
        },
      });

      expect(payRes.success).toBe(true);
      expect(payRes.order?.status).toBe('paid');
      expect(payRes.result?.referenceNumber).toBeTruthy();
    });

    it('enforces idempotency: confirming an already paid order returns existing result without re-charging', async () => {
      const orderRes = await paymentService.createOrder({
        amountType: 'custom',
        customAmount: 5000,
      });
      const order = orderRes.order!;

      // First confirmation
      const pay1 = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'idem_double_click_test',
        instrument: {
          cardNumber: '4111 1111 1111 1111',
        },
      });
      expect(pay1.success).toBe(true);

      const paymentsCountBefore = db.getFeePayments(6).length;

      // Duplicate confirmation (e.g. rapid double click or network retry)
      const pay2 = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'idem_double_click_test',
        instrument: {
          cardNumber: '4111 1111 1111 1111',
        },
      });

      expect(pay2.success).toBe(true);
      expect(pay2.order?.status).toBe('paid');
      // No duplicate fee_payment was inserted!
      const paymentsCountAfter = db.getFeePayments(6).length;
      expect(paymentsCountAfter).toBe(paymentsCountBefore);
    });

    it('allows retry on the same order after a simulated failure', async () => {
      const orderRes = await paymentService.createOrder({
        amountType: 'custom',
        customAmount: 2000,
      });
      const order = orderRes.order!;

      // Attempt 1: Failed card (declined)
      const payFail = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'attempt_1_fail',
        instrument: {
          cardNumber: '4000 0000 0000 0002',
        },
      });

      expect(payFail.success).toBe(false);
      expect(payFail.order?.status).toBe('failed');

      // Attempt 2: Successful retry on the exact same order
      const paySuccess = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'attempt_2_success',
        instrument: {
          cardNumber: '4111 1111 1111 1111',
        },
      });

      expect(paySuccess.success).toBe(true);
      expect(paySuccess.order?.status).toBe('paid');
    });

    it('rejects payment on an expired order', async () => {
      const orderRes = await paymentService.createOrder({
        amountType: 'full',
      });
      const order = orderRes.order!;

      // Force expired timestamp
      order.expiresAt = new Date(Date.now() - 60000).toISOString();
      db.updatePaymentOrder(order);

      const payRes = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'card',
        idempotencyKey: 'expired_attempt',
        instrument: {
          cardNumber: '4111 1111 1111 1111',
        },
      });

      expect(payRes.success).toBe(false);
      expect(payRes.error).toContain('expired');
    });
  });

  describe('4. Atomic Settlement & No-Dues Clearance', () => {
    it('settles balance, generates verified receipt, adds notification, and clears Accounts No-dues', async () => {
      const initialSummary = db.getFeeStatusSummary(6);
      const balanceToClear = initialSummary.balanceDue;

      // Full balance payment order
      const orderRes = await paymentService.createOrder({
        semester: 6,
        amountType: 'full',
      });
      const order = orderRes.order!;

      const payRes = await paymentService.confirmPayment({
        orderId: order.id,
        method: 'upi',
        idempotencyKey: 'full_settle_upi',
        instrument: {
          upiId: 'success@demo',
        },
      });

      expect(payRes.success).toBe(true);

      // 1. Fee balance updated to 0
      const updatedSummary = db.getFeeStatusSummary(6);
      expect(updatedSummary.balanceDue).toBe(0);
      expect(updatedSummary.status).toBe('Paid');

      // 2. Receipt generated
      const receipts = db.getFeeReceipts();
      const newReceipt = receipts.find((r) => r.amount === balanceToClear);
      expect(newReceipt).toBeDefined();
      expect(newReceipt?.verifyToken).toContain('cc_receipt_S6');

      // 3. Notification created
      const notifs = db.getNotifications();
      const feeNotif = notifs.find((n) => n.type === 'fee_paid' && n.title === 'Payment Received');
      expect(feeNotif).toBeDefined();

      // 4. Accounts department clearance in No-dues approved
      const requests = db.getRequests();
      const noDuesReq = requests.find((r) => r.type === 'No-dues');
      expect(noDuesReq).toBeDefined();
      const accountsStage = noDuesReq?.departmentStages?.find((s) => s.department === 'Accounts');
      expect(accountsStage?.cleared).toBe(true);
    });
  });

  describe('5. Webhook Signature Verification', () => {
    it('verifies mock webhook payload signature with config secret', () => {
      const gateway = new MockGateway();
      const payload = JSON.stringify({ event: 'payment.captured', orderId: 'ord-123' });
      const secret = PAYMENT_CONFIG.WEBHOOK_SECRET;

      // Correct signature
      let hash = 0;
      const combined = payload + secret;
      for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
      }
      const signature = `sha256_${Math.abs(hash).toString(16)}`;

      expect(gateway.verifyWebhookSignature(payload, signature, secret)).toBe(true);
      expect(gateway.verifyWebhookSignature(payload, 'wrong_sig', secret)).toBe(false);
    });
  });
});
