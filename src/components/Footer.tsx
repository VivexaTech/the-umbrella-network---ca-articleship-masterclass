import React, { useState } from 'react';
import { Linkedin, Mail, Phone, Shield, X } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  const scrollTo = (hash: string) => {
    if (hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.querySelector(hash);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer-section" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Col 1 & 2: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                ☂
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                The Umbrella <span className="text-blue-500">Network</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Articleship Masterclass for CA Students. A practical career platform focused on helping
              students build an authentic, strategic advantage in their articleship journey across
              Big 4, Big 6, and reputed firms.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/ca-harsh-kaushik/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:caumbrellanetwork@gmail.com"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919996506041"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollTo('#')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#current-batch')} className="hover:text-white transition-colors">
                  Masterclass
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#modules')} className="hover:text-white transition-colors">
                  What You'll Learn
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#roadmap')} className="hover:text-white transition-colors">
                  6-Day Roadmap
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Mentorship & Social Proof */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Program
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollTo('#mentor')} className="hover:text-white transition-colors">
                  Mentor (CA Harsh Kaushik)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#speakers')} className="hover:text-white transition-colors">
                  Student Experiences
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#testimonials')} className="hover:text-white transition-colors">
                  What Students Say
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#faqs')} className="hover:text-white transition-colors">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#contact')} className="hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policies */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModal('refund')}
                  className="hover:text-white transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onAdminClick}
                  className="text-xs text-slate-600 hover:text-slate-400 underline"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 The Umbrella Network. All Rights Reserved.</p>
          <p className="text-slate-600 text-center sm:text-right">
            Designed specifically for CA Articleship Seekers. Not affiliated with ICAI.
          </p>
        </div>
      </div>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            {legalModal === 'privacy' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    The Umbrella Network collects necessary student registration information
                    including full name, email address, phone number, and CA qualification level solely
                    for the purpose of conducting the Articleship Masterclass and assigning students to
                    their respective cohort WhatsApp group.
                  </p>
                  <p>
                    We never sell, rent, or distribute student information to third-party marketing
                    agencies. Payment credentials (card numbers, UPI IDs) are processed through secure
                    PCI-DSS compliant gateways and are never stored on our servers.
                  </p>
                </div>
              </div>
            )}

            {legalModal === 'terms' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    By registering for the 6-Day Articleship Masterclass, you agree to attend sessions
                    respectfully and use provided templates and materials strictly for personal career
                    development.
                  </p>
                  <p>
                    Redistributing, recording without authorization, or commercially reselling masterclass
                    modules or proprietary frameworks is strictly prohibited.
                  </p>
                  <p>
                    Umbrella Network provides educational guidance, preparation frameworks, and
                    curated career resources. While our historical tracked cohort achieved 100% Big 6
                    interview opportunities, we do not issue commercial placement guarantees.
                  </p>
                </div>
              </div>
            )}

            {legalModal === 'refund' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Refund Policy</h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Because each cohort features strictly capped seating to maintain personalized CV
                    reviews and interactive feedback quality, and because digital templates are issued
                    promptly, registration fees (₹999) are non-refundable once paid.
                  </p>
                  <p>
                    In the unforeseen event that a scheduled batch is cancelled or rescheduled by Umbrella
                    Network, registered students will be offered a full refund or free transfer to the next
                    available batch.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
