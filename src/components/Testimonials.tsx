import React, { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, MessageSquare, Building2, Compass, Linkedin } from 'lucide-react';
import type { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayList = testimonials && testimonials.length > 0 ? testimonials : [];

  const handlePrev = () => {
    if (displayList.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? displayList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displayList.length === 0) return;
    setCurrentIndex((prev) => (prev === displayList.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Verified Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Students Say
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Real reflections from past cohort participants on how the strategic approach changed
            their articleship search.
          </p>
        </div>

        {displayList.length > 0 ? (
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-slate-50/80 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs relative">
              <Quote className="w-12 h-12 text-blue-200 absolute top-6 right-8 pointer-events-none" />

              <div className="relative z-10">
                <p className="text-base sm:text-lg text-slate-800 font-normal leading-relaxed italic mb-8">
                  “{displayList[currentIndex].testimonial}”
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200">
                      {displayList[currentIndex].student_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">
                        {displayList[currentIndex].student_name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        {displayList[currentIndex].firm && (
                          <span className="font-semibold text-blue-700">
                            {displayList[currentIndex].firm}
                          </span>
                        )}
                        {displayList[currentIndex].domain && (
                          <>
                            <span>•</span>
                            <span>{displayList[currentIndex].domain}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-500 px-1">
                      {currentIndex + 1} / {displayList.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder state if no testimonials entered yet */
          <div className="max-w-2xl mx-auto bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-10 text-center">
            <Quote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              Student testimonial will appear here.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Testimonials are managed securely through the admin panel to ensure zero fabricated
              reviews.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
