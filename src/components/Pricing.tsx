import React from 'react';
import { Check, ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';
import type { Batch, WebsiteSettings } from '../types';

interface PricingProps {
  onReserveClick: (batch?: Batch) => void;
  activeBatch?: Batch | null;
  pricingSettings?: WebsiteSettings['pricing'];
}

export const Pricing: React.FC<PricingProps> = ({
  onReserveClick,
  activeBatch,
  pricingSettings,
}) => {
  const fee = pricingSettings?.fee || activeBatch?.fee || 999;

  const features = [
    'CV Guidance',
    'Cover Letter Guidance',
    'Email Writing',
    'LinkedIn Profile Building',
    'Domain Guidance',
    'Firm Selection Guidance',
    'Interview Preparation',
    'Mock Interviews',
    'GD Preparation',
    'Practical Excel Skills',
    'Application Strategy',
    'Career Guidance',
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent & Accessible Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, All-Inclusive Enrollment
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Complete access to all 6 days, live mentorship, templates, practice sessions, and your
            cohort WhatsApp group.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-blue-600/30 shadow-xl shadow-blue-900/5 p-8 sm:p-10 relative overflow-hidden">
          {/* Top Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {activeBatch?.batch_number || 'Cohort Enrollment'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Articleship Masterclass
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeBatch?.start_date ? `Starts ${activeBatch.start_date}` : '6-Day Comprehensive Cohort'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                ₹{fee}
              </div>
              <div className="text-xs font-semibold text-slate-400">
                6-Day Masterclass
              </div>
            </div>
          </div>

          {/* Checklist of all 12 items */}
          <div className="py-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              What's Included:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA & Trust badges */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <button
              onClick={() => onReserveClick(activeBatch || undefined)}
              id="pricing-reserve-seat-cta"
              className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all cursor-pointer"
            >
              <span>Reserve My Seat – ₹{fee}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Online Payment</span>
              <span>•</span>
              <span>Instant Confirmation</span>
            </div>

            <p className="text-[11px] text-center text-slate-400 leading-snug">
              {pricingSettings?.refund_policy_note ||
                'Fees once paid are non-refundable as batch capacity is capped to maintain interactive feedback quality.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
