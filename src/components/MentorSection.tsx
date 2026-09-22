import React from 'react';
import { Award, Briefcase, CheckCircle2, ArrowRight, Linkedin, Camera } from 'lucide-react';
import type { WebsiteSettings } from '../types';

interface MentorSectionProps {
  onLearnWithMeClick: () => void;
  mentorData?: WebsiteSettings['mentor'];
}

export const MentorSection: React.FC<MentorSectionProps> = ({ onLearnWithMeClick, mentorData }) => {
  const credentials = mentorData?.credentials || [
    'Qualified CA in first attempt',
    'AIR 24 in CA Foundation',
    'Articleship at PwC',
    'Articleship at Flipkart',
    'Former Assistant Manager at Deloitte',
  ];

  const [photoUrl, setPhotoUrl] = React.useState<string>(() => {
    return (
      localStorage.getItem('mentor_harsh_photo') ||
      mentorData?.image_url ||
      '/mentor-harsh-kaushik.jpg'
    );
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const savedLocal = localStorage.getItem('mentor_harsh_photo');
    if (savedLocal) {
      setPhotoUrl(savedLocal);
    } else if (mentorData?.image_url) {
      setPhotoUrl(mentorData.image_url);
    }
  }, [mentorData?.image_url]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPhotoUrl(base64);
        localStorage.setItem('mentor_harsh_photo', base64);
        try {
          const res = await fetch('/api/mentor/photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          });
          const data = await res.json();
          if (data.success && data.imageUrl) {
            setPhotoUrl(data.imageUrl);
          }
        } catch (err) {
          console.error('Failed to sync mentor photo:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="mentor" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Mentor Avatar & Quick Badges */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-xl bg-slate-800 relative group">
                  <img
                    src={photoUrl}
                    alt="CA Harsh Kaushik"
                    className="w-full h-full object-cover object-top filter brightness-95 contrast-105 transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('photo-1507003211169')) {
                        target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 pointer-events-none" />

                  {/* Change Photo Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload CA Harsh Kaushik Photo"
                    className="absolute top-3 right-3 bg-slate-900/85 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700 hover:border-blue-400 shadow-lg backdrop-blur-sm transition-all opacity-85 hover:opacity-100 cursor-pointer z-10 flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-blue-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                      Founder & Lead Mentor
                    </span>
                  </div>
                </div>

                {/* AIR Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-amber-300">
                  AIR 24
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                {mentorData?.name || 'CA Harsh Kaushik'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-300 font-medium mt-1">
                {mentorData?.title || 'Chartered Accountant | Articleship & Career Mentor'}
              </p>

              <a
                href={mentorData?.linkedin_url || 'https://www.linkedin.com/in/ca-harsh-kaushik/'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>

            {/* Right Col: Authentic Story & Credentials */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
                  <span>Meet Your Mentor</span>
                </div>

                {/* Authentic Quote */}
                <blockquote className="text-lg sm:text-xl text-slate-200 font-normal italic leading-relaxed border-l-2 border-blue-500 pl-4 py-1">
                  “{mentorData?.quote || "I created this masterclass because I remember how confusing the articleship search can be when you don't know where to start, how to approach firms, or how to present yourself."}”
                </blockquote>

                <p className="text-sm text-slate-400 leading-relaxed">
                  Harsh has guided hundreds of CA aspirants through the nuances of resume structuring,
                  domain positioning, and partner interview dynamics. Having trained at both PwC and
                  Flipkart and worked at Deloitte, his advice is anchored strictly in corporate reality.
                </p>

                {/* Proven Track Record Checklist */}
                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                    Verified Credentials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {credentials.map((cred, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mentor CTA */}
              <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Direct live interaction & personalized Q&A during all 6 days.
                </div>
                <button
                  onClick={onLearnWithMeClick}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  id="mentor-cta-learn-with-me"
                >
                  <span>Learn With Me</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
