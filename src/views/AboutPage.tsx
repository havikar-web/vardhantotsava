import React from 'react';
import { ArrowRight, Sparkles, Heart, Award, MapPin } from 'lucide-react';
import { WhyMantrakshata } from '../components/WhyMantrakshata';
import { PanditScholars } from '../components/PanditScholars';

interface AboutProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutProps> = ({ navigate }) => {
  return (
    <div className="py-12 bg-ivory">
      
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pb-16">
        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark block">
          Rooted in Continuity
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-charcoal leading-tight">
          Some traditions survived because families kept performing them.
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-charcoal/80 italic max-w-2xl mx-auto">
          “Mantrakshata exists to make those traditions easier for another generation to understand, organise, and continue.”
        </p>
      </section>

      {/* Story Narrative */}
      <section className="bg-cream/30 py-16 border-y border-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-charcoal/80 leading-relaxed text-base sm:text-lg">
          <div className="bg-ivory p-8 sm:p-10 rounded-3xl border border-gold/30 shadow-sacred space-y-5">
            <h3 className="font-serif text-3xl font-bold text-charcoal">
              A Quiet Awakening at Home
            </h3>
            <p>
              Growing up in India, the most sacred memories often didn't happen in distant pilgrimage queues. 
              They happened on living room floors — when grandfather lit a brass deepa, grandmother tied a sacred raksha, 
              and a scholarly priest recited ancient mantras that made the home feel instantly still and blessed.
            </p>
            <p>
              Over the last two decades, modern family lives became faster, busier, and more fragmented. 
              Birthdays became exclusively about ordering cakes, buying things, and having parties. 
              There is nothing wrong with cake or dinner — we love them. But somewhere along the way, 
              the grounding spiritual start to the year was lost.
            </p>
            <p>
              Families wanted to perform traditional rituals, but arranging them was exhausting: 
              finding an authentic priest, procuring 25 obscure puja items, calculating dates, and coordinating everything. 
              Mantrakshata was born in Bengaluru to remove the friction without commercializing the ritual.
            </p>
          </div>

          {/* Long term vision */}
          <div className="p-8 rounded-2xl bg-ivory border border-gold/20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Our Broader Horizon</span>
            <h4 className="font-serif text-2xl font-bold text-charcoal">A Platform for Traditional Life Events</h4>
            <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
              While we own Vardhantotsava today with uncompromising craftsmanship, our long-term vision is to support 
              families across sacred Samskaras: Vivaha Vardhantotsava (Anniversaries), Grihapravesha, Namakarana, and traditional family Homas.
            </p>
          </div>
        </div>
      </section>

      <WhyMantrakshata />
      <PanditScholars />

      {/* Bengaluru Hub Contact */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="bg-cream/40 p-8 rounded-3xl border border-gold/30 space-y-3">
          <span className="text-xs uppercase font-bold text-gold-dark tracking-widest">Operations & Care</span>
          <h4 className="font-serif text-2xl font-bold text-charcoal">Bengaluru Centre</h4>
          <p className="text-xs text-charcoal/70 max-w-md mx-auto">
            Mantrakshata Sacred Offerings · Jayanagar 4th Block, Bengaluru, Karnataka 560041
          </p>
          <p className="text-xs text-charcoal/60">
            For ritual guidance and private family consultation: coordinator@mantrakshata.com · +91 98450 00000
          </p>
        </div>
      </section>

    </div>
  );
};
