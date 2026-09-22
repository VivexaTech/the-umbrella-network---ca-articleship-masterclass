import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { WebsiteSettings } from '../types';

interface FaqSectionProps {
  faqs?: WebsiteSettings['faqs'];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  const defaultFaqs = [
    {
      question: 'Who is this masterclass for?',
      answer: 'CA students looking for articleship opportunities, especially those targeting reputed firms like Big 4, Big 6, top mid-size and consulting firms, as well as students preparing for upcoming articleship drives.',
    },
    {
      question: 'Is this only for Big 4 aspirants?',
      answer: 'No. The framework is relevant to students targeting Big 4, Big 6, reputed mid-size firms, boutique consulting practices, corporate finance divisions, and other professional organisations.',
    },
    {
      question: 'How long is the masterclass?',
      answer: 'The masterclass spans 6 intensive days. Each day features structured live sessions, actionable frameworks, and live interactive Q&A.',
    },
    {
      question: 'What is the fee?',
      answer: '₹999 for the current batch. This is a one-time fee covering all 6 days, downloadable CV templates, cold email scripts, Excel workbooks, and batch WhatsApp group access.',
    },
    {
      question: 'Will I get a WhatsApp group?',
      answer: 'Yes! Immediately after successful registration and server verification, you will receive the official invite link for your specific batch WhatsApp group where all session links and cohort discussions take place.',
    },
    {
      question: 'Are placements guaranteed?',
      answer: 'No. The masterclass provides battle-tested guidance, rigorous preparation, and proven resources, but does not guarantee an articleship offer. Final hiring decisions rest entirely with respective firms and candidate performance.',
    },
    {
      question: 'Are interviews guaranteed?',
      answer: 'No. Historical student outcomes (such as 100% of tracked students receiving at least one Big 6 interview opportunity) reflect historical cohorts and do not guarantee future interview opportunities.',
    },
    {
      question: 'Is the payment refundable?',
      answer: 'Due to strictly limited cohort seats and immediate allocation of batch resources upon enrollment, registration fees are non-refundable.',
    },
    {
      question: 'Will I receive a certificate?',
      answer: 'Yes. Students who complete the 6-day curriculum and submit their capstone assignments will receive a digital Certificate of Completion from Umbrella Network.',
    },
  ];

  const list = faqs && faqs.length > 0 ? faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Everything you need to know about the 6-day cohort, curriculum, and batch onboarding.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {list.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden transition-colors hover:border-slate-300"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.question}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
