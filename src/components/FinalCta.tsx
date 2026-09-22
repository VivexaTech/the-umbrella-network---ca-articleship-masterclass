import React from 'react';
import { ArrowRight, MessageCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { Batch } from '../types';

interface FinalCtaProps {
  onJoinClick: (batch?: Batch) => void;
  activeBatch?: Batch | null;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onJoinClick, activeBatch }) => {
  const fee = activeBatch?.fee || 999;

  const scrollToContact = () => {
    const elem = document.querySelector('#contact');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="final-cta" className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Take Action Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Your Articleship Journey Starts With the Right Strategy.
        </h2>

        <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto mb-10">
          Stop randomly applying. Start applying strategically.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onJoinClick(activeBatch || undefined)}
            id="final-primary-join-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Join the Articleship Masterclass – ₹{fee}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={scrollToContact}
            id="final-secondary-talk-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-base px-6 py-4 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Have Questions? Talk to Us</span>
          </button>
        </div>

        {/* Small Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs sm:text-sm text-slate-300 font-medium pt-8 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>500+ Students Placed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Big 6 Interview Opportunities in Relevant Tracked Cohort</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>6-Day Structured Program</span>
          </div>
        </div>
      </div>
    </section>
  );
};
