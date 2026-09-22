import React from 'react';
import { Users, Award, Calendar, CheckCircle, Info } from 'lucide-react';
import type { StatisticItem } from '../types';

interface TrustStatsProps {
  statistics?: StatisticItem[];
}

export const TrustStats: React.FC<TrustStatsProps> = ({ statistics }) => {
  const defaultStats: StatisticItem[] = [
    {
      id: 'stat-1',
      number: '500+',
      title: 'Students Placed',
      description: '500+ students have secured articleship opportunities through the guidance and support provided by The Umbrella Network.',
      order: 1,
      visible: true,
    },
    {
      id: 'stat-2',
      number: '100%',
      title: 'Big 6 Interview Opportunities',
      description: '100% of students in the relevant tracked cohort received at least one interview opportunity from Big 6 firms.',
      order: 2,
      visible: true,
    },
    {
      id: 'stat-3',
      number: '6 Days',
      title: 'Practical Masterclass',
      description: 'A structured 6-day program focused on articleship applications, CVs, domains, interviews and career preparation.',
      order: 3,
      visible: true,
    },
  ];

  const displayStats = (statistics && statistics.length > 0 ? statistics : defaultStats)
    .filter(s => s.visible !== false)
    .sort((a, b) => a.order - b.order);

  const icons = [Users, Award, Calendar];

  return (
    <section id="trust-stats-section" className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Credibility statement */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Real students. Real applications. Real interview experiences.
          </p>
        </div>

        {/* 3 Prominent Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayStats.map((stat, idx) => {
            const IconComponent = icons[idx % icons.length] || CheckCircle;
            return (
              <div
                key={stat.id || idx}
                className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight">
                      {stat.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Disclaimer */}
        <div className="mt-8 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-500 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
            <p>
              <strong>Disclaimer:</strong> Results are based on historical student outcomes and may
              vary depending on individual profile, applications, interview performance, available
              opportunities and market conditions. Historical results are not guarantees of future
              outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
