import React, { useState } from 'react';
import {
  FileText,
  Building2,
  Compass,
  Send,
  Mail,
  Linkedin,
  HelpCircle,
  Video,
  Users,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export const WhatYouWillLearn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'cv' | 'firms' | 'interviews' | 'technical'>('all');
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const modules = [
    {
      num: 1,
      category: 'cv',
      title: 'CV That Gets Noticed',
      icon: FileText,
      tag: 'Core Foundation',
      topics: [
        'CV structure & single-page layout standards',
        'Recruiter expectations in Big 4 and top firms',
        'Common red-flag mistakes that cause rejections',
        'Action-oriented achievement presentation',
        'Domain-specific CV adaptations (Audit vs. Tax vs. Advisory)',
        'Comprehensive CV review framework',
        'ATS-friendly formatting, typography & margin balance',
        'High-impact keywords for articleship screeners',
        'Quantifying achievements without prior full-time experience',
      ],
    },
    {
      num: 2,
      category: 'firms',
      title: 'Choosing the Right Firm',
      icon: Building2,
      tag: 'Strategic Selection',
      topics: [
        'Big 4 landscape (PwC, Deloitte, EY, KPMG)',
        'Big 6 firms (BDO, Grant Thornton, etc.)',
        'Reputed top mid-size and boutique audit/tax firms',
        'Specialized consulting & advisory practices',
        'Corporates & Industry training landscape',
        'Evaluating Domain vs. Brand vs. Learning curve',
        'Work exposure depth vs. client variety trade-offs',
        'Location, travel expectations & stipend norms',
        'Future CA Final study leave policies & career paths',
      ],
    },
    {
      num: 3,
      category: 'firms',
      title: 'Choosing Your Domain',
      icon: Compass,
      tag: 'Crucial Decision',
      topics: [
        'Statutory Audit (Public entities, Ind AS, PCAOB)',
        'Internal Audit & Process Risk Evaluation',
        'Direct Tax (Corporate taxation, Transfer Pricing, Litigation)',
        'Indirect Tax (GST assessments, advisory & audits)',
        'M&A Tax & Transaction Advisory services',
        'Valuation & Financial Modeling introduction',
        'Accounting Advisory & Financial Reporting (IFRS/Ind AS)',
        'Risk Advisory & Tech Assurance',
        'Consulting vs. Compliance: Exit opportunities matrix',
      ],
    },
    {
      num: 4,
      category: 'cv',
      title: 'Articleship Application Strategy',
      icon: Send,
      tag: 'Outreach Playbook',
      topics: [
        'Finding unadvertised openings and verified vacancies',
        'Discovering HR and partner contact details ethically',
        'Direct career portal applications vs. partner emails',
        'Cold email outreach strategy that yields responses',
        'Polite and systematic follow-up cadences',
        'LinkedIn networking without sounding transactional',
        'Organized Excel application tracker methodology',
        'Avoiding common spray-and-pray application errors',
      ],
    },
    {
      num: 5,
      category: 'cv',
      title: 'Professional Email Writing',
      icon: Mail,
      tag: 'Communication',
      topics: [
        'High-converting cold email structure & anatomy',
        'Follow-up email templates (1st, 2nd, and final ping)',
        'Professional HR & partner communication etiquette',
        'High-open-rate subject lines for articleship applications',
        'Professional language, tone, and formatting polish',
        'PDF CV attachment etiquette (naming convention, file size)',
        'Follow-up timing & respecting recruiter schedules',
      ],
    },
    {
      num: 6,
      category: 'cv',
      title: 'LinkedIn Profile Building',
      icon: Linkedin,
      tag: 'Personal Branding',
      topics: [
        'Crafting a professional headline for CA Inter cleared students',
        'High-impact "About" section that showcases intent',
        'Formatting Education & CA Foundation/Inter marks effectively',
        'Highlighting skills, extracurriculars, and leadership',
        'Networking etiquette with Seniors, Managers, and Partners',
        'Strategic recruiter outreach message templates',
        'Finding decision-makers in targeted offices',
        'Building credibility and visibility on the feed',
      ],
    },
    {
      num: 7,
      category: 'interviews',
      title: 'Articleship Interviews',
      icon: HelpCircle,
      tag: 'Interview Mastery',
      topics: [
        'Classic HR questions & situational response framing',
        'Technical questions breakdown by target domain',
        'Resume-based deep dives (drilling into every word on your CV)',
        'Situational questions & ethical dilemma scenarios',
        'Mastering "Tell me about yourself" with a winning narrative',
        'Answering "Why this firm?" with authentic specifics',
        'Answering "Why this domain?" convincingly',
        'Handling "Why should we hire you?" with calm confidence',
      ],
    },
    {
      num: 8,
      category: 'interviews',
      title: 'Mock Interviews',
      icon: Video,
      tag: 'Live Practice',
      topics: [
        'Live mock interview preparation framework',
        'Answer structuring using the STAR / CAR technique',
        'Body language, video presence, and professional speech cadence',
        'Handling stress testing and difficult follow-up questions',
        'In-depth resume-based cross-questioning simulation',
        'Real-time constructive feedback and improvement loops',
      ],
    },
    {
      num: 9,
      category: 'interviews',
      title: 'Group Discussions',
      icon: Users,
      tag: 'Big 4 Screening',
      topics: [
        'How GD rounds work in Big 4 and large consulting firms',
        'Tactics for entering the discussion early with composure',
        'Structured communication and voice modulation',
        'How to professionally disagree without confrontation',
        'Building effectively on another candidate\'s point',
        'Delivering a crisp, memorable conclusion',
        'Common fatal mistakes that lead to immediate elimination',
      ],
    },
    {
      num: 10,
      category: 'technical',
      title: 'Practical Excel for Articleship',
      icon: FileSpreadsheet,
      tag: 'Workplace Ready',
      topics: [
        'VLOOKUP, XLOOKUP, and HLOOKUP in audit workpapers',
        'INDEX & MATCH for flexible multi-condition lookups',
        'Pivot Tables for summarising general ledgers and trial balances',
        'COUNTIF and COUNTIFS for audit sample verifications',
        'SUMIF and SUMIFS for segment analysis',
        'Advanced Filters and clean sorting',
        'Remove Duplicates and data reconciliation',
        'Text to Columns / Delimit for bank statements and ERP dumps',
        'Conditional Formatting for variance highlights',
        'Freeze Panes & clean formatting for partner reviews',
      ],
    },
  ];

  const filteredModules =
    activeTab === 'all'
      ? modules
      : modules.filter((m) => m.category === activeTab);

  return (
    <section id="modules" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Curriculum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What You Will Learn
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            10 intensive, field-tested modules covering every stage of your articleship journey from
            your initial CV draft to your final partner round and day-one Excel skills.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'All 10 Modules' },
              { id: 'cv', label: 'CV & Outreach' },
              { id: 'firms', label: 'Firms & Domains' },
              { id: 'interviews', label: 'Interviews & GD' },
              { id: 'technical', label: 'Practical Excel' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredModules.map((mod) => {
            const IconComponent = mod.icon;
            const isExpanded = expandedModule === mod.num;

            return (
              <div
                key={mod.num}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                          MODULE {mod.num}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {mod.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                      {mod.tag}
                    </span>
                  </div>

                  {/* Highlights checklist */}
                  <ul className="space-y-2 mt-4 text-xs sm:text-sm text-slate-700">
                    {mod.topics.slice(0, isExpanded ? mod.topics.length : 5).map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {mod.topics.length > 5 && (
                  <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedModule(isExpanded ? null : mod.num)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Show less' : `View all ${mod.topics.length} topics`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] text-slate-400">Day {Math.min(6, Math.ceil(mod.num / 1.7))} Topic</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Domain Comparison Framework Spotlight */}
        <div className="mt-14 max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                Module 3 Deep Dive
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                The Articleship Domain Comparison Matrix
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                We compare Statutory Audit, Internal Audit, Direct Tax, Indirect Tax, M&A Tax,
                Valuation, and Consulting across 5 key dimensions: CA Final study balance, partner exit
                options, industry demand, and day-to-day work profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {['Stat Audit', 'Direct Tax', 'M&A Tax', 'Internal Audit', 'Risk Advisory', 'Valuation'].map((domain) => (
                <span
                  key={domain}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-medium text-blue-200"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
