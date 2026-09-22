import React, { useState, useRef, useEffect } from 'react';
import { Linkedin, Compass, Sparkles, ExternalLink, Camera, Upload, Check, X, RefreshCw, Users, CheckCircle2 } from 'lucide-react';
import type { Speaker } from '../types';

interface StudentSpeakersProps {
  speakers?: Speaker[];
}

export const StudentSpeakers: React.FC<StudentSpeakersProps> = ({ speakers: propSpeakers }) => {
  const defaultSpeakers: Speaker[] = [
    {
      id: 'spk-1',
      name: 'Vanshika Nihalani',
      firm: 'Deloitte',
      domain: 'Statutory Audit',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      description: 'Secured Statutory Audit articleship at Deloitte; shares practical guidance on cracking Big 4 technical & managerial rounds.',
      linkedin_url: 'https://www.linkedin.com/in/vanshika-nihalani0703/',
      status: 'active',
    },
    {
      id: 'spk-2',
      name: 'Disha Pahwa',
      firm: 'BDO',
      domain: 'Statutory Audit',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      description: 'Secured articleship at BDO in Statutory Audit; mentors students on structured resume building and first impressions.',
      linkedin_url: 'https://www.linkedin.com/in/disha-pahwa-5155573b4/',
      status: 'active',
    },
    {
      id: 'spk-3',
      name: 'Nitish Thawani',
      firm: 'BDO',
      domain: 'Statutory Audit',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      description: 'Articleship at BDO; guides on technical questions, Ind AS fundamentals, and audit interview questions.',
      linkedin_url: 'https://www.linkedin.com/in/nitishthawani01/',
      status: 'active',
    },
    {
      id: 'spk-4',
      name: 'Faizal',
      firm: 'EY',
      domain: 'Direct Tax',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      description: 'Direct Tax articleship at EY; shares strategies on answering tax case studies and HR interview questions.',
      linkedin_url: 'https://www.linkedin.com/in/md-f-37359a36b/',
      status: 'active',
    },
    {
      id: 'spk-5',
      name: 'Gitanjali Joshi',
      firm: 'BDO',
      domain: 'M&A Tax',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      description: 'M&A Tax at BDO; helps students navigate niche domain selection, firm cultures, and strategic networking.',
      linkedin_url: 'https://www.linkedin.com/in/gitanjali-joshi-58b9b5213/',
      status: 'active',
    },
    {
      id: 'spk-6',
      name: 'Sparsh Garg',
      firm: 'EY',
      domain: 'Internal Audit',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      description: 'Internal Audit at EY; guides candidates through risk consulting interview structures and group discussions.',
      linkedin_url: 'https://www.linkedin.com/in/sparsh-garg-a52418327/',
      status: 'active',
    },
    {
      id: 'spk-7',
      name: 'Sujal Agarwal',
      firm: 'BDO',
      domain: 'Accounting',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      description: 'Accounting & Advisory at BDO; covers practical Excel skills, accounting standards, and cold emailing strategies.',
      linkedin_url: 'https://www.linkedin.com/in/sujalagarwal07/',
      status: 'active',
    },
  ];

  const [speakersList, setSpeakersList] = useState<Speaker[]>(() => {
    const initial = propSpeakers && propSpeakers.length > 0 ? propSpeakers : defaultSpeakers;
    return initial.map(s => {
      const local = localStorage.getItem(`speaker_photo_${s.id}`);
      return local ? { ...s, image: local } : s;
    });
  });

  // Modal for managing all photos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Hidden file input refs map
  const fileInputsRef = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propSpeakers && propSpeakers.length > 0) {
      setSpeakersList(prev => {
        return propSpeakers.map(ps => {
          const local = localStorage.getItem(`speaker_photo_${ps.id}`);
          return local ? { ...ps, image: local } : ps;
        });
      });
    }
  }, [propSpeakers]);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Upload photo handler for single student
  const handlePhotoSelect = (speakerId: string, file: File) => {
    if (!file) return;
    setActiveUploadId(speakerId);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) {
        setActiveUploadId(null);
        return;
      }

      // 1. Immediate optimistic update in state
      setSpeakersList(prev =>
        prev.map(s => (s.id === speakerId ? { ...s, image: base64 } : s))
      );
      // 2. Persist in localStorage
      localStorage.setItem(`speaker_photo_${speakerId}`, base64);

      const targetSpeaker = speakersList.find(s => s.id === speakerId);
      const studentName = targetSpeaker ? targetSpeaker.name : 'Student';

      // 3. Sync to server endpoint
      try {
        const res = await fetch(`/api/speakers/${speakerId}/photo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setSpeakersList(prev =>
            prev.map(s => (s.id === speakerId ? { ...s, image: data.imageUrl } : s))
          );
        }
        showNotification(`✓ Photo updated for ${studentName}!`);
      } catch (err) {
        console.error('Failed to sync photo with server:', err);
        showNotification(`✓ Photo applied locally for ${studentName}.`);
      } finally {
        setActiveUploadId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Multi-file batch upload (select several photos at once from computer)
  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, speakersList.length);
    showNotification(`Processing ${fileArray.length} photos...`);

    const promises = fileArray.map((file, idx) => {
      const spk = speakersList[idx];
      if (!spk) return Promise.resolve(null);
      return new Promise<{ id: string; base64: string; name: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ id: spk.id, base64: e.target?.result as string, name: spk.name });
        };
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(promises);
    const validResults = results.filter((r): r is { id: string; base64: string; name: string } => !!r && !!r.base64);

    // Apply to state and localStorage
    setSpeakersList(prev => {
      let updated = [...prev];
      for (const res of validResults) {
        localStorage.setItem(`speaker_photo_${res.id}`, res.base64);
        updated = updated.map(s => (s.id === res.id ? { ...s, image: res.base64 } : s));
      }
      return updated;
    });

    // Send batch to backend
    try {
      await fetch('/api/speakers/batch-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: validResults.map(r => ({ id: r.id, image: r.base64 })),
        }),
      });
      showNotification(`✓ Successfully updated photos for ${validResults.length} students!`);
    } catch (err) {
      console.error('Batch upload error:', err);
      showNotification(`✓ Applied ${validResults.length} photos.`);
    }
  };

  const handleResetPhoto = (speakerId: string) => {
    localStorage.removeItem(`speaker_photo_${speakerId}`);
    const original = defaultSpeakers.find(s => s.id === speakerId);
    if (original) {
      setSpeakersList(prev =>
        prev.map(s => (s.id === speakerId ? { ...s, image: original.image } : s))
      );
      fetch(`/api/speakers/${speakerId}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: original.image }),
      }).catch(console.error);
      showNotification(`Reset photo to default for ${original.name}.`);
    }
  };

  return (
    <section id="speakers" className="py-20 bg-white border-b border-slate-200/80 relative">
      {/* Toast feedback notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-2.5 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer Mentorship & Guest Sessions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Learn From Students Who Have Been Through It.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Connect with recent articleship achievers who sat where you are sitting today, prepared
            strategically, and successfully cracked Big 4 & Big 6 firms.
          </p>

          {/* Quick Action Bar to select photos for all students */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Select Photos for All Students</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (You can also click the camera icon on any student's card below)
            </span>
          </div>
        </div>

        {/* 7 Student Speaker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {speakersList.map((spk) => {
            const isUploading = activeUploadId === spk.id;
            return (
              <div
                key={spk.id || spk.name}
                className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Hidden input for this specific student */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputsRef.current[spk.id] = el;
                  }}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(spk.id, file);
                  }}
                />

                <div>
                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Avatar with Click-to-Upload */}
                    <div className="relative group/avatar shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-slate-300 group-hover:border-blue-500 transition-colors shadow-sm">
                        <img
                          src={spk.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt={spk.name}
                          className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Camera badge overlay */}
                      <button
                        onClick={() => fileInputsRef.current[spk.id]?.click()}
                        title={`Select photo for ${spk.name} from computer`}
                        className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-1.5 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>

                      {isUploading && (
                        <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {spk.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {spk.firm}
                        </span>
                      </div>
                      <button
                        onClick={() => fileInputsRef.current[spk.id]?.click()}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 cursor-pointer"
                      >
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-xs">
                      <Compass className="w-3 h-3 text-blue-600" />
                      <span>{spk.domain}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {spk.description}
                  </p>
                </div>

                {spk.linkedin_url && (
                  <div className="mt-5 pt-3 border-t border-slate-200/60">
                    <a
                      href={spk.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>View LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Central Photo Selector for All Students */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Select Photos from Your Computer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload photos for each of the 7 student mentors in the Peer Mentorship section.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Upload Helper Banner */}
            <div className="px-5 py-3.5 bg-blue-50/80 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-blue-900">
                  Tip: Have multiple photos ready on your computer?
                </p>
                <p className="text-[11px] text-blue-700">
                  Select up to 7 photos simultaneously to auto-assign to each student sequentially.
                </p>
              </div>
              <div>
                <button
                  onClick={() => batchFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Multiple Photos</span>
                </button>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBatchFiles(e.target.files)}
                />
              </div>
            </div>

            {/* List of all 7 Students */}
            <div className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-4">
              {speakersList.map((spk, index) => (
                <div key={spk.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={spk.image}
                        alt={spk.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-xs"
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{spk.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {spk.firm}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{spk.domain}</p>
                    </div>
                  </div>

                  {/* Actions for this student */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => fileInputsRef.current[spk.id]?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Choose Photo</span>
                    </button>
                    <button
                      onClick={() => handleResetPhoto(spk.id)}
                      title="Reset to default photo"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All uploaded photos persist permanently across page refreshes.
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
