import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

export const WhatIsVardhantotsava: React.FC = () => {
  return (
    <section className="py-20 bg-cream/40 border-y border-gold/15 relative overflow-hidden">
      {/* Decorative subtle Sanskrit typography in background */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-5"
        aria-hidden="true"
      >
        <span className="font-sanskrit text-[140px] sm:text-[220px] font-bold text-gold tracking-widest whitespace-nowrap">
          आयुष्मान् भव
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-10">
        
        {/* Eyebrow */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gold-dark">
            What is Vardhantotsava?
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal tracking-tight">
            More than another birthday.
          </h2>
        </div>

        {/* Narrative */}
        <p className="text-lg sm:text-xl text-charcoal/80 font-serif leading-relaxed max-w-2xl mx-auto italic">
          “Vardhantotsava marks the completion of another year of life and the beginning 
          of the next with gratitude, prayer, and blessings for āyushya, wellbeing, and prosperity.”
        </p>

        {/* Comparison Graphic */}
        <div className="max-w-xl mx-auto bg-ivory p-6 sm:p-8 rounded-2xl border border-gold/25 shadow-sacred">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="p-4 rounded-xl bg-cream/50 border border-gold/20 text-center">
              <span className="text-[11px] uppercase tracking-wider text-charcoal/60 font-semibold block mb-1">
                Modern Birthday
              </span>
              <p className="font-serif text-xl sm:text-2xl text-charcoal font-medium">
                Celebrates your age.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gold/10 border border-gold/40 text-center relative">
              <span className="text-[11px] uppercase tracking-wider text-gold-dark font-semibold block mb-1">
                Vardhantotsava
              </span>
              <p className="font-serif text-xl sm:text-2xl text-gold-dark font-semibold">
                Blesses the year ahead.
              </p>
            </div>

          </div>

          <p className="text-xs text-charcoal/65 mt-5 leading-normal">
            No lectures. No preaching against cakes or gifts. We simply add a sacred, grounding beginning to your day.
          </p>
        </div>

      </div>
    </section>
  );
};
