import React from 'react';
import { ArrowRight, Heart, Sun, Flame, Check } from 'lucide-react';
import { RitualJourney } from '../components/RitualJourney';
import { WhoCanCelebrate } from '../components/WhoCanCelebrate';
import { HomaLivestreamSection } from '../components/HomaLivestreamSection';

interface PageProps {
  navigate: (path: string) => void;
}

export const VardhantotsavaPage: React.FC<PageProps> = ({ navigate }) => {
  return (
    <div className="py-12 bg-ivory">
      
      {/* Page Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pb-16">
        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark block">
          A Sacred Milestone
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-charcoal leading-tight">
          What is Vardhantotsava?
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-charcoal/80 italic max-w-2xl mx-auto">
          “A traditional Vedic way of celebrating your birthday with prayer, gratitude, and blessings for the year ahead.”
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => navigate('/book')}
            className="bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold px-8 py-4 rounded-full shadow-sacred flex items-center gap-2"
          >
            <span>Plan a Vardhantotsava</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="bg-cream/30 py-16 border-y border-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-charcoal/80 leading-relaxed text-base sm:text-lg">
          
          <div className="p-8 rounded-2xl bg-ivory border border-gold/30 shadow-sm space-y-4">
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              The Meaning of Vardhantotsava
            </h3>
            <p>
              In classical Sanskrit, <em>Vardhanta</em> stems from <em>Vridh</em> (to grow, thrive, prosper, and advance in life). 
              <em>Utsava</em> signifies an uplifting sacred celebration.
            </p>
            <p>
              While contemporary birthdays mark the passage of time by blowing out candles, Vedic tradition marks each birthday by 
              <strong> lighting a sacred deepa</strong>, expressing gratitude to parents and ancestors, and invoking the deities 
              of longevity (Āyushya Devatas) and health (Maha Mrityunjaya) for the year ahead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-ivory p-6 rounded-2xl border border-gold/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Solar vs Lunar Tithi</span>
              <h4 className="font-serif text-xl font-bold text-charcoal">Janma Nakshatra Celebration</h4>
              <p className="text-xs text-charcoal/70">
                Traditionally, birthdays are celebrated on the day the Moon returns to the birth star (Janma Nakshatra) in the birth month. 
                Mantrakshata calculates this exact day for your family.
              </p>
            </div>

            <div className="bg-ivory p-6 rounded-2xl border border-gold/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Modern Harmony</span>
              <h4 className="font-serif text-xl font-bold text-charcoal">Keep the Cake & Dinner</h4>
              <p className="text-xs text-charcoal/70">
                We believe in adding meaning, not lecturing customers. Celebrate the morning with Vedic chants and elders' blessings, 
                and enjoy cake and celebrations in the evening.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Ritual Journey Component */}
      <RitualJourney navigate={navigate} />

      {/* Ayushya Homa Deep-Dive */}
      <HomaLivestreamSection navigate={navigate} />

      {/* Who Can Celebrate */}
      <WhoCanCelebrate navigate={navigate} />

    </div>
  );
};
