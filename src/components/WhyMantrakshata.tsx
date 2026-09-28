import React from 'react';
import { Award, UserCheck, ShieldCheck } from 'lucide-react';

export const WhyMantrakshata: React.FC = () => {
  return (
    <section className="py-20 lg:py-24 bg-cream/30 border-y border-gold/20" id="why">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark">
            Our Foundation
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal">
            Tradition shouldn't become inconvenient.
          </h2>
          <p className="text-base text-charcoal/80 leading-relaxed font-serif italic max-w-2xl mx-auto">
            “Mantrakshata makes traditional celebrations easier to understand, arrange, 
            and participate in — without reducing the sacred ritual itself to a transaction.”
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-ivory p-8 rounded-2xl border border-gold/25 shadow-sacred space-y-4 text-left">
            <div className="w-12 h-12 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-gold-dark">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">
              Authentic
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
              Rituals performed strictly according to defined Vedic traditions by initiated Vedic Acharyas 
              from authentic Gurukulas and Sanskrit Vidyapeethas. No shortcuts.
            </p>
          </div>

          <div className="bg-ivory p-8 rounded-2xl border border-gold/25 shadow-sacred space-y-4 text-left">
            <div className="w-12 h-12 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-gold-dark">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">
              Personal
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
              Prepared around the celebrant and their family. The Gotra, Janma Nakshatra, 
              and family sankalpa are woven specifically into every invocation.
            </p>
          </div>

          <div className="bg-ivory p-8 rounded-2xl border border-gold/25 shadow-sacred space-y-4 text-left">
            <div className="w-12 h-12 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-gold-dark">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">
              Accessible
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
              Organised, scheduled, and followed up without running around arranging flowers, 
              samagri, and priests yourself. Pure, dignified, and calm.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
