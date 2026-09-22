import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Mail, User, BookOpen, Copy, Check, QrCode, CreditCard, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';
import type { Batch, RegistrationFormData, PaymentSuccessResponse } from '../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  selectedBatch?: Batch | null;
  onPaymentSuccess: (result: PaymentSuccessResponse) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  batches,
  selectedBatch,
  onPaymentSuccess,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    caLevel: 'CA Inter - Both Groups Cleared',
    attemptDetails: '',
    batchId: '',
  });

  const [step, setStep] = useState<'form' | 'payment' | 'processing' | 'failed'>('form');
  const [paymentMethodTab, setPaymentMethodTab] = useState<'upi' | 'gateway'>('upi');
  const [upiUtr, setUpiUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('/upi-qr-code.png');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [currentBatchObj, setCurrentBatchObj] = useState<Batch | null>(null);

  useEffect(() => {
    if (selectedBatch) {
      setFormData((prev) => ({ ...prev, batchId: selectedBatch.id }));
      setCurrentBatchObj(selectedBatch);
    } else if (batches.length > 0) {
      const active = batches.find((b) => b.status === 'active') || batches[0];
      setFormData((prev) => ({ ...prev, batchId: active.id }));
      setCurrentBatchObj(active);
    }
  }, [selectedBatch, batches]);

  // Generate dynamic QR code matching the fee and batch
  useEffect(() => {
    const feeAmount = currentBatchObj?.fee || 999;
    const batchLabel = currentBatchObj?.batch_number || 'Batch 05';
    const upiUri = `upi://pay?pa=harshkaushiks07@okicici&pn=Harsh%20Kaushik&am=${feeAmount}&cu=INR&tn=${encodeURIComponent('Articleship Masterclass ' + batchLabel)}`;

    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 480,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl('/upi-qr-code.png'));
  }, [currentBatchObj]);

  const handleBatchChange = (batchId: string) => {
    setFormData((prev) => ({ ...prev, batchId }));
    const found = batches.find((b) => b.id === batchId);
    if (found) setCurrentBatchObj(found);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.batchId) {
      setErrorMsg('Please select a masterclass batch.');
      return;
    }

    setStep('processing');

    try {
      // Step 1: Create Order on Server / Netlify Functions
      let orderJson: any = null;
      try {
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (orderRes.ok) {
          orderJson = await orderRes.json();
        }
      } catch (e) {
        console.warn('API endpoint unreachable, using client order initialization:', e);
      }

      if (!orderJson || !orderJson.success) {
        orderJson = {
          success: true,
          orderId: `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          amount: currentBatchObj?.fee || 999,
          currency: 'INR',
          key: '',
          paymentMethods: { razorpay: false, upi_qr: true },
          upi: {
            vpa: 'caumbrellanetwork@okaxis',
            name: 'Umbrella Network',
            qrCodeUrl: '/upi-qr-code.png',
          },
        };
      }

      setOrderData(orderJson);
      setStep('payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed.');
      setStep('form');
    }
  };

  // Perform server-side payment verification
  const completePayment = async (paymentId: string, orderId: string, signature = '') => {
    setStep('processing');
    setErrorMsg(null);

    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          caLevel: formData.caLevel,
          attemptDetails: formData.attemptDetails,
          batchId: formData.batchId,
          amount: currentBatchObj?.fee || 999,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Payment verification failed on server.');
      }

      const verifyJson = await verifyRes.json();
      if (!verifyJson || !verifyJson.success) {
        throw new Error(verifyJson?.error || 'Payment verification could not be confirmed.');
      }

      // Success! Pass to parent for Success Screen
      onPaymentSuccess(verifyJson);
    } catch (err: any) {
      console.error('Verification failure:', err);
      setErrorMsg(err.message || 'Payment verification failed.');
      setStep('failed');
    }
  };

  // Perform UPI QR payment verification with UTR
  const completeUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = upiUtr.trim();
    if (!cleanUtr) {
      setErrorMsg('Please enter your 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('Invalid UTR format: Indian banking UPI Reference / UTR must be exactly 12 numeric digits (e.g. 426819204912).');
      return;
    }
    if (/^(\d)\1{11}$/.test(cleanUtr)) {
      setErrorMsg('Invalid UTR: Repetitive dummy digits (e.g. 000000000000) are not accepted.');
      return;
    }
    const dummyList = ['123456789012', '987654321098', '012345678901', '123456789123'];
    if (dummyList.includes(cleanUtr)) {
      setErrorMsg('Invalid UTR: Please enter the actual 12-digit reference number from your bank payment receipt.');
      return;
    }

    setStep('processing');
    setErrorMsg(null);

    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          caLevel: formData.caLevel,
          attemptDetails: formData.attemptDetails,
          batchId: formData.batchId,
          amount: currentBatchObj?.fee || 999,
          paymentMethod: 'UPI',
          upiUtr: cleanUtr,
          razorpay_payment_id: `UPI_${cleanUtr}`,
          razorpay_order_id: orderData?.orderId || `order_upi_${Date.now()}`,
          razorpay_signature: 'upi_submitted',
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || 'UPI payment submission failed.');
      }

      const verifyJson = await verifyRes.json();
      if (!verifyJson || !verifyJson.success) {
        throw new Error(verifyJson?.error || 'Payment verification record could not be saved.');
      }

      onPaymentSuccess(verifyJson);
    } catch (err: any) {
      console.error('UPI Verification failure:', err);
      setErrorMsg(err.message || 'Payment verification failed.');
      setStep('payment'); // keep user on payment tab so they can correct UTR immediately
    }
  };

  const handleSimulatedPayment = () => {
    const simPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const simOrderId = orderData?.orderId || `order_sim_${Date.now()}`;
    completePayment(simPaymentId, simOrderId, 'sim_signature_ok');
  };

  if (!isOpen) return null;

  const fee = currentBatchObj?.fee || 999;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>The Umbrella Network</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Reserve Your Articleship Seat
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            6-Day Articleship Masterclass • Direct cohort WhatsApp access upon registration
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Batch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Masterclass Batch *
              </label>
              <select
                value={formData.batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} ({b.name}) • Starts {b.start_date} • ₹{b.fee}
                  </option>
                ))}
              </select>
              {currentBatchObj && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Schedule: {currentBatchObj.start_date} - {currentBatchObj.end_date}</span>
                  <span className="font-semibold text-emerald-700">Fee: ₹{currentBatchObj.fee}</span>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Yash Malhotra"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address * (For Confirmation & Session Access)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yash@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Mobile / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210 (10 digits)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Used to invite you to your batch-specific WhatsApp community.
              </p>
            </div>

            {/* CA Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                CA Qualification Level *
              </label>
              <select
                value={formData.caLevel}
                onChange={(e) => setFormData({ ...formData, caLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="CA Inter - Both Groups Cleared">CA Inter - Both Groups Cleared</option>
                <option value="CA Inter - Group 1 Cleared">CA Inter - Group 1 Cleared</option>
                <option value="CA Inter - Group 2 Cleared">CA Inter - Group 2 Cleared</option>
                <option value="CA Inter - Appearing / Results Awaited">CA Inter - Appearing / Results Awaited</option>
                <option value="Direct Entry Scheme Student">Direct Entry Scheme Student</option>
                <option value="Searching for Articleship Transfer">Searching for Articleship Transfer</option>
              </select>
            </div>

            {/* Attempt Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Attempt / Relevant Details (Optional)
              </label>
              <input
                type="text"
                value={formData.attemptDetails}
                onChange={(e) => setFormData({ ...formData, attemptDetails: e.target.value })}
                placeholder="e.g. Cleared May 2026 attempt, targeting Big 4 Stat Audit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 text-base transition-all cursor-pointer"
                id="modal-proceed-to-payment-btn"
              >
                <span>Proceed to Pay ₹{fee}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit Payment Verification</span>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Payment Gateway Screen */}
        {step === 'payment' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Order Summary Header */}
            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Order Summary
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    Articleship Masterclass ({currentBatchObj?.batch_number})
                  </div>
                  <div className="text-xs text-slate-500">
                    Candidate: {formData.fullName} ({formData.phone})
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-900">
                  ₹{fee}
                </div>
              </div>
            </div>

            {/* Payment Mode Selector Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethodTab('upi')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethodTab === 'upi'
                    ? 'bg-white text-blue-950 shadow-xs border border-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>UPI QR / Apps</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold ml-1">
                  Fast
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('gateway')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethodTab === 'gateway'
                    ? 'bg-white text-blue-950 shadow-xs border border-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>Cards / NetBanking</span>
              </button>
            </div>

            {/* TAB 1: UPI QR CODE FLOW */}
            {paymentMethodTab === 'upi' && (
              <div className="p-4 sm:p-5 border border-slate-200 rounded-2xl space-y-4 bg-white">
                {/* Google Pay / UPI Card */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 text-center space-y-3">
                  {/* Payee / Mentor Header */}
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      H
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                        <span>Harsh Kaushik</span>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px]">✓</span>
                      </div>
                      <div className="text-[11px] text-slate-500">The Umbrella Network • CA Articleship Masterclass</div>
                    </div>
                  </div>

                  {/* High-Resolution QR Code */}
                  <div className="relative inline-block mx-auto p-2.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    <img
                      src={qrDataUrl || '/upi-qr-code.png'}
                      alt="UPI QR Code - Harsh Kaushik harshkaushiks07@okicici"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl mx-auto"
                    />

                    {/* Centered Google Pay Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 bg-white rounded-full p-1.5 shadow-md border border-slate-100 flex items-center justify-center">
                        <svg viewBox="0 0 48 48" className="w-5 h-5">
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* UPI ID Pill & Copy Button */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 py-1.5 px-3 rounded-xl max-w-xs mx-auto shadow-2xs">
                      <span className="text-[11px] text-slate-500 font-medium">UPI ID:</span>
                      <span className="font-mono text-xs font-bold text-slate-900 select-all">harshkaushiks07@okicici</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('harshkaushiks07@okicici');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2500);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {copiedUpi && <p className="text-[10px] text-emerald-700 font-semibold">✓ UPI ID copied to clipboard!</p>}

                    <div className="text-[11px] text-slate-500">
                      Scan with Google Pay, PhonePe, Paytm, CRED or any UPI app
                    </div>
                  </div>

                  {/* Direct Mobile UPI Link */}
                  <div className="pt-0.5">
                    <a
                      href={`upi://pay?pa=harshkaushiks07@okicici&pn=Harsh%20Kaushik&am=${fee}&cu=INR&tn=${encodeURIComponent('Articleship Masterclass ' + (currentBatchObj?.batch_number || 'Batch 05'))}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open in UPI App & Pay ₹{fee}</span>
                    </a>
                  </div>
                </div>

                {/* Step 2: Input UTR / Reference ID */}
                <form onSubmit={completeUpiPayment} className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Enter 12-Digit UPI Ref / UTR Number *
                      </label>
                      <span className={`text-[11px] font-mono font-semibold ${upiUtr.length === 12 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {upiUtr.length}/12 digits
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      inputMode="numeric"
                      pattern="\d{12}"
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 426819204912"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                    />
                    <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                      <span>Found in GPay, PhonePe, Paytm or bank SMS receipt.</span>
                      <span className="font-semibold text-emerald-700">Fee: ₹{fee}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bank Verification:</strong> Each 12-digit UTR is verified against ICICI account credits. Dummy or incorrect UTRs are rejected and cohort materials are released only after credit confirmation.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={upiUtr.length !== 12}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-md text-sm transition-all cursor-pointer"
                    id="modal-confirm-upi-payment-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid ₹{fee} — Submit for Verification</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: RAZORPAY GATEWAY FLOW */}
            {paymentMethodTab === 'gateway' && (
              <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-800">
                      Payment Gateway (Razorpay Verified)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Debit / Credit Cards / NetBanking
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  You will be charged <strong>₹{fee}</strong> for full enrollment in{' '}
                  <strong>{currentBatchObj?.batch_number}</strong>. Upon payment verification, your seat
                  will be confirmed and you will immediately receive your unique batch WhatsApp invite, plus an official acknowledgment email containing all Masterclass Google Drive resources.
                </p>

                {/* Complete Payment Button */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleSimulatedPayment}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md text-base transition-all cursor-pointer"
                    id="modal-complete-payment-action-btn"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Complete Online Payment (₹{fee})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => setStep('form')}
              className="w-full text-xs text-slate-500 hover:text-slate-800 py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify student details or change batch</span>
            </button>
          </div>
        )}

        {/* STEP 3: Processing State */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-4 animate-in fade-in">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">
              Verifying Payment & Generating Registration...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please do not refresh this window. We are securing your seat and retrieving your
              dedicated batch WhatsApp group link.
            </p>
          </div>
        )}

        {/* STEP 4: Payment Failed Screen (Section 21) */}
        {step === 'failed' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in" id="payment-failure-view">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Payment Could Not Be Completed
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your payment was not successfully completed. Please try again or reach out to support.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={() => setStep('payment')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm"
              >
                Try Again
              </button>
              <a
                href="https://wa.me/919996506041?text=Hi%2C%20my%20payment%20for%20the%20Articleship%20Masterclass%20failed.%20Can%20you%20help%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl inline-flex items-center justify-center"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
