import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Flame, Sun, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  { 
    id: 'child', 
    title: 'For your child', 
    detail: 'A blessed beginning', 
    icon: Sun, 
    text: 'Celebrate growing years with Vedic blessings for education, health, and auspicious beginnings.' 
  },
  { 
    id: 'adult', 
    title: 'For yourself', 
    detail: 'A meaningful new year', 
    icon: Flame, 
    text: 'Begin your next solar year with a personal Sankalpa for health, clarity, and life purpose.' 
  },
  { 
    id: 'elder', 
    title: 'For your parents', 
    detail: 'Honoring a lifetime', 
    icon: Shield, 
    text: 'Gather family together to honor your parents with Deepa Prajwalana, Vedic chants, and Mantrakshata.' 
  },
  { 
    id: 'family', 
    title: 'For your family', 
    detail: 'Together in prayer', 
    icon: Heart, 
    text: 'Bring your entire household together for an auspicious family celebration, with distant relatives joining live.' 
  },
];

export const HeroSection: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [selected, setSelected] = useState(0);
  const stage = stages[selected];

  const scrollToJourney = () => {
    const el = document.getElementById('journey');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[calc(100vh-74px)] flex flex-col justify-between pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF5ED] via-[#F6ECE0] to-[#FAF5ED] overflow-hidden select-none"
      aria-labelledby="hero-title"
    >
      {/* Background Parallax Mandala */}
      <div 
        className="gsap-parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.035] pointer-events-none select-none text-[#B37418]"
        data-speed="0.15"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-current animate-spin-slow" strokeWidth="0.8">
          <circle cx="100" cy="100" r="96" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="82" />
          <polygon points="100,10 180,150 20,150" />
          <polygon points="100,190 180,50 20,50" />
          <polygon points="100,25 170,145 30,145" />
          <polygon points="100,175 170,55 30,55" />
          <circle cx="100" cy="100" r="50" />
          <circle cx="100" cy="100" r="30" />
          <circle cx="100" cy="100" r="10" />
        </svg>
      </div>

      {/* Main Hero Showcase */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto relative z-10">
        
        {/* Left Copy Column */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 backdrop-blur-md shadow-2xs">
            <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D]">
              VEDIC BIRTHDAY CELEBRATION
            </span>
          </div>

          {/* Headline */}
          <h1 
            id="hero-title"
            className="font-serif text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] font-normal text-[#201B18] leading-[1.25] sm:leading-[1.22] lg:leading-[1.2] tracking-normal"
          >
            Another year. <br />
            Celebrated the authentic <br />
            <span className="text-[#9E6B2D] font-cormorant italic font-normal tracking-normal inline-block pt-1">
              Vedic way.
            </span>
          </h1>

          {/* Description */}
          <p className="text-[14px] sm:text-[15px] text-[#5C5147] leading-relaxed max-w-xl font-normal font-sans">
            Make your birthday a Vardhantotsava. Sacred rituals, Deepa Prajwalana, Punyavachana, and Mantrakshata blessings conducted at your home by initiated Acharyas.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button 
              onClick={() => navigate('/book')}
              className="px-6 py-3.5 bg-[#2F392E] hover:bg-[#1E251E] text-[#FFF9EE] rounded-full text-xs uppercase tracking-wider font-semibold shadow-sacred hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer border border-[#8C5D0D]/30"
            >
              <span>Plan your celebration</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>

            <button 
              onClick={scrollToJourney}
              className="px-5 py-3.5 rounded-full border border-[#D5C2A4] bg-white/80 hover:bg-[#F4EADA] text-[#8C5D0D] text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View rituals</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#B37418]" />
            </button>
          </div>

          {/* Assurances Banner */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-[11.5px] font-medium text-[#736353]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B37418]" />
              <span>Bengaluru home visits</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B37418]" />
              <span>Initiated Vedic Acharyas</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B37418]" />
              <span>Consecrated dravyas and Havikar samagri</span>
            </span>
          </div>

        </div>

        {/* Right Art Column */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          
          <div className="w-full max-w-[340px] lg:max-w-[370px] h-[290px] sm:h-[340px] lg:h-[380px] rounded-t-[180px] rounded-b-2xl overflow-hidden border-2 border-[#B37418]/60 shadow-[0_20px_50px_-15px_rgba(40,28,15,0.22)] relative group bg-[#2A1D13]">
            <img 
              src="/assets/reference-hero.png" 
              alt="Family gathered for a Vedic birthday ceremony" 
              className="gsap-parallax-img w-full h-full object-cover object-center"
              fetchPriority="high"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1F140B] via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-0 inset-x-0 p-4 text-left text-white">
              <span className="text-[8.5px] uppercase tracking-[0.2em] text-[#F5D061] font-bold block mb-0.5">
                VARDHANTOTSAVA TRADITION
              </span>
              <p className="font-serif text-base text-[#FFF6E5] leading-snug">
                Sacred blessings for the journey ahead.
              </p>
            </div>
          </div>

          {/* Floating Rotating Seal */}
          <div className="gsap-rotate-seal absolute -top-2 -right-2 sm:-right-3 w-20 h-20 rounded-full bg-[#2F392E] border border-[#D4AF37] text-[#FAF5ED] flex flex-col items-center justify-center shadow-lg select-none z-20">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[7px] uppercase tracking-widest text-[#E5D7C3] font-bold text-center leading-tight mt-0.5">
              HAVIKAR<br />TRADITION
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Interactive Celebration Selector */}
      <div className="max-w-[1280px] w-full mx-auto mt-8 lg:mt-12 pt-4 sm:pt-5 border-t border-[#D5C2A4]/60 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <span className="text-[9.5px] uppercase tracking-[0.22em] font-bold text-[#8C5D0D]">
            WHO IS YOUR BLESSING FOR?
          </span>
          <span className="text-[10.5px] text-[#7A6E62]">
            Select an intention below to personalize
          </span>
        </div>

        {/* 4 Compact Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {stages.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selected === index;
            return (
              <button
                key={item.id}
                onClick={() => setSelected(index)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#B37418] shadow-sacred ring-1 ring-[#B37418]'
                    : 'bg-white/60 border-[#E5D7C3] hover:bg-white hover:border-[#D5C2A4]'
                }`}
              >
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected ? 'bg-[#FAF5ED] text-[#B37418]' : 'bg-[#F6ECE0] text-[#736353]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-[11.5px] font-bold text-[#201B18] truncate leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[9.5px] text-[#7A6E62] truncate">
                    {item.detail}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Active Description */}
        <div className="mt-2 flex items-center justify-between gap-3 bg-white/70 px-3.5 py-1.5 rounded-lg border border-[#E5D7C3]/60 text-left">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[11px] text-[#4A3E33] leading-snug line-clamp-1 flex-1 font-medium"
            >
              {stage.text}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={() => navigate(`/book?stage=${stage.id}`)}
            className="flex-shrink-0 text-[10.5px] font-semibold text-[#8C5D0D] hover:text-[#B37418] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Personalize</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </section>
  );
};
