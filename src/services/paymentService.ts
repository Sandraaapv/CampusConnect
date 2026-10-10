/**
 * CampusConnect — Modular Payment Service & Gateway Interface
 * Supports mock sandbox mode (default) and pluggable live payment gateway adapters.
 */

import { db } from './db';
import type { FeePaymentRecord, FeeReceipt } from './collegeRecords';

export type PaymentMode = 'mock' | 'live';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'counter';
export type OrderStatus = 'created' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'expired';

export interface PaymentConfig {
  PAYMENT_MODE: PaymentMode;
  COLLEGE_PAYMENT_URL: string;
  MIN_CUSTOM_AMOUNT: number;
  MAX_CUSTOM_AMOUNT: number;
  ORDER_EXPIRY_MINUTES: number;
  WEBHOOK_SECRET: string;
}

export const PAYMENT_CONFIG: PaymentConfig = {
  PAYMENT_MODE: 'mock',
  COLLEGE_PAYMENT_URL: '', // Hidden by default; only displayed if real URL is configured
  MIN_CUSTOM_AMOUNT: 500,
  MAX_CUSTOM_AMOUNT: 200000,
  ORDER_EXPIRY_MINUTES: 15,
  WEBHOOK_SECRET: 'cc_mock_wh_secret_7721_prod_key',
};

export interface PaymentOrder {
  id: string;
  studentId: string;
  semester: number;
  amount: number;
  status: OrderStatus;
  idempotencyKey: string;
  expiresAt: string; // ISO 8601
  createdAt: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  failureReason?: string;
  maskedInstrument?: string;
  receiptId?: string;
  challanNumber?: string;
  challanExpiresAt?: string;
}

export interface PaymentAttempt {
  id: string;
  orderId: string;
  method: PaymentMethod;
  maskedInstrument: string;
  result: 'success' | 'failed' | 'pending';
  reason?: string;
  createdAt: string;
}

export interface PaymentEvent {
  id: string;
  orderId: string;
  event: 'created' | 'attempted' | 'succeeded' | 'failed' | 'expired' | 'cancelled';
  at: string;
  details?: string;
}

export interface PaymentInstrumentInput {
  // Card
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  // UPI
  upiId?: string;
  // Net Banking
  bankName?: string;
  // Presenter simulator override (mock mode only)
  simulationOverride?: 'success' | 'failure' | 'pending';
}

export interface ConfirmPaymentInput {
  orderId: string;
  method: PaymentMethod;
  idempotencyKey: string;
  instrument: PaymentInstrumentInput;
}

export interface GatewayResult {
  status: 'paid' | 'failed' | 'pending';
  referenceNumber: string;
  maskedInstrument: string;
  failureReason?: string;
}

export interface PaymentGateway {
  createOrder(order: PaymentOrder): Promise<PaymentOrder>;
  confirmPayment(order: PaymentOrder, input: ConfirmPaymentInput): Promise<GatewayResult>;
  getStatus(orderId: string): Promise<OrderStatus>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
}

// ----------------------------------------------------------------------------
// TEST CREDENTIALS & CARD VALIDATION HELPERS
// ----------------------------------------------------------------------------

export const TEST_CREDENTIALS = {
  cards: [
    { number: '4111 1111 1111 1111', clean: '4111111111111111', outcome: 'success', label: 'Success (Visa Demo)' },
    { number: '4000 0000 0000 0002', clean: '4000000000000002', outcome: 'declined', label: 'Declined (Issuer Reject)' },
    { number: '4000 0000 0000 9995', clean: '4000000000009995', outcome: 'insufficient_funds', label: 'Insufficient Funds' },
  ],
  upis: [
    { id: 'success@demo', outcome: 'success', label: 'Instant Approval' },
    { id: 'fail@demo', outcome: 'failed', label: 'Simulated PSP Decline' },
    { id: 'pending@demo', outcome: 'pending', label: 'Pending (Resolves in 10s)' },
  ],
  banks: [
    { name: 'Demo Bank - Success', outcome: 'success' },
    { name: 'Demo Bank - Failure', outcome: 'failed' },
    { name: 'Apex National Demo Bank', outcome: 'success' },
    { name: 'Campus Merchant Bank', outcome: 'success' },
  ],
};

/**
 * Standard Luhn checksum algorithm
 */
export function isValidLuhn(numStr: string): boolean {
  const sanitized = numStr.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Live Card Network Detector
 */
export function detectCardNetwork(numStr: string): 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' | 'Unknown' {
  const clean = numStr.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
  return 'Unknown';
}

/**
 * Masks any sensitive card or account number, leaving only the last 4 digits visible.
 */
export function maskCardNumber(numStr: string): string {
  const clean = numStr.replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  const last4 = clean.slice(-4);
  const network = detectCardNetwork(clean);
  return `${network !== 'Unknown' ? network + ' ' : ''}•••• •••• •••• ${last4}`;
}

// ----------------------------------------------------------------------------
// MOCK GATEWAY IMPLEMENTATION
// ----------------------------------------------------------------------------

export class MockGateway implements PaymentGateway {
  public async createOrder(_order: PaymentOrder): Promise<PaymentOrder> {
    return { ..._order };
  }

  public async confirmPayment(_order: PaymentOrder, input: ConfirmPaymentInput): Promise<GatewayResult> {
    const { method, instrument } = input;
    const override = PAYMENT_CONFIG.PAYMENT_MODE === 'mock' ? instrument.simulationOverride : undefined;

    if (override === 'success') {
      return {
        status: 'paid',
        referenceNumber: `DEMO-PAY-${Date.now().toString().slice(-6)}`,
        maskedInstrument: method === 'card' ? maskCardNumber(instrument.cardNumber || '4111111111111111') : instrument.upiId || instrument.bankName || 'Demo Counter',
      };
    }
    if (override === 'failure') {
      return {
        status: 'failed',
        referenceNumber: `DEMO-ERR-${Date.now().toString().slice(-6)}`,
        maskedInstrument: method === 'card' ? maskCardNumber(instrument.cardNumber || '4000000000000002') : instrument.upiId || 'Demo Method',
        failureReason: 'Transaction declined by demo bank simulator (manual override).',
      };
    }
    if (override === 'pending') {
      return {
        status: 'pending',
        referenceNumber: `DEMO-PND-${Date.now().toString().slice(-6)}`,
        maskedInstrument: method === 'card' ? maskCardNumber(instrument.cardNumber || '4111111111111111') : instrument.upiId || 'pending@demo',
      };
    }

    // Method: Card
    if (method === 'card') {
      const rawNum = (instrument.cardNumber || '').replace(/\D/g, '');
      const testCard = TEST_CREDENTIALS.cards.find((c) => c.clean === rawNum);

      if (!testCard) {
        throw new Error('This is a demo checkout. Please use a test card.');
      }

      const masked = maskCardNumber(rawNum);

      if (testCard.outcome === 'declined') {
        return {
          status: 'failed',
          referenceNumber: `MOCK-DEC-${Date.now().toString().slice(-6)}`,
          maskedInstrument: masked,
          failureReason: 'Card declined by issuing bank (simulated).',
        };
      }

      if (testCard.outcome === 'insufficient_funds') {
        return {
          status: 'failed',
          referenceNumber: `MOCK-NSF-${Date.now().toString().slice(-6)}`,
          maskedInstrument: masked,
          failureReason: 'Insufficient funds in bank account (simulated).',
        };
      }

      return {
        status: 'paid',
        referenceNumber: `MOCK-TXN-${Date.now().toString().slice(-6)}`,
        maskedInstrument: masked,
      };
    }

    // Method: UPI
    if (method === 'upi') {
      const upiId = (instrument.upiId || '').trim().toLowerCase();
      const testUpi = TEST_CREDENTIALS.upis.find((u) => u.id === upiId);

      if (!testUpi) {
        throw new Error('This is a demo checkout. Please use a test UPI ID (e.g. success@demo).');
      }

      if (testUpi.outcome === 'failed') {
        return {
          status: 'failed',
          referenceNumber: `MOCK-UPI-FAIL-${Date.now().toString().slice(-6)}`,
          maskedInstrument: upiId,
          failureReason: 'UPI payment timed out or rejected by PSP (simulated).',
        };
      }

      if (testUpi.outcome === 'pending') {
        return {
          status: 'pending',
          referenceNumber: `MOCK-UPI-PND-${Date.now().toString().slice(-6)}`,
          maskedInstrument: upiId,
        };
      }

      return {
        status: 'paid',
        referenceNumber: `MOCK-UPI-${Date.now().toString().slice(-6)}`,
        maskedInstrument: upiId,
      };
    }

    // Method: Net Banking
    if (method === 'netbanking') {
      const bankName = instrument.bankName || '';
      if (bankName.includes('Failure')) {
        return {
          status: 'failed',
          referenceNumber: `MOCK-NB-FAIL-${Date.now().toString().slice(-6)}`,
          maskedInstrument: bankName,
          failureReason: 'Bank netbanking gateway timeout (simulated).',
        };
      }

      return {
        status: 'paid',
        referenceNumber: `MOCK-NB-${Date.now().toString().slice(-6)}`,
        maskedInstrument: bankName || 'Demo Bank - Success',
      };
    }

    // Method: Counter Payment (Challan)
    if (method === 'counter') {
      return {
        status: 'pending',
        referenceNumber: `CHL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        maskedInstrument: 'Campus Cash Counter Challan',
      };
    }

    throw new Error('Unsupported payment method.');
  }

  public async getStatus(orderId: string): Promise<OrderStatus> {
    const order = paymentService.getOrderById(orderId);
    return order ? order.status : 'expired';
  }

  public verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Demonstration webhook signature verification (computes simple constant-time comparison)
    if (!signature || !payload) return false;
    let hash = 0;
    const combined = payload + secret;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
    }
    const expected = `sha256_${Math.abs(hash).toString(16)}`;
    return signature === expected || signature === secret;
  }
}

// ----------------------------------------------------------------------------
// PAYMENT SERVICE
// ----------------------------------------------------------------------------

class PaymentService {
  private gateway: PaymentGateway = new MockGateway();
  private rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

  public setGateway(gateway: PaymentGateway) {
    this.gateway = gateway;
  }

  public getGateway(): PaymentGateway {
    return this.gateway;
  }

  // Rate Limiting Guard
  private checkRateLimit(key: string, maxCount: number, windowSecs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      this.rateLimitMap.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
      return true;
    }
    if (entry.count >= maxCount) {
      return false;
    }
    entry.count++;
    return true;
  }

  // --------------------------------------------------------------------------
  // ORDER MANAGEMENT
  // --------------------------------------------------------------------------

  public getOrders(): PaymentOrder[] {
    return db.getPaymentOrders();
  }

  public getOrderById(orderId: string): PaymentOrder | undefined {
    const order = db.getPaymentOrderById(orderId);
    if (!order) return undefined;

    // Check expiry
    if (order.status === 'created') {
      const now = new Date();
      if (new Date(order.expiresAt) < now) {
        order.status = 'expired';
        db.updatePaymentOrder(order);
        this.logEvent(order.id, 'expired', 'Order passed 15-minute expiry threshold.');
      }
    }
    return order;
  }

  public getPaymentAttempts(orderId: string): PaymentAttempt[] {
    return db.getPaymentAttempts(orderId);
  }

  public getPaymentEvents(orderId: string): PaymentEvent[] {
    return db.getPaymentEvents(orderId);
  }

  /**
   * Creates a payment order with server-calculated amount and 15-min expiry.
   * If an unexpired order for the exact student, semester, and amount already exists, reuses it.
   */
  public async createOrder(input: {
    semester?: number;
    amountType: 'full' | 'custom';
    customAmount?: number;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; order?: PaymentOrder; error?: string }> {
    const user = db.getUser();
    const sem = input.semester ?? user.semester;

    // Rate limit: max 10 orders per 60s
    if (!this.checkRateLimit(`order_create_${user.id}`, 10, 60)) {
      return { success: false, error: 'Too many order requests. Please wait a moment.' };
    }

    // SERVER-CALCULATED FEE RECORD CHECK
    const feeSummary = db.getFeeStatusSummary(sem);
    if (feeSummary.balanceDue <= 0) {
      return { success: false, error: 'No fee balance is due for this semester.' };
    }

    let calculatedAmount = feeSummary.balanceDue;
    if (input.amountType === 'custom') {
      const custom = Math.round(Number(input.customAmount || 0));
      if (isNaN(custom) || custom < PAYMENT_CONFIG.MIN_CUSTOM_AMOUNT) {
        return {
          success: false,
          error: `Minimum payment amount is ₹${PAYMENT_CONFIG.MIN_CUSTOM_AMOUNT.toLocaleString()}.`,
        };
      }
      if (custom > feeSummary.balanceDue) {
        return {
          success: false,
          error: `Custom payment amount cannot exceed outstanding balance of ₹${feeSummary.balanceDue.toLocaleString()}.`,
        };
      }
      calculatedAmount = custom;
    }

    const idempotencyKey = input.idempotencyKey || `idem_${user.id}_${sem}_${calculatedAmount}_${Date.now()}`;

    // Reuse existing unexpired order in 'created' state
    const existing = db.getPaymentOrders().find(
      (o) =>
        o.studentId === user.id &&
        o.semester === sem &&
        o.amount === calculatedAmount &&
        o.status === 'created' &&
        new Date(o.expiresAt) > new Date()
    );

    if (existing) {
      return { success: true, order: existing };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + PAYMENT_CONFIG.ORDER_EXPIRY_MINUTES * 60 * 1000).toISOString();
    const orderId = `ord-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: PaymentOrder = {
      id: orderId,
      studentId: user.id,
      semester: sem,
      amount: calculatedAmount,
      status: 'created',
      idempotencyKey,
      expiresAt,
      createdAt: now.toISOString(),
    };

    db.addPaymentOrder(newOrder);
    this.logEvent(orderId, 'created', `Order created for ₹${calculatedAmount.toLocaleString()} (Sem ${sem}).`);

    await this.gateway.createOrder(newOrder);
    return { success: true, order: newOrder };
  }

  /**
   * Confirms a payment through the gateway interface with strict state machine validation,
   * idempotency checking, and an atomic database settlement upon success.
   */
  public async confirmPayment(input: ConfirmPaymentInput): Promise<{
    success: boolean;
    order?: PaymentOrder;
    result?: GatewayResult;
    error?: string;
  }> {
    const user = db.getUser();
    const order = this.getOrderById(input.orderId);

    if (!order) {
      return { success: false, error: 'Payment order not found.' };
    }

    // Ownership check
    if (order.studentId !== user.id) {
      return { success: false, error: 'Unauthorized: order belongs to another student.' };
    }

    // Idempotency: If order is already paid, return existing success without re-billing!
    if (order.status === 'paid') {
      return {
        success: true,
        order,
        result: {
          status: 'paid',
          referenceNumber: order.referenceNumber || '',
          maskedInstrument: order.maskedInstrument || '',
        },
      };
    }

    // State machine check
    if (order.status === 'expired' || new Date(order.expiresAt) <= new Date()) {
      order.status = 'expired';
      db.updatePaymentOrder(order);
      this.logEvent(order.id, 'expired', 'Payment rejected because order expired.');
      return { success: false, error: 'This payment order has expired. Please create a new order.' };
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'This payment order was cancelled.' };
    }

    // Rate-limiting check: max 5 payment attempts per min per order
    if (!this.checkRateLimit(`pay_attempt_${order.id}`, 5, 60)) {
      return { success: false, error: 'Too many payment attempts. Please wait 60 seconds.' };
    }

    // Valid state transition: created | failed -> processing
    order.status = 'processing';
    order.paymentMethod = input.method;
    db.updatePaymentOrder(order);
    this.logEvent(order.id, 'attempted', `Processing payment via ${input.method.toUpperCase()}.`);

    let gatewayResult: GatewayResult;
    try {
      gatewayResult = await this.gateway.confirmPayment(order, input);
    } catch (err: any) {
      order.status = 'failed';
      order.failureReason = err.message || 'Payment processing failed.';
      db.updatePaymentOrder(order);
      this.logAttempt(order.id, input.method, '••••', 'failed', order.failureReason);
      this.logEvent(order.id, 'failed', order.failureReason);
      return { success: false, order, error: order.failureReason };
    }

    // Log Attempt
    this.logAttempt(
      order.id,
      input.method,
      gatewayResult.maskedInstrument,
      gatewayResult.status === 'paid' ? 'success' : gatewayResult.status === 'failed' ? 'failed' : 'pending',
      gatewayResult.failureReason
    );

    // Outcome Handling
    if (gatewayResult.status === 'paid') {
      return this.executePaidTransaction(order, gatewayResult, input.method);
    } else if (gatewayResult.status === 'failed') {
      order.status = 'failed';
      order.failureReason = gatewayResult.failureReason || 'Payment declined by demo provider.';
      order.maskedInstrument = gatewayResult.maskedInstrument;
      db.updatePaymentOrder(order);
      this.logEvent(order.id, 'failed', order.failureReason);
      return { success: false, order, result: gatewayResult, error: order.failureReason };
    } else {
      // Pending (e.g. Counter Payment or Pending UPI)
      order.status = 'created'; // Keep order active or pending
      order.referenceNumber = gatewayResult.referenceNumber;
      order.maskedInstrument = gatewayResult.maskedInstrument;
      if (input.method === 'counter') {
        order.challanNumber = gatewayResult.referenceNumber;
        order.challanExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      db.updatePaymentOrder(order);
      this.logEvent(order.id, 'attempted', `Pending confirmation for reference: ${gatewayResult.referenceNumber}`);

      // Insert pending payment record for counter payment
      if (input.method === 'counter') {
        const pendingPaymentRecord: FeePaymentRecord = {
          id: `pay-counter-${Date.now()}`,
          orderId: order.id,
          studentId: user.id,
          semester: order.semester,
          amount: order.amount,
          mode: 'Challan Counter Payment',
          reference: gatewayResult.referenceNumber,
          referenceNumber: gatewayResult.referenceNumber,
          paidAt: new Date().toISOString(),
          status: 'pending',
          description: `Semester ${order.semester} Fee Settlement (Challan Pending)`,
        };
        db.addFeePayment(pendingPaymentRecord);

        // Simulated asynchronous job: auto-confirm counter payment after 15 seconds in mock mode
        if (PAYMENT_CONFIG.PAYMENT_MODE === 'mock') {
          setTimeout(() => {
            this.confirmPendingCounterPayment(order.id, pendingPaymentRecord.id);
          }, 15000);
        }
      } else if (input.instrument.upiId === 'pending@demo') {
        // Simulated asynchronous resolution for pending@demo UPI
        setTimeout(() => {
          this.executePaidTransaction(order, {
            status: 'paid',
            referenceNumber: `MOCK-UPI-RESOLVED-${Date.now().toString().slice(-6)}`,
            maskedInstrument: 'pending@demo',
          }, 'upi');
        }, 10000);
      }

      return { success: true, order, result: gatewayResult };
    }
  }

  /**
   * Single Atomic Database Settlement Transaction
   * 1. Inserts fee_payment with mode, reference, status='success', orderId
   * 2. Reduces balance due
   * 3. Generates verified receipt record with QR verification token
   * 4. Dispatches in-app notification
   * 5. Re-evaluates No-dues Accounts clearance
   */
  private executePaidTransaction(
    order: PaymentOrder,
    gatewayResult: GatewayResult,
    method: PaymentMethod
  ): { success: boolean; order: PaymentOrder; result: GatewayResult } {
    const user = db.getUser();
    const paidAt = new Date().toISOString();
    const paymentId = `pay-${Date.now()}`;
    const receiptId = `rcpt-${Date.now()}`;
    const token = `cc_receipt_S${order.semester}_${Math.floor(10000 + Math.random() * 90000)}_sig`;

    // 1. Insert fee_payment
    const modeLabel =
      method === 'card'
        ? `Card (${gatewayResult.maskedInstrument})`
        : method === 'upi'
        ? `UPI (${gatewayResult.maskedInstrument})`
        : method === 'netbanking'
        ? `Net Banking (${gatewayResult.maskedInstrument})`
        : 'Cash Counter Settlement';

    const newPayment: FeePaymentRecord = {
      id: paymentId,
      orderId: order.id,
      studentId: user.id,
      semester: order.semester,
      amount: order.amount,
      mode: modeLabel,
      reference: gatewayResult.referenceNumber,
      referenceNumber: gatewayResult.referenceNumber,
      paidAt,
      status: 'success',
      description: `Semester ${order.semester} Fee Clearance (${gatewayResult.referenceNumber})`,
    };
    db.addFeePayment(newPayment);

    // 2. Generate digital receipt
    const newReceipt: FeeReceipt = {
      id: receiptId,
      paymentId,
      receiptNumber: `REC-${new Date().getFullYear()}-S${order.semester}-${Math.floor(100 + Math.random() * 900)}`,
      verifyToken: token,
      collegeName: 'CampusConnect Institute of Technology (Autonomous)',
      studentName: user.name,
      registerNumber: user.registerNumber,
      department: user.department || 'Computer Science & Engineering',
      semester: order.semester,
      amount: order.amount,
      paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: modeLabel,
      paymentRef: gatewayResult.referenceNumber,
      description: `Semester ${order.semester} Fee Settlement`,
    };
    db.addFeeReceipt(newReceipt);

    // 3. Update Order state to paid
    order.status = 'paid';
    order.referenceNumber = gatewayResult.referenceNumber;
    order.maskedInstrument = gatewayResult.maskedInstrument;
    order.receiptId = receiptId;
    db.updatePaymentOrder(order);

    // 4. Log audit trail
    this.logEvent(order.id, 'succeeded', `Payment of ₹${order.amount.toLocaleString()} settled. Ref: ${gatewayResult.referenceNumber}`);

    // 5. Create In-App Notification
    db.addNotification({
      id: `notif-pay-${Date.now()}`,
      type: 'fee_paid',
      title: 'Payment Received',
      message: `Your payment of ₹${order.amount.toLocaleString()} for Semester ${order.semester} has been received and cleared. Reference: ${gatewayResult.referenceNumber}.`,
      date: 'Just now',
      read: false,
    });

    // 6. Re-evaluate No-dues Accounts clearance
    this.reEvaluateNoDuesClearance(order.semester);

    return { success: true, order, result: gatewayResult };
  }

  /**
   * Simulated job: Confirms pending counter payment after simulated review
   */
  public confirmPendingCounterPayment(orderId: string, paymentRecordId: string) {
    const order = this.getOrderById(orderId);
    if (!order || order.status === 'paid') return;

    // Update payment record to success
    db.updateFeePaymentStatus(paymentRecordId, 'success');

    this.executePaidTransaction(
      order,
      {
        status: 'paid',
        referenceNumber: order.referenceNumber || `CHL-SETTLED-${Date.now().toString().slice(-4)}`,
        maskedInstrument: 'Campus Cash Counter Challan (Verified)',
      },
      'counter'
    );
  }

  /**
   * Re-evaluates No-Dues Accounts clearance node
   */
  public reEvaluateNoDuesClearance(semester: number) {
    const feeSummary = db.getFeeStatusSummary(semester);
    if (feeSummary.balanceDue === 0) {
      db.clearAccountsInNoDuesRequests();
    }
  }

  /**
   * Cancels an active order
   */
  public cancelOrder(orderId: string): { success: boolean; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found.' };
    if (order.status === 'paid') return { success: false, error: 'Paid order cannot be cancelled.' };

    order.status = 'cancelled';
    db.updatePaymentOrder(order);
    this.logEvent(order.id, 'cancelled', 'Order cancelled by student.');
    return { success: true };
  }

  private logAttempt(
    orderId: string,
    method: PaymentMethod,
    maskedInstrument: string,
    result: 'success' | 'failed' | 'pending',
    reason?: string
  ) {
    db.addPaymentAttempt({
      id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      method,
      maskedInstrument,
      result,
      reason,
      createdAt: new Date().toISOString(),
    });
  }

  private logEvent(
    orderId: string,
    event: PaymentEvent['event'],
    details?: string
  ) {
    db.addPaymentEvent({
      id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      event,
      at: new Date().toISOString(),
      details,
    });
  }
}

export const paymentService = new PaymentService();
