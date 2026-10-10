import React, { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import {
  paymentService,
  PAYMENT_CONFIG,
  TEST_CREDENTIALS,
  detectCardNetwork,
  type PaymentMethod,
  type PaymentOrder,
} from '../../services/paymentService';
import { navigate } from '../../utils/navigation';
import {
  CreditCard,
  QrCode,
  Building2,
  Receipt,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
  Lock,
  ArrowLeft,
  Info,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  // Extract orderId from URL path: /fees/pay/:orderId
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[3] || '';

  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PaymentMethod>('card');

  // Form State - Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('Aarav Sharma');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Form State - UPI
  const [upiId, setUpiId] = useState('success@demo');
  const [upiVerified, setUpiVerified] = useState(true);

  // Form State - Netbanking
  const [selectedBank, setSelectedBank] = useState('Demo Bank - Success');

  // Presenter Simulation Override
  const [simulationOverride, setSimulationOverride] = useState<'success' | 'failure' | 'pending'>('success');
  const [showTestDetails, setShowTestDetails] = useState(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('Contacting bank gateway...');
  const [error, setError] = useState<string | null>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/fees');
      return;
    }

    const currentOrder = paymentService.getOrderById(orderId);
    if (!currentOrder) {
      setError('Payment order not found.');
      setLoading(false);
      return;
    }

    if (currentOrder.status === 'paid') {
      navigate(`/fees/pay/${orderId}/result`);
      return;
    }

    setOrder(currentOrder);
    setLoading(false);
  }, [orderId]);

  // Expiry Countdown Timer
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expiry = new Date(order.expiresAt).getTime();
      const diff = Math.max(0, expiry - now);

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    setError(null);
  };

  const cardNetwork = useMemo(() => {
    return detectCardNetwork(cardNumber);
  }, [cardNumber]);

  const handlePay = async () => {
    if (!order || isProcessing || isExpired) return;
    setError(null);

    // Basic validation before processing
    if (activeTab === 'card') {
      const clean = cardNumber.replace(/\D/g, '');
      if (clean.length < 16) {
        setError('Please enter a complete 16-digit card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter a valid 3-digit CVV.');
        return;
      }
    }

    if (activeTab === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. success@demo).');
        return;
      }
    }

    // Enter Processing State (1.5 to 2.5 seconds processing simulation)
    setIsProcessing(true);
    setProcessMessage('Securely verifying demo payment with gateway...');

    setTimeout(async () => {
      setProcessMessage('Authorizing transaction settlement...');

      try {
        await paymentService.confirmPayment({
          orderId: order.id,
          method: activeTab,
          idempotencyKey: order.idempotencyKey,
          instrument: {
            cardNumber,
            cardHolder,
            cardExpiry,
            cardCvv,
            upiId,
            bankName: selectedBank,
            simulationOverride: PAYMENT_CONFIG.PAYMENT_MODE === 'mock' ? simulationOverride : undefined,
          },
        });

        // Always redirect to result page for every outcome
        navigate(`/fees/pay/${order.id}/result`);
      } catch (err: any) {
        setError(err.message || 'Payment processing failed.');
        setIsProcessing(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <PortalLayout currentPath="/fees" title="Checkout">
        <div className="p-12 text-center text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading secure demo checkout...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!order) {
    return (
      <PortalLayout currentPath="/fees" title="Checkout">
        <div className="p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-montserrat font-bold text-lg text-[var(--app-text)]">
            Order Not Found
          </h2>
          <button
            type="button"
            onClick={() => navigate('/fees')}
            className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs"
          >
            Return to Fees
          </button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout currentPath="/fees" title="Checkout">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Cancel */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/fees')}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[var(--app-text)] transition cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Fees</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs font-mono">
            <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
            <span className={isExpired ? 'text-rose-500 font-bold' : 'text-neutral-400'}>
              {isExpired ? 'Order Expired' : `Expires in ${timeLeft}`}
            </span>
          </div>
        </div>

        {/* Demo Mode Persistent Banner */}
        {PAYMENT_CONFIG.PAYMENT_MODE === 'mock' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-3 text-xs font-extrabold shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <p>
              Demo mode: no real money is charged. Do not enter real card or bank details.
            </p>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--app-border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Demo Checkout</span>
            </div>
            <h1 className="font-montserrat font-black text-2xl text-[var(--app-text)] tracking-tight">
              Semester {order.semester} Fee Settlement
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Total Payable</span>
            <span className="font-montserrat font-black text-2xl text-emerald-600 dark:text-emerald-400">
              ₹{order.amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Payment Methods (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Payment Method Tabs */}
            <div
              role="tablist"
              aria-label="Payment Methods"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[var(--app-surface-subtle)] p-1.5 rounded-2xl border border-[var(--app-border)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'card'}
                onClick={() => {
                  setActiveTab('card');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  activeTab === 'card'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                    : 'text-neutral-500 hover:text-[var(--app-text)]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Card</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'upi'}
                onClick={() => {
                  setActiveTab('upi');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  activeTab === 'upi'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                    : 'text-neutral-500 hover:text-[var(--app-text)]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>UPI</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'netbanking'}
                onClick={() => {
                  setActiveTab('netbanking');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  activeTab === 'netbanking'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                    : 'text-neutral-500 hover:text-[var(--app-text)]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'counter'}
                onClick={() => {
                  setActiveTab('counter');
                  setError(null);
                }}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                  activeTab === 'counter'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                    : 'text-neutral-500 hover:text-[var(--app-text)]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>Counter</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] relative">
              {/* Full-card processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-[var(--app-surface)]/90 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full border-3 border-[var(--app-border)] border-t-[var(--app-text)] animate-spin" />
                  <div className="space-y-1">
                    <p className="font-montserrat font-black text-base text-[var(--app-text)]">
                      Processing Demo Payment
                    </p>
                    <p className="text-xs text-neutral-400 font-bold">{processMessage}</p>
                    <p className="text-[11px] text-amber-500 font-mono mt-2">
                      Please do not refresh or close this browser window.
                    </p>
                  </div>
                </div>
              )}

              {/* CARD FORM */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="card-number" className="text-xs font-bold text-[var(--app-text)] block">
                        Card Number
                      </label>
                      {cardNetwork !== 'Unknown' && (
                        <span className="text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {cardNetwork} Detected
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="card-number"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 1111 1111 1111"
                        maxLength={19}
                        disabled={isProcessing}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <label htmlFor="card-holder" className="text-xs font-bold text-[var(--app-text)] block">
                        Cardholder Name
                      </label>
                      <input
                        id="card-holder"
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Aarav Sharma"
                        disabled={isProcessing}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="card-expiry" className="text-xs font-bold text-[var(--app-text)] block">
                        Expiry (MM/YY)
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        maxLength={5}
                        disabled={isProcessing}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] font-mono text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="card-cvv" className="text-xs font-bold text-[var(--app-text)] block">
                        CVV / CVC
                      </label>
                      <input
                        id="card-cvv"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        disabled={isProcessing}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] font-mono text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                      />
                    </div>
                  </div>

                  {/* Card Quick-Fill Chips */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block mb-1.5">
                      Quick-fill test cards:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TEST_CREDENTIALS.cards.map((c) => (
                        <button
                          key={c.clean}
                          type="button"
                          onClick={() => {
                            setCardNumber(c.number);
                            setCardExpiry('12/28');
                            setCardCvv('123');
                            setError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[10px] font-mono text-neutral-400 hover:text-[var(--app-text)] transition cursor-pointer"
                        >
                          {c.label}: <strong className="text-[var(--app-text)]">{c.clean.slice(-4)}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="upi-id-input" className="text-xs font-bold text-[var(--app-text)] block">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="upi-id-input"
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setUpiVerified(false);
                          setError(null);
                        }}
                        placeholder="e.g. success@demo"
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                      />
                      <button
                        type="button"
                        onClick={() => setUpiVerified(true)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                          upiVerified
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-[var(--app-surface-subtle)] border-[var(--app-border)] text-[var(--app-text)]'
                        }`}
                      >
                        {upiVerified ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{upiVerified ? 'Verified' : 'Verify'}</span>
                      </button>
                    </div>
                  </div>

                  {/* UPI Quick-Fill Chips */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block mb-1.5">
                      Quick-fill demo UPI IDs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TEST_CREDENTIALS.upis.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setUpiId(u.id);
                            setUpiVerified(true);
                            setError(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[10px] font-mono text-neutral-400 hover:text-[var(--app-text)] transition cursor-pointer"
                        >
                          {u.id} ({u.label})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NETBANKING FORM */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="bank-selector" className="text-xs font-bold text-[var(--app-text)] block">
                      Select Demo Bank
                    </label>
                    <select
                      id="bank-selector"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                    >
                      {TEST_CREDENTIALS.banks.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name} ({b.outcome === 'success' ? 'Will Approve' : 'Will Reject'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Net banking redirects through an institutional gateway simulation without leaving the app.
                  </p>
                </div>
              )}

              {/* COUNTER PAYMENT (CHALLAN) */}
              {activeTab === 'counter' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2 text-xs">
                    <p className="font-bold text-[var(--app-text)]">
                      Cashier Desk Payment Challan
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                      Clicking "Generate Counter Challan" creates an official payment slip with a unique barcode and reference number. You can print the challan and deposit cash or a demand draft at the Finance Counter (Administrative Block, Ground Floor).
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Note: Dues will be marked cleared automatically once verified by the counter cashier.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing || isExpired}
              className="w-full py-3.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition cursor-pointer shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Demo Payment...</span>
                </>
              ) : activeTab === 'counter' ? (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Generate Counter Challan for ₹{order.amount.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{order.amount.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Order Summary & Sandbox Tools (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Order Summary Card */}
            <div className="p-5 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
              <h3 className="font-montserrat font-black text-xs text-[var(--app-text)] tracking-wider uppercase">
                Order Summary
              </h3>

              <div className="divide-y divide-[var(--app-border)] text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-400">Order ID</span>
                  <span className="font-mono font-bold text-[var(--app-text)]">{order.id}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-400">Academic Semester</span>
                  <span className="font-bold text-[var(--app-text)]">Semester {order.semester}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-400">Gateway Provider</span>
                  <span className="font-mono text-emerald-500 font-bold">Secure Sandbox</span>
                </div>
                <div className="py-2.5 flex items-center justify-between font-bold">
                  <span className="text-[var(--app-text)]">Total Payable</span>
                  <span className="font-montserrat font-black text-lg text-emerald-600 dark:text-emerald-400">
                    ₹{order.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Presenter Simulation Tool (Mock Mode Only) */}
            {PAYMENT_CONFIG.PAYMENT_MODE === 'mock' && (
              <div className="p-4 rounded-3xl bg-[var(--app-surface)] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                    Presenter Simulator
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                    Mock Active
                  </span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="sim-selector" className="text-xs font-bold text-[var(--app-text)] block">
                    Force Result Outcome:
                  </label>
                  <select
                    id="sim-selector"
                    value={simulationOverride}
                    onChange={(e: any) => setSimulationOverride(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] focus:outline-none"
                  >
                    <option value="success">Success (Will Approve & Clear)</option>
                    <option value="failure">Failure (Will Reject & Display Reason)</option>
                    <option value="pending">Pending (Will Create Pending Record)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Collapsible Test Details Panel */}
            <div className="p-4 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTestDetails(!showTestDetails)}
                className="w-full flex items-center justify-between text-left font-bold text-[var(--app-text)] cursor-pointer"
              >
                <span>Test Credentials Reference</span>
                {showTestDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTestDetails && (
                <div className="pt-2 border-t border-[var(--app-border)] space-y-2 text-[11px] text-neutral-400 leading-relaxed font-mono">
                  <p>
                    <strong className="text-[var(--app-text)]">Success Card:</strong> 4111 1111 1111 1111
                  </p>
                  <p>
                    <strong className="text-[var(--app-text)]">Declined Card:</strong> 4000 0000 0000 0002
                  </p>
                  <p>
                    <strong className="text-[var(--app-text)]">NSF Card:</strong> 4000 0000 0000 9995
                  </p>
                  <p>
                    <strong className="text-[var(--app-text)]">Success UPI:</strong> success@demo
                  </p>
                  <p>
                    <strong className="text-[var(--app-text)]">Failure UPI:</strong> fail@demo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
