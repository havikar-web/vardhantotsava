import React from 'react';
import { Sparkles, Heart, Users, Shield } from 'lucide-react';

interface WhoCanProps {
  navigate: (path: string) => void;
}

export const WhoCanCelebrate: React.FC<WhoCanProps> = ({ navigate }) => {
  const categories = [
    {
      age: '1 year',
      sanskrit: 'बाल्यावस्था',
      title: 'Children',
      desc: 'Start their year with blessings. A pure, auspicious foundation for health and growth.',
      icon: <Sparkles className="w-5 h-5 text-gold-dark" />
    },
    {
      age: '18 years',
      sanskrit: 'तारुण्य',
      title: 'Young Adults',
      desc: 'A meaningful pause in an otherwise ordinary birthday. Grounding as they enter college or adulthood.',
      icon: <Users className="w-5 h-5 text-gold-dark" />
    },
    {
      age: '40 years',
      sanskrit: 'गृहस्थाश्रम',
      title: 'Parents',
      desc: 'Celebrate the people who gave you yours. A thoughtful way for children to honor parents.',
      icon: <Heart className="w-5 h-5 text-gold-dark" />
    },
    {
      age: '75 years',
      sanskrit: 'वानप्रस्थ',
      title: 'Elders',
      desc: 'Honour another year of life, wisdom, and family. Landmark milestones (Shashti Poorti, Amrutha Mahotsava).',
      icon: <Shield className="w-5 h-5 text-gold-dark" />
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-ivory relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark">
            For Every Chapter of Life
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal">
            Who can celebrate?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-serif text-2xl sm:text-4xl text-gold-dark font-bold pt-2">
            <span>1 year.</span>
            <span className="text-charcoal/20">·</span>
            <span>18 years.</span>
            <span className="text-charcoal/20">·</span>
            <span>40 years.</span>
            <span className="text-charcoal/20">·</span>
            <span>75 years.</span>
          </div>
          <p className="text-base text-charcoal/75 max-w-xl mx-auto">
            Every single year of life is worth receiving blessings for. Not just milestone birthdays.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c, i) => (
            <div 
              key={i}
              className="bg-cream/20 p-6 rounded-2xl border border-gold/25 shadow-sm hover:border-gold/50 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-cream border border-gold/30 flex items-center justify-center">
                  {c.icon}
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl font-bold text-charcoal">
                    {c.title}
                  </h3>
                  <span className="text-xs font-sanskrit text-gold-dark">
                    {c.sanskrit}
                  </span>
                </div>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-gold/15">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">
                  {c.age} & beyond
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Vivaha Vardhantotsava */}
        <div className="mt-12 bg-cream/40 p-6 rounded-2xl border border-gold/25 max-w-2xl mx-auto text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold">
            Expanding Beyond Birthdays
          </span>
          <h4 className="font-serif text-xl font-semibold text-charcoal">
            Vivaha Vardhantotsava (Anniversary Sankalpa)
          </h4>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Couples can also perform a joint Sankalpa on their wedding anniversary, renewing marriage vows 
            and receiving Vedic blessings for harmony, health, and family longevity.
          </p>
        </div>

      </div>
    </section>
  );
};
