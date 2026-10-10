import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { COLLEGE_PAYMENT_URL } from '../../services/collegeRecords';
import type { FeePaymentRecord } from '../../services/collegeRecords';
import { paymentService } from '../../services/paymentService';
import { navigate } from '../../utils/navigation';
import {
  Download,
  ExternalLink,
  Building,
  CreditCard,
  Eye,
  X,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const user = db.getUser();
  const [selectedSemester, setSelectedSemester] = useState<number>(user.semester);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPaymentForDrawer, setSelectedPaymentForDrawer] = useState<FeePaymentRecord | null>(null);

  const feeData = useMemo(() => {
    return db.getFeeStatusSummary(selectedSemester);
  }, [selectedSemester]);

  // Generate and download printable PDF / Receipt
  const handleDownloadReceipt = (payment: FeePaymentRecord) => {
    setDownloadingId(payment.id);
    const receipt = db.getFeeReceiptById(payment.id);
    const verifyToken = receipt?.verifyToken || `cc_rcpt_${payment.id}`;
    const verifyUrl = `${window.location.origin}/receipts/verify/${verifyToken}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      verifyUrl
    )}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setDownloadingId(null);
      return;
    }

    const refNum = payment.referenceNumber || payment.reference || 'N/A';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Fee Receipt - ${refNum}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; max-width: 700px; margin: 0 auto; }
          .header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
          .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
          .receipt-badge { font-family: monospace; font-size: 14px; font-weight: bold; padding: 6px 12px; background: #f0f0f0; border-radius: 6px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; font-size: 13px; }
          .meta-grid dt { color: #666; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .meta-grid dd { margin: 0; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { text-align: left; padding: 10px; border-bottom: 2px solid #111; font-size: 11px; text-transform: uppercase; }
          td { padding: 12px 10px; border-bottom: 1px solid #e5e5e5; }
          .total { text-align: right; font-size: 18px; font-weight: 900; padding: 15px 0; border-bottom: 2px solid #111; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #ccc; padding-top: 25px; }
          .verify-note { font-size: 11px; color: #666; line-height: 1.5; max-width: 420px; }
          .qr-box { text-align: center; }
          .qr-box img { width: 110px; height: 110px; display: block; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">CampusConnect Institute of Technology</div>
            <div class="subtitle">Official Electronic Fee Receipt & Clearance Record</div>
          </div>
          <div class="receipt-badge">${receipt?.receiptNumber || 'REC-OFFICIAL'}</div>
        </div>

        <dl class="meta-grid">
          <div>
            <dt>Student Name</dt>
            <dd>${user.name}</dd>
          </div>
          <div>
            <dt>Register Number</dt>
            <dd>${user.registerNumber}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>B.Tech Computer Science & Engineering</dd>
          </div>
          <div>
            <dt>Semester</dt>
            <dd>Semester ${payment.semester}</dd>
          </div>
          <div>
            <dt>Transaction Reference</dt>
            <dd>${refNum}</dd>
          </div>
          <div>
            <dt>Payment Date & Mode</dt>
            <dd>${payment.paidAt} (${payment.mode})</dd>
          </div>
        </dl>

        <table>
          <thead>
            <tr>
              <th>Fee Description</th>
              <th>Semester</th>
              <th style="text-align: right;">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${payment.description}</strong><br/><small style="color: #666;">Official college record fee clearance</small></td>
              <td>Semester ${payment.semester}</td>
              <td style="text-align: right; font-weight: 800;">₹${payment.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total Settled: ₹${payment.amount.toLocaleString()}
        </div>

        <div class="footer">
          <div class="verify-note">
            This digital receipt is tamper-evident and generated directly from college records.<br/>
            Scan the verification QR code or visit: <br/>
            <code>${verifyUrl}</code>
          </div>
          <div class="qr-box">
            <img src="${qrCodeUrl}" alt="Verification QR Code" />
            <div style="font-size: 9px; font-weight: 700; color: #666; margin-top: 4px;">SCAN TO VERIFY</div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setDownloadingId(null);
  };

  const isPaid = feeData.status === 'Paid';
  const isOverdue = feeData.status === 'Overdue';

  const drawerEvents = useMemo(() => {
    if (!selectedPaymentForDrawer || !selectedPaymentForDrawer.orderId) return [];
    return paymentService.getPaymentEvents(selectedPaymentForDrawer.orderId);
  }, [selectedPaymentForDrawer]);

  return (
    <PortalLayout currentPath="/fees" title="Fee Structure & Receipts">
      <div className="space-y-6">
        {/* Top Header & Semester Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
              <span>ACADEMIC FINANCE</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">OFFICIAL COLLEGE RECORDS</span>
            </div>
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              FEES & RECEIPTS
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="semester-filter" className="text-xs font-mono text-neutral-400">
              Select Semester:
            </label>
            <select
              id="semester-filter"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="bg-[var(--app-surface)] text-[var(--app-text)] text-xs font-bold px-3 py-2 rounded-xl border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-text)]"
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem} {sem === user.semester ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            1. SUMMARY CARD
            Total fee, paid, balance due, due date, status chip (Paid, Due soon, Overdue)
            ========================================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
                  SEMESTER {selectedSemester} ACCOUNT STATUS
                </span>
                {/* Status Chip */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    isPaid
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : isOverdue
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {feeData.status}
                </span>
              </div>
              <h2 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
                Balance Due: ₹{feeData.balanceDue.toLocaleString()}
              </h2>
            </div>

            {/* Pay Now Button (shown only when a balance is due) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {feeData.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/fees/pay')}
                  className="px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              )}

              {/* Secondary link: only shown if real COLLEGE_PAYMENT_URL is configured */}
              {COLLEGE_PAYMENT_URL ? (
                <a
                  href={COLLEGE_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-[var(--app-border)] text-neutral-400 hover:text-[var(--app-text)] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open college portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--app-border)] text-xs">
            <div>
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Total Semester Fee</span>
              <span className="font-montserrat font-black text-lg text-[var(--app-text)]">
                ₹{feeData.totalFee.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Paid to Date</span>
              <span className="font-montserrat font-black text-lg text-emerald-600 dark:text-emerald-400">
                ₹{feeData.paid.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Fee Due Date</span>
              <span className="font-montserrat font-black text-lg text-[var(--app-text)]">
                {feeData.dueDate}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Clearance Status</span>
              <span className={`font-montserrat font-black text-lg ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {isPaid ? 'Fully Cleared' : 'Action Required'}
              </span>
            </div>
          </div>

          {/* No-Dues Clearance Notice */}
          <div className="p-3.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>
                <span className="font-bold text-[var(--app-text)]">Accounts Clearance in No-Dues Tracker:</span>{' '}
                {isPaid ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Cleared. Verified zero outstanding balance.
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    Pending payment of ₹{feeData.balanceDue.toLocaleString()}.
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="text-xs font-bold text-neutral-400 hover:text-[var(--app-text)] underline cursor-pointer shrink-0"
            >
              View Approvals
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. TWO-COLUMN LAYOUT:
            Left (1/3): Breakdown by component
            Right (2/3): Payment History & Receipts with Status Chips and Details Drawer
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Breakdown Table (1/3) */}
          <div className="p-5 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                Fee Component Breakdown
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                {feeData.breakdown.length} components
              </span>
            </div>

            <div className="divide-y divide-[var(--app-border)] text-xs">
              {feeData.breakdown.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[var(--app-text)]">{item.component}</p>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Official Fee Head
                    </span>
                  </div>
                  <span className="font-montserrat font-black text-[var(--app-text)]">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs font-extrabold">
              <span className="text-neutral-400 uppercase font-mono">Total Payable</span>
              <span className="font-montserrat font-black text-base text-[var(--app-text)]">
                ₹{feeData.totalFee.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment History Table (2/3) */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                Payment History & Receipts
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                {feeData.payments.length} transaction{feeData.payments.length === 1 ? '' : 's'}
              </span>
            </div>

            {feeData.payments.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 space-y-2">
                <img
                  src="/mascots/06-Request tracker.png"
                  alt="No payment history"
                  className="w-32 h-32 object-contain mx-auto opacity-70"
                />
                <p className="text-xs">No payment records found for Semester {selectedSemester}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--app-border)] text-[10px] font-mono text-neutral-400 uppercase">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Ref Number</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {feeData.payments.map((p) => {
                      const isSuccess = p.status === 'success';
                      const isFailed = p.status === 'failed';
                      const isPending = p.status === 'pending';

                      return (
                        <tr key={p.id} className="hover:bg-[var(--app-surface-subtle)]/40 transition">
                          <td className="p-2.5 font-mono text-neutral-400 whitespace-nowrap">
                            {new Date(p.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="p-2.5 font-bold text-[var(--app-text)] max-w-[160px] truncate">{p.description}</td>
                          <td className="p-2.5 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                            {p.referenceNumber || p.reference}
                          </td>
                          <td className="p-2.5 font-montserrat font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            ₹{p.amount.toLocaleString()}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                isSuccess
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : isFailed
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                  : isPending
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30'
                              }`}
                            >
                              {isSuccess ? 'Paid' : isFailed ? 'Failed' : isPending ? 'Pending' : 'Cancelled'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-neutral-400 max-w-[120px] truncate">{p.mode}</td>
                          <td className="p-2.5 text-right whitespace-nowrap space-x-1.5">
                            {/* View details drawer */}
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentForDrawer(p)}
                              className="px-2.5 py-1 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                              title="View details & audit trail"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>

                            {/* Download Receipt: ONLY for paid items */}
                            {isSuccess && (
                              <button
                                type="button"
                                onClick={() => handleDownloadReceipt(p)}
                                disabled={downloadingId === p.id}
                                className="px-2.5 py-1 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. PAYMENT DETAILS & AUDIT TRAIL DRAWER
            ========================================================================= */}
        {selectedPaymentForDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedPaymentForDrawer(null)}
            />

            {/* Drawer */}
            <div className="relative bg-[var(--app-surface)] w-full max-w-md h-full shadow-2xl border-l border-[var(--app-border)] p-6 overflow-y-auto space-y-6 z-10 flex flex-col justify-between animate-in slide-in-from-right">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      Transaction Record
                    </span>
                    <h3 className="font-montserrat font-black text-lg text-[var(--app-text)]">
                      Payment Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentForDrawer(null)}
                    className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedPaymentForDrawer.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : selectedPaymentForDrawer.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {selectedPaymentForDrawer.status === 'success'
                          ? 'Settled & Cleared'
                          : selectedPaymentForDrawer.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Amount</span>
                      <span className="font-montserrat font-black text-base text-[var(--app-text)]">
                        ₹{selectedPaymentForDrawer.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Reference</span>
                      <span className="font-mono font-bold text-[var(--app-text)]">
                        {selectedPaymentForDrawer.referenceNumber || selectedPaymentForDrawer.reference}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Mode</span>
                      <span className="font-bold text-[var(--app-text)]">{selectedPaymentForDrawer.mode}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Timestamp</span>
                      <span className="font-mono text-neutral-400">{selectedPaymentForDrawer.paidAt}</span>
                    </div>
                  </div>

                  {/* Audit Trail Events */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                      Audit Trail & Gateway Events
                    </span>

                    {drawerEvents.length === 0 ? (
                      <p className="text-[11px] text-neutral-400 italic">
                        Official ledger entry settled from college record archives.
                      </p>
                    ) : (
                      <div className="space-y-2 border-l-2 border-[var(--app-border)] pl-3 ml-1.5">
                        {drawerEvents.map((evt) => (
                          <div key={evt.id} className="text-[11px] space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black uppercase text-[10px] text-[var(--app-text)]">
                                {evt.event}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {new Date(evt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-neutral-400 text-[10px]">{evt.details || 'Event logged by payment state machine.'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-[var(--app-border)] flex items-center gap-2">
                {selectedPaymentForDrawer.status === 'success' && (
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(selectedPaymentForDrawer)}
                    className="flex-1 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForDrawer(null)}
                  className="px-4 py-2.5 rounded-full border border-[var(--app-border)] font-bold text-xs text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
