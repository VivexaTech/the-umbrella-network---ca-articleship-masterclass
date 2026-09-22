import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export const SocialProofResults: React.FC = () => {
  return (
    <section id="results" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Documented Track Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            500+ Students and Counting.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Authentic career preparation built on practical frameworks, personalized CV revamps, and
            rigorous interview simulations.
          </p>
        </div>

        {/* Highlight Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-blue-900 tracking-tight mb-2">
                500+
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Students Placed
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students have used the guidance, resources and preparation provided through The Umbrella Network
                to pursue articleship opportunities across reputed firms and organisations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mentored across multiple articleship cycles</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-blue-900 tracking-tight mb-2">
                100%
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Interview Opportunities at Big 6
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                In the relevant tracked cohort, 100% of students received at least one Big 6 interview opportunity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tracked cohort historical benchmark</span>
            </div>
          </div>
        </div>

        {/* Clear Legal Disclaimer */}
        <div className="mt-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-start sm:items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs leading-relaxed text-left sm:text-center shadow-xs">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
            <p>
              <strong>Important Transparency Notice:</strong> Historical results reflect documented
              past student outcomes and do not constitute a commercial guarantee of future offers or
              interview calls. Selection always depends on candidate qualifications, exam results,
              firm vacancies, and individual interview performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
