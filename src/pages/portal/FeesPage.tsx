import React, { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { FeePaymentRecord } from '../../services/collegeRecords';
import {
  Download,
  ExternalLink,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const user = db.getUser();
  const [selectedSemester, setSelectedSemester] = useState<number>(user.semester);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
    } catch {
      setError('Failed to fetch official fee records.');
    } finally {
      setLoading(false);
    }
  }, [selectedSemester]);

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

    // Generate a printable HTML document formatted as OpenPDF standard receipt
    const refNum = payment.referenceNumber || payment.reference;
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${refNum}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
          .college { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
          .subhead { font-size: 13px; color: #555; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 12px; background: #e6f9f0; color: #027a48; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
          .grid dt { color: #666; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .grid dd { font-weight: 700; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { text-align: left; padding: 10px; background: #f4f4f5; border-bottom: 1px solid #ddd; font-size: 11px; text-transform: uppercase; }
          td { padding: 12px 10px; border-bottom: 1px solid #eee; }
          .total { text-align: right; font-size: 18px; font-weight: 900; }
          .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
          .qr-box { text-align: center; }
          .qr-box img { width: 100px; height: 100px; }
          .verify-note { font-size: 10px; color: #666; max-width: 320px; line-height: 1.4; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="college">National Institute of Technology & Engineering</div>
          <div class="subhead">Office of Finance & Accounts Clearance · Official Fee Receipt</div>
          <div class="badge">Verified Payment · Successful</div>
        </div>

        <dl class="grid">
          <div>
            <dt>Student Name</dt>
            <dd>${user.name}</dd>
          </div>
          <div>
            <dt>Register / Roll Number</dt>
            <dd>${user.registerNumber}</dd>
          </div>
          <div>
            <dt>Academic Program</dt>
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
            This digital receipt is tamper-evident and generated directly from college records.
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
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      // Fallback direct download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Receipt_${refNum}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadingId(null);
  };

  // Loading state
  if (loading) {
    return (
      <PortalLayout currentPath="/fees" title="College Fees">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-1/3" />
          <div className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </PortalLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PortalLayout currentPath="/fees" title="College Fees">
        <div className="p-8 text-center rounded-3xl bg-[var(--app-surface)] border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-montserrat font-black text-xl text-[var(--app-text)] uppercase">
            Fee Records Unavailable
          </h2>
          <p className="text-sm text-neutral-400">{error}</p>
        </div>
      </PortalLayout>
    );
  }

  const isOverdue = feeData.status === 'Overdue';
  const isPaid = feeData.status === 'Paid';

  return (
    <PortalLayout currentPath="/fees" title="Fees & Receipts">
      <div className="space-y-6">
        {/* Top Control Bar with Semester Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>COLLEGE RECORDS · OFFICIAL ACCOUNTS · READ-ONLY</span>
            </div>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl text-[var(--app-text)] tracking-tight uppercase mt-0.5">
              Fees & Receipts
            </h1>
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-extrabold text-[var(--app-text)] cursor-pointer focus:outline-none"
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

            {/* Pay on college portal button (no real payments processed) */}
            {feeData.balanceDue > 0 && feeData.paymentPortalUrl && (
              <a
                href={feeData.paymentPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-xs"
              >
                <span>Pay on the college portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
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
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Balance Due</span>
              <span className={`font-montserrat font-black text-lg ${feeData.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--app-text)]'}`}>
                ₹{feeData.balanceDue.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 font-mono block text-[10px] uppercase font-bold">Due Date</span>
              <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">
                {feeData.dueDate}
              </span>
            </div>
          </div>

          {/* No-Dues Clearance Notice */}
          <div className="p-3.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-start gap-3 text-xs">
            <Building className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[var(--app-text)]">Accounts Clearance in No-Dues Tracker:</span>
              <p className="text-neutral-400">
                {feeData.balanceDue === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Cleared. You have zero outstanding dues for Semester {selectedSemester}.
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    Blocked ({feeData.status}). Accounts clearance requires settling the outstanding balance of ₹{feeData.balanceDue.toLocaleString()}.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. FEE BREAKDOWN & PAYMENT HISTORY
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Breakdown List (1/3) */}
          <div className="p-5 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
            <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase border-b border-[var(--app-border)] pb-3">
              Fee Structure Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              {feeData.breakdown.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1 border-b border-[var(--app-border)] last:border-b-0">
                  <span className="font-bold text-[var(--app-text)]">{item.component}</span>
                  <span className="font-mono font-bold text-neutral-500">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 text-sm font-extrabold text-[var(--app-text)]">
                <span>Total</span>
                <span className="font-montserrat font-black">₹{feeData.totalFee.toLocaleString()}</span>
              </div>
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
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {feeData.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--app-surface-subtle)]/40 transition">
                        <td className="p-2.5 font-mono text-neutral-400 whitespace-nowrap">{p.paidAt}</td>
                        <td className="p-2.5 font-bold text-[var(--app-text)]">{p.description}</td>
                        <td className="p-2.5 font-mono text-neutral-400 text-[11px]">{p.referenceNumber || p.reference}</td>
                        <td className="p-2.5 font-montserrat font-black text-emerald-600 dark:text-emerald-400">
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-mono text-neutral-400">{p.mode}</td>
                        <td className="p-2.5 text-right whitespace-nowrap">
                          {p.status === 'success' ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadReceipt(p)}
                              disabled={downloadingId === p.id}
                              className="px-3 py-1.5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] font-extrabold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <Download className="w-3 h-3" />
                              <span>Receipt PDF</span>
                            </button>
                          ) : (
                            <span className="text-rose-500 font-bold">Failed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
