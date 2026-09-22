import React from 'react';
import { Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import type { Batch } from '../types';

interface CurrentBatchBannerProps {
  batches: Batch[];
  activeBatch?: Batch | null;
  onSelectBatchToJoin: (batch: Batch) => void;
}

export const CurrentBatchBanner: React.FC<CurrentBatchBannerProps> = ({
  batches,
  activeBatch,
  onSelectBatchToJoin,
}) => {
  const current = activeBatch || batches.find(b => b.status === 'active') || batches[0];
  const upcomingBatches = batches.filter(b => b.id !== current?.id);

  if (!current) return null;

  return (
    <section id="current-batch" className="py-14 bg-slate-900 text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enrollment Open</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Upcoming Masterclass Schedule
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every cohort is conducted live with personalized guidance and dedicated batch WhatsApp access.
          </p>
        </div>

        {/* Featured Current Batch Card */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wide">
                  NEXT BATCH NOW OPEN
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/30 text-blue-200 border border-blue-400/50 text-xs font-extrabold tracking-wide uppercase shadow-sm">
                  {current.batch_number || 'Batch #05'}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {current.name || '6-Day Articleship Masterclass'}
                </h3>
                <p className="text-slate-300 text-sm mt-1 max-w-xl">
                  {current.description || 'Structured 6-day program focused on CVs, applications, Big 4/Big 6 interviews, and domain strategy.'}
                </p>
              </div>

              {/* Batch Meta Details: Start Date and Deadline (Capacity Removed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm bg-slate-800/90 p-3 rounded-xl border border-blue-500/30 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Start Date</div>
                    <div className="font-bold text-white text-sm sm:text-base">
                      {current.start_date || '1 October 2026'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm bg-gradient-to-r from-amber-950/40 to-slate-800/90 p-3 rounded-xl border border-amber-500/40 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Reg. Deadline</div>
                    <div className="font-bold text-amber-100 text-sm sm:text-base tracking-wide">
                      {current.registration_deadline || '30 September 2026, 11:59 PM'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & CTA Column */}
            <div className="lg:border-l lg:border-slate-700/80 lg:pl-8 flex flex-col justify-center items-start lg:items-center text-left lg:text-center shrink-0 min-w-[220px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Cohort Fee
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-4xl font-extrabold text-white">₹{current.fee}</span>
                <span className="text-xs text-slate-400">/ one-time</span>
              </div>
              <div className="text-[11px] text-emerald-400 mb-4 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Includes 6 Live Days + Resources
              </div>

              <button
                onClick={() => onSelectBatchToJoin(current)}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm cursor-pointer"
                id="current-batch-reserve-cta"
              >
                <span>Reserve My Seat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Other Batches if any */}
          {upcomingBatches.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700/60">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
                Other Scheduled Batches:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingBatches.map(b => (
                  <div
                    key={b.id}
                    className="bg-slate-800/50 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{b.batch_number}</span>
                        <span className="text-slate-400 text-[11px] font-normal">({b.name})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Starts {b.start_date} • ₹{b.fee}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectBatchToJoin(b)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-3 shrink-0"
                    >
                      Enroll in this Batch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
