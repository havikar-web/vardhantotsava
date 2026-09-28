import React from 'react';
import { ArrowRight } from 'lucide-react';

interface StickyBottomBarProps {
  navigate: (path: string) => void;
  currentPath: string;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ navigate, currentPath }) => {
  if (currentPath === '/book' || currentPath === '/dashboard') {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-gold/30 p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">
            Vardhantotsava
          </span>
          <span className="text-xs text-charcoal font-medium">
            Bengaluru Home Visit
          </span>
        </div>
        
        <button
          onClick={() => {
            navigate('/book');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-full shadow-sacred flex items-center gap-2 transition-transform active:scale-95"
        >
          <span>Plan Vardhantotsava</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
