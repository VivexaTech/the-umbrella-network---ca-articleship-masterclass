import React from 'react';
import { HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const WhyArticleshipDifficult: React.FC = () => {
  const problems = [
    { q: "Where should I apply?", desc: "Navigating hundreds of firms without knowing which ones are currently hiring articles." },
    { q: "Which firms should I target?", desc: "Understanding the real differences between Big 4, Big 6, boutique firms, and top mid-size practices." },
    { q: "Which domain is right for me?", desc: "Statutory audit vs. Direct Tax vs. M&A vs. Risk Advisory—making an irreversible choice with zero clarity." },
    { q: "How should my CV look?", desc: "Writing a 1-page CV that actually passes partner screens instead of blending in with 10,000 generic templates." },
    { q: "What should I write in my email?", desc: "Drafting high-converting cold emails and subject lines that partners and managers actually open." },
    { q: "How do I approach HR?", desc: "Reaching out politely without sounding desperate or getting lost in automated recruiter inboxes." },
    { q: "How do I use LinkedIn?", desc: "Turning your profile into an inbound opportunity magnet and finding decision-maker contacts." },
    { q: "How should I prepare for interviews?", desc: "Structuring answers to behavioral, situational, and partner-level questions with poise." },
    { q: "What technical questions can be asked?", desc: "Mastering core Ind AS, Standards on Auditing, and Tax amendments frequently quizzed in technical rounds." },
    { q: "Big 4 vs Big 6 vs Top Mid-size vs Corporate?", desc: "Evaluating long-term exit opportunities, stipend trade-offs, and exposure quality honestly." },
    { q: "What skills should I develop before joining?", desc: "Getting comfortable with real articleship workhorse tools like advanced Excel, VLOOKUP, and XLOOKUP." },
  ];

  return (
    <section id="why-articleship-difficult" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Challenges Faced by CA Students</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Articleship Search Can Be Confusing.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Most students clear CA Inter and immediately start mass-applying with the same generic CV,
            hoping for luck. You shouldn't have to navigate these critical questions alone:
          </p>
        </div>

        {/* The 11 Common Questions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {problems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-start"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.q}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transition callout */}
        <div className="mt-12 max-w-3xl mx-auto text-center bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-xs uppercase tracking-widest font-bold">The Strategic Solution</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            “That is exactly what this masterclass is designed to solve.”
          </h3>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Instead of trial-and-error, you gain an end-to-end tactical playbook crafted by mentors who
            have worked at PwC, Deloitte, Flipkart, BDO, and EY.
          </p>
        </div>
      </div>
    </section>
  );
};
