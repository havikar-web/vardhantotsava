import React from 'react';
import { ArrowRight, CheckCircle2, Home, Flame, Clock, Sparkles } from 'lucide-react';
import { RITUAL_STEPS, SUNRISE_TIMELINE } from '../lib/content';

interface HowProps {
  navigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowProps> = ({ navigate }) => {
  return (
    <div className="py-12 bg-ivory">
      
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pb-16">
        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark block">
          Simple & Dignified
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-charcoal leading-tight">
          How It Works
        </h1>
        <p className="text-base sm:text-lg text-charcoal/75 max-w-xl mx-auto">
          From your first details to the sacred homa and delivered prasada — organised with complete ease.
        </p>
      </section>

      {/* Step by Step Breakdown */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream/30 p-8 rounded-3xl border border-gold/30 shadow-sm">
          <div className="md:col-span-4 text-center md:text-left">
            <span className="font-serif text-6xl font-bold text-gold-dark/40">01</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal mt-1">Book & Vedic Calculation</h3>
            <p className="text-xs text-charcoal/60 mt-1">Provide birth details & address</p>
          </div>
          <div className="md:col-span-8 text-xs sm:text-sm text-charcoal/80 space-y-2 leading-relaxed">
            <p>
              Enter the celebrant's name, birth date, time, and Bengaluru address. Our astronomical engine calculates their 
              Janma Nakshatra and Rashi, recommending the optimal Vedic date. You can choose either the Vedic star date or your Gregorian birthday.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream/30 p-8 rounded-3xl border border-gold/30 shadow-sm">
          <div className="md:col-span-4 text-center md:text-left">
            <span className="font-serif text-6xl font-bold text-gold-dark/40">02</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal mt-1">Home Preparation</h3>
            <p className="text-xs text-charcoal/60 mt-1">Simple checklist provided</p>
          </div>
          <div className="md:col-span-8 text-xs sm:text-sm text-charcoal/80 space-y-2 leading-relaxed">
            <p>
              We keep preparation minimal for your home: a clean floor space, seating mats (mane/asana), clean water, 
              fresh flowers, and fruits. All sacred samagri, brassware, and ceremonial offerings are brought directly by our Acharya.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream/30 p-8 rounded-3xl border border-gold/30 shadow-sm">
          <div className="md:col-span-4 text-center md:text-left">
            <span className="font-serif text-6xl font-bold text-gold-dark/40">03</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal mt-1">Acharya Home Visit</h3>
            <p className="text-xs text-charcoal/60 mt-1">Deepa Prajwalana, Punyavachana & Sankalpa</p>
          </div>
          <div className="md:col-span-8 text-xs sm:text-sm text-charcoal/80 space-y-2 leading-relaxed">
            <p>
              An initiated Vedic Acharya arrives punctually at your Bengaluru home. Together, your family lights the deepa, 
              and the Acharya conducts Deepa Prajwalana, Punyavachana, Maha Sankalpa, and Maha Ashirvada in the celebrant's name.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream/30 p-8 rounded-3xl border border-gold/30 shadow-sm">
          <div className="md:col-span-4 text-center md:text-left">
            <span className="font-serif text-6xl font-bold text-gold-dark/40">04</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal mt-1">Ayushya Homa & Live Stream</h3>
            <p className="text-xs text-charcoal/60 mt-1">Shared with family everywhere</p>
          </div>
          <div className="md:col-span-8 text-xs sm:text-sm text-charcoal/80 space-y-2 leading-relaxed">
            <p>
              The sacred Ayushya Homa is consecrated in the celebrant's name. A private HD livestream link allows family members, 
              grandparents, or children abroad to join and participate live in the blessings.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream/30 p-8 rounded-3xl border border-gold/30 shadow-sm">
          <div className="md:col-span-4 text-center md:text-left">
            <span className="font-serif text-6xl font-bold text-gold-dark/40">05</span>
            <h3 className="font-serif text-2xl font-bold text-charcoal mt-1">Prasada & Family Blessings</h3>
            <p className="text-xs text-charcoal/60 mt-1">Consecrated offerings delivered</p>
          </div>
          <div className="md:col-span-8 text-xs sm:text-sm text-charcoal/80 space-y-2 leading-relaxed">
            <p>
              Sacred Mantrakshata (consecrated rice grains) is showered by elders, followed by fresh prasada delivered to your doorstep. 
              The celebrant begins the rest of their birthday surrounded by goodwill and divine grace.
            </p>
          </div>
        </div>

      </section>

      {/* CTA Box */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <div className="bg-charcoal text-ivory p-8 sm:p-10 rounded-3xl border border-gold/40 shadow-xl space-y-4">
          <h3 className="font-serif text-3xl font-semibold text-white">
            Ready to plan a meaningful beginning?
          </h3>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-md mx-auto">
            Bookings are currently open for families in Bengaluru. Select your date and preferred package in under 3 minutes.
          </p>
          <button
            onClick={() => navigate('/book')}
            className="bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold px-8 py-4 rounded-full shadow-sacred inline-flex items-center gap-2"
          >
            <span>Begin Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
