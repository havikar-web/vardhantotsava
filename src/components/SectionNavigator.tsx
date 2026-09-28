import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';

interface SectionItem {
  id: string;
  num: string;
  name: string;
  tagline: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'hero', num: '01', name: 'Sacred Dawn', tagline: 'Vardhantotsava' },
  { id: 'journey', num: '02', name: 'Five Rituals', tagline: 'Acharya Home Ceremony' },
  { id: 'livestream', num: '03', name: 'Ayushya Homa', tagline: 'Virtual and At-Home' },
  { id: 'personalise', num: '04', name: 'Vedic Date', tagline: 'Janma Nakshatra' },
  { id: 'packages', num: '05', name: 'Packages', tagline: 'Aarambha to Parampara' },
  { id: 'timeline', num: '06', name: 'Timeline', tagline: 'Diurnal Solar Arc' },
  { id: 'gifting', num: '07', name: 'Havikar Gifts', tagline: 'Custom Keepsake Box' },
  { id: 'stories', num: '08', name: 'Stories', tagline: 'Bengaluru Families' },
  { id: 'faqs', num: '09', name: 'FAQs', tagline: 'Clarifications' },
];

export const SectionNavigator: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.45;
      
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < SECTIONS.length - 1) {
          e.preventDefault();
          scrollToSection(SECTIONS[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          e.preventDefault();
          scrollToSection(SECTIONS[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  const goNext = () => {
    if (currentIdx < SECTIONS.length - 1) {
      scrollToSection(SECTIONS[currentIdx + 1].id);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      scrollToSection(SECTIONS[currentIdx - 1].id);
    }
  };

  return (
    <nav
      aria-label="Section Navigation"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2 select-none"
    >
      <button
        onClick={goPrev}
        disabled={currentIdx === 0}
        aria-label="Previous Section"
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          currentIdx === 0
            ? 'opacity-20 cursor-not-allowed text-[#8C7A6E]'
            : 'text-[#9E6B2D] hover:bg-[#FAF5ED] hover:scale-110 active:scale-95 border border-[#D5C2A4]/60'
        }`}
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col items-center gap-2 py-2.5 px-1 rounded-full bg-[#FAF5ED]/90 backdrop-blur-md border border-[#D5C2A4]/60 shadow-sacred">
        {SECTIONS.map((sec, idx) => {
          const isActive = activeSection === sec.id;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={sec.id}
              className="relative flex items-center justify-center group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className={`absolute right-7 px-2.5 py-1 rounded-lg bg-[#251B14]/95 text-white backdrop-blur-md border border-[#B37418]/40 shadow-xl pointer-events-none transition-all duration-150 whitespace-nowrap z-50 flex items-center gap-1.5 ${
                  isHovered
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-2'
                }`}
              >
                <span className="font-mono text-[9px] text-[#F5D061] font-bold">
                  {sec.num}
                </span>
                <span className="font-serif text-xs font-semibold text-[#FAF5ED]">
                  {sec.name}
                </span>
                <span className="text-[9.5px] text-[#C2B5A3]">
                  - {sec.tagline}
                </span>
              </div>

              <button
                onClick={() => scrollToSection(sec.id)}
                aria-label={`Go to section ${sec.num}: ${sec.name}`}
                className={`transition-all duration-200 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'w-6 h-6 bg-[#B37418] text-white shadow-gold-glow scale-105'
                    : 'w-2 h-2 bg-[#8C7A6E]/40 hover:bg-[#B37418] hover:scale-125'
                }`}
              >
                {isActive && (
                  <Flame className="w-3 h-3 text-[#FFF6DF]" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={goNext}
        disabled={currentIdx === SECTIONS.length - 1}
        aria-label="Next Section"
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          currentIdx === SECTIONS.length - 1
            ? 'opacity-20 cursor-not-allowed text-[#8C7A6E]'
            : 'text-[#9E6B2D] hover:bg-[#FAF5ED] hover:scale-110 active:scale-95 border border-[#D5C2A4]/60'
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <div className="font-mono text-[9.5px] font-bold text-[#9E6B2D] bg-[#FAF5ED]/90 px-1.5 py-0.5 rounded-full border border-[#D5C2A4]/60 mt-0.5 shadow-2xs">
        {SECTIONS[currentIdx]?.num} / 09
      </div>
    </nav>
  );
};
