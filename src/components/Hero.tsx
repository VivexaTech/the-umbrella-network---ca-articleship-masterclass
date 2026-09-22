import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, FileText, Send, MessageSquare, Award, Compass, Briefcase } from 'lucide-react';
import type { Batch } from '../types';

interface HeroProps {
  onJoinClick: (batch?: Batch) => void;
  activeBatch?: Batch | null;
}

export const Hero: React.FC<HeroProps> = ({ onJoinClick, activeBatch }) => {
  const journeySteps = [
    { label: 'CV', icon: FileText, desc: 'ATS-Friendly & Impactful' },
    { label: 'Applications', icon: Send, desc: 'Targeted Outreach' },
    { label: 'HR Communication', icon: MessageSquare, desc: 'Emails & Follow-ups' },
    { label: 'Interviews', icon: Award, desc: 'Technical & Behavioral' },
    { label: 'Domain Selection', icon: Compass, desc: 'Audit, Tax, Advisory' },
    { label: 'Articleship', icon: Briefcase, desc: 'Offer Secured' },
  ];

  const handleScrollToModules = () => {
    const elem = document.querySelector('#modules');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-section" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-r from-blue-100/40 via-indigo-100/30 to-blue-50/40 blur-3xl -z-10 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>6-Day Articleship Masterclass • Next Batch Enrolling</span>
            <span className="text-blue-400">|</span>
            <span className="font-bold text-blue-900">₹999 Only</span>
          </div>

          {/* Main Headline */}
          <h1
            id="hero-main-headline"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6"
          >
            Your Articleship Search Needs <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900">
              More Than Just a CV.
            </span>
          </h1>

          {/* Supporting Headline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed mb-8 sm:mb-10">
            A practical 6-day masterclass to help you approach your CA articleship search with the
            right CV, strategy, communication and interview preparation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-10">
            <button
              onClick={() => onJoinClick(activeBatch || undefined)}
              id="hero-primary-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base sm:text-lg px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Join the Masterclass – ₹999</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleScrollToModules}
              id="hero-secondary-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
            >
              <span>Explore What You'll Learn</span>
            </button>
          </div>

          {/* Key Quick Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 font-medium pb-8 border-b border-slate-200/60 max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Live & Interactive 6-Day Cohort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Batch-Dedicated WhatsApp Group</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Big 4 & Big 6 Mentors</span>
            </div>
          </div>
        </div>

        {/* Visual Strategic Journey */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              The Strategic Roadmap
            </span>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From confused candidate to confident articleship hire
            </p>
          </div>

          <div
            id="hero-visual-journey"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative"
          >
            {journeySteps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.label}
                  className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all text-center flex flex-col items-center justify-center relative group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2.5">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {step.desc}
                  </div>

                  {/* Visual arrow connector on desktop */}
                  {idx < journeySteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-300 z-10 pointer-events-none font-bold">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
