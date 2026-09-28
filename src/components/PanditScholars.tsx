import React from 'react';
import { BookOpen, MapPin, Globe, GraduationCap } from 'lucide-react';
import { ACHARYA_SCHOLARS } from '../lib/content';

export const PanditScholars: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-ivory" id="pandits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark">
            Carrying the Tradition
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal">
            Initiated Vedic Acharyas
          </h2>
          <p className="text-sm sm:text-base text-charcoal/70">
            We partner exclusively with initiated Vidyapeetha scholars who carry authentic lineage, gurukula scholarship, and reverence.
          </p>
        </div>

        {/* Scholars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ACHARYA_SCHOLARS.map((p, idx) => (
            <div 
              key={idx}
              className="bg-cream/20 p-6 sm:p-8 rounded-2xl border border-gold/30 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                
                {/* Scholar Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cream border-2 border-gold/40 flex items-center justify-center text-gold-dark font-serif text-2xl font-bold shadow-inner flex-shrink-0">
                    {p.name.split(' ').slice(1, 2)[0]?.[0] || 'V'}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gold-dark font-medium">
                      {p.title}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-2 text-xs text-charcoal/80 pt-2 border-t border-gold/15">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" />
                    <span>{p.institution}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" />
                    <span>{p.vedicTradition} · {p.experienceYears} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" />
                    <span>Languages: {p.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" />
                    <span>{p.area}</span>
                  </div>
                </div>

                {/* Bio */}
                {p.bio && p.bio.trim() ? (
                  <p className="text-xs text-charcoal/70 leading-relaxed italic pt-1">
                    “{p.bio}”
                  </p>
                ) : null}

              </div>

              <div className="pt-4 border-t border-gold/15 flex items-center justify-between text-[11px] text-charcoal/60">
                <span className="font-medium text-gold-dark">Verified Scholar</span>
                <span>Bengaluru Division</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
