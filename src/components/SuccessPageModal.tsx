import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, Mail, Download, ExternalLink, X, ShieldCheck, FolderOpen, Clock, RotateCw, AlertCircle } from 'lucide-react';
import type { PaymentSuccessResponse } from '../types';

interface SuccessPageModalProps {
  data: PaymentSuccessResponse | null;
  onClose: () => void;
}

const DEFAULT_DRIVE_LINK = 'https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD';

export const SuccessPageModal: React.FC<SuccessPageModalProps> = ({ data, onClose }) => {
  const [currentData, setCurrentData] = useState<PaymentSuccessResponse | null>(data);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkStatusMsg, setCheckStatusMsg] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  if (!currentData) return null;

  const isPending = currentData.status === 'pending_verification';
  const isRejected = currentData.status === 'rejected';
  const isVerified = currentData.status === 'verified' || (!isPending && !isRejected);

  const driveLink = currentData.driveResourcesLink || DEFAULT_DRIVE_LINK;
  const whatsappLink = currentData.whatsappLink || 'https://chat.whatsapp.com/BeAGTr1Q7t63W8PBqXxnS5';

  const checkLiveStatus = async () => {
    if (!currentData.registrationNumber) return;
    setIsCheckingStatus(true);
    setCheckStatusMsg(null);
    try {
      const res = await fetch(`/api/registrations/status?query=${encodeURIComponent(currentData.registrationNumber)}`);
      const json = await res.json();
      if (res.ok && json.success && json.registration) {
        const r = json.registration;
        setCurrentData(prev => prev ? {
          ...prev,
          status: r.status,
          whatsappLink: r.whatsappLink,
          driveResourcesLink: r.driveResourcesLink,
        } : null);

        if (r.status === 'verified') {
          setCheckStatusMsg('Payment verified! Google Drive and WhatsApp links are now unlocked.');
        } else if (r.status === 'rejected') {
          setCheckStatusMsg('Verification could not be confirmed in bank records.');
        } else {
          setCheckStatusMsg('Still under review. Mentor is verifying bank credits.');
        }
      } else {
        setCheckStatusMsg('Unable to fetch latest status. Please try again.');
      }
    } catch {
      setCheckStatusMsg('Network error checking status.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 relative my-8 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STATUS 1: PENDING VERIFICATION */}
        {isPending && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/10">
              <Clock className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              UPI Reference Submitted ⏳
            </h2>

            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your payment reference has been recorded and is currently undergoing bank credit verification.
            </p>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2 text-xs text-amber-950">
              <div className="flex items-start gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Bank Credit Verification</span>
              </div>
              <p className="leading-relaxed text-amber-900/90">
                To protect cohort access, direct UPI payments are matched against our ICICI Bank statement for UTR <strong>{currentData.upiUtr}</strong>. As soon as CA Harsh Kaushik confirms the credit, your WhatsApp invite and Google Drive resource folder unlock instantly.
              </p>
            </div>
          </div>
        )}

        {/* STATUS 2: REJECTED */}
        {isRejected && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-rose-500/10">
              <AlertCircle className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verification Unsuccessful ❌
            </h2>

            <p className="text-sm text-rose-700 mt-2 max-w-md mx-auto font-medium">
              No credit matching UTR <strong>{currentData.upiUtr}</strong> was found in our bank records. If you believe this is an error, please contact caumbrellanetwork@gmail.com.
            </p>
          </div>
        )}

        {/* STATUS 3: FULLY VERIFIED */}
        {isVerified && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              You're In! 🎉
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-md mx-auto">
              Your seat for the Articleship Masterclass has been verified and confirmed.
            </p>

            <div className="mt-4 p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-xs text-blue-900 font-medium">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Acknowledgment email with your <strong>Google Drive resources link</strong> has been sent to {currentData.studentEmail ? <strong className="text-blue-950 underline">{currentData.studentEmail}</strong> : 'your email'}.
              </span>
            </div>
          </div>
        )}

        {/* Registration Details Card */}
        <div className="mt-5 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-bold text-slate-900">{currentData.studentName}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Batch Number:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {currentData.batchNumber}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Batch Dates:</span>
            <span className="font-semibold text-slate-900">{currentData.batchDate}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Amount:</span>
            <span className="font-bold text-emerald-700">₹{currentData.amount}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">Verification Status:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
              isVerified ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isVerified ? '✓ Payment Verified' : isPending ? '⏳ Bank Review Pending' : '✕ Verification Failed'}
            </span>
          </div>

          {currentData.paymentMethod && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {currentData.paymentMethod}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="text-slate-500">
              {currentData.upiUtr ? 'UPI Ref / UTR No:' : 'Payment ID:'}
            </span>
            <span className="font-mono text-slate-700 text-[11px] font-semibold">
              {currentData.upiUtr || currentData.paymentId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Registration ID:</span>
            <span className="font-mono font-bold text-blue-900 text-[11px]">
              {currentData.registrationNumber || currentData.registrationId}
            </span>
          </div>
        </div>

        {/* PENDING VIEW: CHECK LIVE STATUS ACTION */}
        {isPending && (
          <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Once CA Harsh Kaushik verifies the UTR credit in the admin panel, your materials unlock here immediately.
            </p>
            <button
              onClick={checkLiveStatus}
              disabled={isCheckingStatus}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
              <span>{isCheckingStatus ? 'Checking Bank Verification...' : 'Check Verification Status'}</span>
            </button>
            {checkStatusMsg && (
              <p className="text-xs font-semibold text-blue-800 animate-in fade-in">
                {checkStatusMsg}
              </p>
            )}
          </div>
        )}

        {/* VERIFIED VIEW: GOOGLE DRIVE & WHATSAPP ACTIONS */}
        {isVerified && (
          <>
            {/* 1. GOOGLE DRIVE RESOURCES FOLDER ACTION */}
            <div className="mt-6 p-6 bg-blue-50/90 border-2 border-blue-400/30 rounded-3xl text-center space-y-3">
              <div className="text-xs uppercase font-extrabold tracking-wider text-blue-800 flex items-center justify-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Step 1: Access All Masterclass Resources</span>
              </div>

              <h3 className="text-xl font-black text-slate-900">
                Masterclass Resources Google Drive
              </h3>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your comprehensive resource drive includes CV templates, cold email outreach frameworks,
                interview question banks, domain matrices, and practical Excel workbooks.
              </p>

              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                id="success-open-drive-resources-cta"
                className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 cursor-pointer w-full"
              >
                <FolderOpen className="w-5 h-5 fill-white/20 text-white" />
                <span>Open Google Drive Resources Folder</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>

              <p className="text-[11px] text-blue-800/80 font-medium">
                This folder link has also been sent to your email for permanent reference.
              </p>
            </div>

            {/* 2. BATCH-SPECIFIC WHATSAPP ACTION */}
            <div className="mt-5 p-6 bg-emerald-50/80 border-2 border-emerald-500/30 rounded-3xl text-center space-y-3">
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 flex items-center justify-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>Step 2: Join Your Batch Community</span>
              </div>

              <h3 className="text-xl font-black text-slate-900">
                Join Your Batch WhatsApp Group
              </h3>

              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Click below to enter the exclusive WhatsApp group where live session links, CV review
                schedules, and mentors are waiting.
              </p>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                id="success-join-batch-whatsapp-cta"
                className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 cursor-pointer w-full"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>Join {currentData.batchNumber} WhatsApp Group</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>

              <p className="text-[11px] text-emerald-800/80 font-medium">
                This link is specifically for your registered batch.
              </p>
            </div>
          </>
        )}

        {/* Email preview toggle & print button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
          <button
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{showEmailPreview ? 'Hide email notification' : 'View email notification'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Email Receipt Preview */}
        {showEmailPreview && (
          <div className="mt-4 p-5 bg-slate-900 text-slate-200 rounded-2xl text-left text-xs font-mono space-y-2.5 border border-slate-800">
            <div className="text-blue-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Status: {isVerified ? 'Confirmed' : isPending ? 'Pending Bank Review' : 'Rejected'}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Student Notification</span>
            </div>
            <p>Dear {currentData.studentName},</p>
            <p className="text-slate-300">
              {isVerified
                ? `Thank you for registering for the 6-Day CA Articleship Masterclass! Your seat for ${currentData.batchNumber} is confirmed.`
                : `We have received your 12-digit UPI reference (${currentData.upiUtr}) for ${currentData.batchNumber}. Verification is in progress.`
              }
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
              <p>• Dates: {currentData.batchDate}</p>
              <p>• Amount: ₹{currentData.amount}</p>
              <p>• Registration ID: {currentData.registrationNumber || currentData.registrationId}</p>
              <p>• Payment ID / UTR: {currentData.upiUtr || currentData.paymentId}</p>
            </div>
            {isVerified && (
              <>
                <p className="text-blue-300 break-all">
                  • 📁 <strong>Google Drive Resources Folder:</strong><br />
                  <a href={driveLink} target="_blank" rel="noreferrer" className="underline text-blue-400">{driveLink}</a>
                </p>
                <p className="text-emerald-400 break-all">
                  • 💬 <strong>Batch WhatsApp Group:</strong><br />
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="underline text-emerald-400">{whatsappLink}</a>
                </p>
              </>
            )}
            <p className="pt-2 text-slate-400 border-t border-slate-800 text-[11px]">
              Warm regards,<br />
              <strong>CA Harsh Kaushik & The Umbrella Network Team</strong><br />
              Support: caumbrellanetwork@gmail.com | WhatsApp: 9996506041
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
