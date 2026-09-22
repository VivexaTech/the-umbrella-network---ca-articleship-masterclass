import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Batch } from '../types';

interface MobileStickyCtaProps {
  onJoinClick: (batch?: Batch) => void;
  activeBatch?: Batch | null;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({ onJoinClick, activeBatch }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past 350px
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const fee = activeBatch?.fee || 999;
  const batchNum = activeBatch?.batch_number || 'Batch #05';

  return (
    <div
      id="mobile-sticky-cta"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-2"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-900 uppercase">
              {batchNum} Open
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">₹{fee}</span>
            <span className="text-[10px] text-slate-500">all 6 days</span>
          </div>
        </div>

        <button
          onClick={() => onJoinClick(activeBatch || undefined)}
          className="flex items-center justify-center gap-1.5 bg-blue-600 active:bg-blue-700 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-md min-h-[44px] cursor-pointer"
          id="mobile-sticky-join-btn"
        >
          <span>Join for ₹{fee}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
