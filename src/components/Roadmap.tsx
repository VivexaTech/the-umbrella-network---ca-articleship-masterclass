import React from 'react';
import { Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const Roadmap: React.FC = () => {
  const days = [
    {
      day: 'DAY 1',
      title: 'Landscape & CV Building',
      desc: 'Understanding the Articleship Landscape & CV Building',
      topics: ['Market reality & hiring cycles', '1-page impactful CV layout', 'Quantifying CA achievements'],
    },
    {
      day: 'DAY 2',
      title: 'Cover Letter & Emails',
      desc: 'Cover Letter and Email writing',
      topics: ['Partner cold email frameworks', 'Subject lines with high open rates', 'Follow-up timing & templates'],
    },
    {
      day: 'DAY 3',
      title: 'LinkedIn, Domain & Firms',
      desc: 'LinkedIn Building + Domain Selection + Firm Selection',
      topics: ['Recruiter search optimization', 'Audit vs Tax vs Advisory matrix', 'Big 4 vs Big 6 vs Mid-size fit'],
    },
    {
      day: 'DAY 4',
      title: 'Technical & HR Prep',
      desc: 'Technical Interview Questions + HR Preparation',
      topics: ['Frequently asked Ind AS & SA', 'HR behavioral frameworks', '"Why this firm/domain" scripts'],
    },
    {
      day: 'DAY 5',
      title: 'GD & Career Guidance',
      desc: 'Group Discussion + Career Guidance',
      topics: ['How to enter and steer GDs', 'Professional disagreement etiquette', 'Long-term CA career trajectory'],
    },
    {
      day: 'DAY 6',
      title: 'Mock Interviews & Strategy',
      desc: 'Mock Interviews + Final Strategy',
      topics: ['Live mock interview simulations', 'Resume cross-examination practice', 'Personalized batch action roadmap'],
    },
  ];

  return (
    <section id="roadmap" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structured 6-Day Program</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The 6-Day Roadmap
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            A step-by-step masterclass taking you through every single phase of your articleship
            preparation with clarity and accountability.
          </p>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-6 gap-4 relative">
            {/* Connecting line */}
            <div className="absolute top-7 left-8 right-8 h-1 bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-600 -z-0 rounded-full" />

            {days.map((item, idx) => (
              <div key={item.day} className="relative z-10 flex flex-col items-center">
                {/* Step Node */}
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-blue-600 shadow-md flex items-center justify-center font-extrabold text-blue-800 text-xs mb-4 hover:scale-110 transition-transform">
                  {item.day}
                </div>

                {/* Day Card */}
                <div className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-blue-700 font-semibold mb-3 leading-snug">
                      {item.desc}
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {item.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="leading-tight">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="lg:hidden space-y-4 max-w-md mx-auto">
          {days.map((item, idx) => (
            <div
              key={item.day}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-4 relative"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center shrink-0 font-extrabold text-xs">
                <span>{item.day.split(' ')[0]}</span>
                <span className="text-sm">{item.day.split(' ')[1]}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-blue-700 font-medium mt-0.5 mb-2">
                  {item.desc}
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {item.topics.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 italic">
            * Exact schedule may vary slightly between batches. Live sessions are conducted in the evening to accommodate students' study routines.
          </p>
        </div>
      </div>
    </section>
  );
};
