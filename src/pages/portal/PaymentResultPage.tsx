import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { paymentService, type PaymentOrder } from '../../services/paymentService';
import { navigate } from '../../utils/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Download,
  ArrowRight,
  RefreshCw,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export const PaymentResultPage: React.FC = () => {
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[3] || '';

  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/fees');
      return;
    }

    const o = paymentService.getOrderById(orderId);
    setOrder(o || null);
    setLoading(false);
  }, [orderId]);

  const handleDownloadReceipt = () => {
    if (!order || !order.receiptId) return;
    const receipt = db.getFeeReceiptById(order.receiptId);
    if (!receipt) return;

    // Generate printable receipt with QR verification window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
      window.location.origin + '/receipts/verify/' + receipt.verifyToken
    )}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; max-width: 650px; margin: auto; }
          .header { border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 20px; font-weight: 900; text-transform: uppercase; }
          .rcpt-no { font-family: monospace; font-size: 13px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 13px; }
          .total { font-size: 16px; font-weight: 900; text-align: right; margin-top: 15px; }
          .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
          .qr { text-align: center; font-size: 9px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${receipt.collegeName}</div>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">Official Electronic Fee Receipt</div>
          </div>
          <div class="rcpt-no">${receipt.receiptNumber}</div>
        </div>
        <div>
          <p><strong>Student Name:</strong> ${receipt.studentName}</p>
          <p><strong>Register Number:</strong> ${receipt.registerNumber}</p>
          <p><strong>Department:</strong> ${receipt.department} · Sem ${receipt.semester}</p>
          <p><strong>Payment Reference:</strong> ${receipt.paymentRef}</p>
          <p><strong>Date & Method:</strong> ${receipt.paidDate} (${receipt.paymentMode})</p>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th style="text-align: right;">Amount Paid</th></tr>
          </thead>
          <tbody>
            <tr><td>${receipt.description}</td><td style="text-align: right;">₹${receipt.amount.toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div class="total">Total Settled: ₹${receipt.amount.toLocaleString()}</div>
        <div class="footer">
          <div style="font-size: 11px; color: #555; max-width: 400px;">
            This electronic receipt is tamper-evident and generated directly from college records.<br/>
            Scan QR code to verify validity on the institutional verification registry.
          </div>
          <div class="qr">
            <img src="${qrCodeUrl}" width="100" height="100" alt="Verification QR" /><br/>
            SCAN TO VERIFY
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintChallan = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Counter Payment Challan - ${order.challanNumber || order.referenceNumber}</title>
        <style>
          body { font-family: monospace; padding: 40px; color: #111; max-width: 600px; margin: auto; }
          .border-box { border: 2px dashed #333; padding: 25px; border-radius: 12px; }
          .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px; }
          p { margin: 8px 0; font-size: 13px; }
          .amt { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="border-box">
          <div class="title">CAMPUSCONNECT ACCOUNTS CASHIER CHALLAN</div>
          <p><strong>Challan Ref:</strong> ${order.challanNumber || order.referenceNumber}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Student:</strong> Aarav Sharma (2023CS0142)</p>
          <p><strong>Academic Semester:</strong> Semester ${order.semester}</p>
          <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
          <div class="amt">AMOUNT TO DEPOSIT: ₹${order.amount.toLocaleString()}</div>
          <p>Instructions: Present this slip at Accounts Desk (Room 102). Cash or DD accepted.</p>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading || !order) {
    return (
      <PortalLayout currentPath="/fees" title="Payment Status">
        <div className="p-12 text-center text-neutral-400">Loading outcome...</div>
      </PortalLayout>
    );
  }

  // 1. OUTCOME: SUCCESS (PAID)
  if (order.status === 'paid') {
    return (
      <PortalLayout currentPath="/fees" title="Payment Successful">
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Transaction Approved · Demo Mode
            </span>
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              Payment of ₹{order.amount.toLocaleString()} Received
            </h1>
            <p className="text-xs text-neutral-400">
              Your Semester {order.semester} fee account has been credited and cleared in full.
            </p>
          </div>

          <img
            src="/mascots/06-Request_tracker.webp"
            alt="Payment confirmed"
            className="w-36 h-36 object-contain mx-auto drop-shadow-md"
          />

          {/* Details Table */}
          <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] divide-y divide-[var(--app-border)] text-xs text-left">
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-400">Transaction Reference</span>
              <span className="font-mono font-bold text-[var(--app-text)]">{order.referenceNumber}</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-400">Payment Instrument</span>
              <span className="font-bold text-[var(--app-text)]">{order.maskedInstrument || 'Verified Card'}</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-400">Settled At</span>
              <span className="font-mono text-neutral-400">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-400">No-Dues Clearance</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Accounts Node Cleared</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Receipt PDF</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/fees')}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] font-bold text-xs text-[var(--app-text)] transition cursor-pointer"
            >
              <span>Back to Fee Summary</span>
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // 2. OUTCOME: PENDING (COUNTER PAYMENT / CHALLAN)
  if (order.challanNumber || order.paymentMethod === 'counter') {
    return (
      <PortalLayout currentPath="/fees" title="Challan Generated">
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-500/30">
            <Receipt className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Pending Counter Deposit · Challan Issued
            </span>
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              Challan Slip Generated
            </h1>
            <p className="text-xs text-neutral-400">
              Reference: <strong className="font-mono text-[var(--app-text)]">{order.challanNumber || order.referenceNumber}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-left space-y-3">
            <p className="font-bold text-[var(--app-text)]">Next Steps for Cash/DD Clearance:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400">
              <li>Print the generated counter payment slip below.</li>
              <li>Present the slip with cash or cheque at Accounts Counter, Administrative Block (Room 102).</li>
              <li>The cashier enters the reference into the terminal. Dues clear automatically upon entry.</li>
            </ol>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-2 border-t border-[var(--app-border)] font-mono">
              Demo Simulation: In mock mode, counter challans are automatically verified by the background simulator.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrintChallan}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Challan Slip</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/fees')}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] font-bold text-xs text-[var(--app-text)] transition cursor-pointer"
            >
              <span>Back to Fees</span>
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // 3. OUTCOME: FAILED
  if (order.status === 'failed') {
    return (
      <PortalLayout currentPath="/fees" title="Payment Failed">
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border-2 border-rose-500/30">
            <XCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Transaction Declined (Simulated)
            </span>
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              Payment Could Not Be Completed
            </h1>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              {order.failureReason || 'Declined by payment provider.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-neutral-400 text-left space-y-2">
            <p>
              Your fee account balance remains unchanged. You can try again using a different test card (e.g. <code>4111 1111 1111 1111</code>) or another payment method.
            </p>
            <p className="font-mono text-[11px]">
              Order ID: {order.id} · Amount: ₹{order.amount.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/fees/pay/${order.id}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again on Same Order</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/fees')}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] font-bold text-xs text-[var(--app-text)] transition cursor-pointer"
            >
              <span>Back to Fees</span>
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // 4. OUTCOME: CANCELLED OR EXPIRED
  return (
    <PortalLayout currentPath="/fees" title="Payment Order Expired">
      <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
          <Clock className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <h1 className="font-montserrat font-black text-2xl text-[var(--app-text)]">
            {order.status === 'cancelled' ? 'Payment Cancelled' : 'Payment Order Expired'}
          </h1>
          <p className="text-xs text-neutral-400">
            For security, payment checkout links expire after 15 minutes. No funds were charged.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fees/pay')}
          className="px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs inline-flex items-center gap-2 hover:opacity-95 transition cursor-pointer"
        >
          <span>Start a New Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </PortalLayout>
  );
};
