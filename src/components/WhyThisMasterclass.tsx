import React from 'react';
import { Target, Users2, Layers, Compass, Zap, ShieldCheck } from 'lucide-react';

export const WhyThisMasterclass: React.FC = () => {
  const cards = [
    {
      title: 'Practical',
      desc: 'Focus on what students actually need during their articleship search. No generic theoretical advice—only real email templates, CV checklists, and proven frameworks.',
      icon: Target,
      highlight: 'Field-Tested Tools',
    },
    {
      title: 'Real Experiences',
      desc: 'Learn from mentors and peers who have actually gone through the process and successfully secured positions across PwC, Deloitte, EY, BDO, and Flipkart.',
      icon: Users2,
      highlight: 'First-Hand Insights',
    },
    {
      title: 'Structured',
      desc: 'A complete 6-day framework that replaces random, frantic applications with a clear, logical step-by-step roadmap from profile to interview.',
      icon: Layers,
      highlight: '6-Day Methodology',
    },
    {
      title: 'Career Focused',
      desc: 'Help students make informed articleship decisions. Understand how domain selection (Audit vs Tax vs Advisory) impacts your post-qualification CA career.',
      icon: Compass,
      highlight: 'Long-term Growth',
    },
    {
      title: 'Action Oriented',
      desc: 'Students should know what exact action to take after each session. You leave every day with a tangible asset: a completed CV draft, cold email, or interview script.',
      icon: Zap,
      highlight: 'Daily Deliverables',
    },
  ];

  return (
    <section id="why-this-masterclass" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The Umbrella Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Not Just Another Articleship Webinar.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Designed from the ground up for CA students seeking high-yield outcomes, personal feedback,
            and real-world clarity.
          </p>
        </div>

        {/* 5 Distinct Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.title}
                className={`bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {card.highlight}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
