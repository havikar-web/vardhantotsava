import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Flame, BookOpen } from 'lucide-react';

interface RitualJourneyProps {
  navigate: (path: string) => void;
}

export const RitualJourney: React.FC<RitualJourneyProps> = ({ navigate }) => {
  const folios = [
    {
      num: '1',
      sanskritTitle: 'आचार्य आगमन',
      title: 'Acharya Agamana',
      subtitle: 'The Acharya arrives at your home',
      shloka: 'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः',
      shlokaMeaning: 'May we hear what is auspicious; may we behold what is noble and pure.',
      description: 'An initiated Vedic Acharya arrives at your doorstep in Bengaluru carrying consecrated brass patras, sacred dravyas, sacred samidha wood, and unbroken akshata.',
      experience: 'The fragrance of pure sandalwood, camphor, and fresh tulsi fills your home.',
      image: '/assets/pandit-arrival.jpg',
      imagePosition: 'center 20%',
    },
    {
      num: '2',
      sanskritTitle: 'दीप प्रज्वलन',
      title: 'Deepa Prajwalana',
      subtitle: 'Lighting the sacred lamp',
      shloka: 'दीपं ज्योतिः परं ब्रह्म दीपं ज्योतिर्जनार्दनः दीपः हरतु मे पापं',
      shlokaMeaning: 'The flame embodies Supreme Consciousness, dispelling all darkness from life.',
      description: 'The Akhanda Deepa is lit in your home. This consecrated flame remains active throughout the ceremony as the witness of the celebrant solar renewal.',
      experience: 'The entire family sits together in the warm morning light, centered in prayer.',
      image: '/assets/deepa.webp',
      imagePosition: '82% 48%',
    },
    {
      num: '3',
      sanskritTitle: 'पुण्याहवाचन',
      title: 'Punyavachana',
      subtitle: 'Purification and sanctification',
      shloka: 'पुण्याहं भवन्तो ब्रुवन्तु । ॐ पुण्याहं भवतु ॥',
      shlokaMeaning: 'May this day be proclaimed pure, sacred, and filled with auspicious blessings.',
      description: 'Sacred water in kalashas is purified through Vedic hymns and sprinkled to sanctify the home, family members, and the entire ritual space.',
      experience: 'A refreshing sense of purity and calm settles across every room of the home.',
      image: '/assets/ritual.png',
      imagePosition: 'center center',
    },
    {
      num: '4',
      sanskritTitle: 'महा सङ्कल्प',
      title: 'Maha Sankalpa',
      subtitle: 'The solemn ancestral intention',
      shloka: 'मम आत्मनः श्रुतिस्मृतिपुराणोक्त फलप्राप्त्यर्थम् आयुष्यवृद्ध्यर्थम्',
      shlokaMeaning: 'Reciting the sacred intention for longevity, spiritual merit, and enduring lineage grace.',
      description: 'Your ancestral Gotra, Pravara, and the celebrant Janma Nakshatra are solemnly declared in Sanskrit. Water, unbroken rice, and betel leaves are placed in the celebrant palms.',
      experience: 'A deeply emotional moment connecting the celebrant directly to centuries of lineage.',
      image: '/assets/sankalpa.jpg',
      imagePosition: 'center center',
    },
    {
      num: '5',
      sanskritTitle: 'महा आशीर्वाद',
      title: 'Maha Ashirvada',
      subtitle: 'Mantrakshata shower and blessings',
      shloka: 'शतमानं भवति शतायुः पुरुषः शतेन्द्रियः आयुष्येवेन्द्रिये प्रतितिष्ठति',
      shlokaMeaning: 'May you live a radiant hundred years with all senses vital, fulfilled and blessed.',
      description: 'Elders take consecrated unbroken Mantrakshata in both hands and shower blessings onto the celebrant head, followed by temple prasada distribution.',
      experience: 'Joy, elder touches, and gratitude as the celebrant receives lifetime blessings.',
      image: '/assets/reference-blessing.png',
      imagePosition: '78% 30%',
    },
  ];

  const [activeFolioIdx, setActiveFolioIdx] = useState(0);
  const activeFolio = folios[activeFolioIdx];

  const nextFolio = () => {
    setActiveFolioIdx((activeFolioIdx + 1) % folios.length);
  };

  const prevFolio = () => {
    setActiveFolioIdx((activeFolioIdx - 1 + folios.length) % folios.length);
  };

  return (
    <section 
      id="journey" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF6EE] via-[#F4ECE0] to-[#FAF6EE] overflow-hidden select-none text-[#1F1914]"
    >
      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <BookOpen className="w-3 h-3 text-[#B37418]" />
          <span>FIVE SACRED RITUALS</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          The Fivefold Vedic Ritual Journey
        </h2>

        {/* 5 Chapter Pills Selector */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 overflow-x-auto pb-1 max-w-full">
          {folios.map((folio, idx) => {
            const isActive = activeFolioIdx === idx;
            return (
              <button
                key={folio.num}
                onClick={() => setActiveFolioIdx(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#B37418] text-white shadow-sacred scale-105'
                    : 'bg-white/70 border border-[#D5C2A4] text-[#6E5D4E] hover:bg-white hover:text-[#B37418]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{folio.num}.</span>
                <span className="text-[11.5px]">{folio.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Folio Stage */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto relative z-10">
        
        {/* Left Column: Narrative */}
        <div className="lg:col-span-7 space-y-3 text-left">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFolio.num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#B37418]/40 text-[#8C5D0D]">
                  RITUAL {activeFolio.num} OF 5
                </span>
                <span className="font-sanskrit text-lg sm:text-xl font-bold text-[#8C5D0D] tracking-wide">
                  {activeFolio.sanskritTitle}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F1914] leading-tight">
                  {activeFolio.title}
                </h3>
                <p className="font-serif italic text-xs text-[#8C5D0D] mt-0.5">
                  {activeFolio.subtitle}
                </p>
              </div>

              {/* Shloka Box */}
              <div className="p-3 rounded-xl bg-white/90 border border-[#D5C2A4] shadow-2xs relative">
                <p className="font-sanskrit text-xs sm:text-sm font-medium text-[#2A1E14] leading-relaxed">
                  {activeFolio.shloka}
                </p>
                <p className="text-[11px] text-[#6E5D4E] mt-1 italic font-sans">
                  {activeFolio.shlokaMeaning}
                </p>
              </div>

              {/* Description */}
              <p className="text-[12.5px] sm:text-[13px] text-[#5C5147] leading-relaxed">
                {activeFolio.description}
              </p>

              {/* Sensory Highlight */}
              <div className="p-2 rounded-lg bg-[#FAF5ED] border border-[#E5D7C3] text-[11px] text-[#8C5D0D] font-medium">
                {activeFolio.experience}
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Action & Nav Controls */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => navigate('/book')}
              className="px-5 py-2 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase tracking-wider font-semibold rounded-full shadow-sacred transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Include this ritual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={prevFolio}
                className="w-7 h-7 rounded-full border border-[#D5C2A4] bg-white hover:bg-[#FAF5ED] text-[#8C5D0D] flex items-center justify-center transition-all cursor-pointer"
                aria-label="Previous ritual"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextFolio}
                className="w-7 h-7 rounded-full border border-[#D5C2A4] bg-white hover:bg-[#FAF5ED] text-[#8C5D0D] flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next ritual"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Visual Arch Frame */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="w-full max-w-[320px] sm:max-w-[350px] h-[260px] sm:h-[300px] lg:h-[340px] rounded-t-[160px] rounded-b-2xl overflow-hidden border-2 border-[#B37418] shadow-[0_20px_50px_-10px_rgba(40,28,15,0.2)] relative group bg-[#2A1D13]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeFolio.image}
                src={activeFolio.image}
                alt={activeFolio.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="gsap-parallax-img w-full h-full object-cover transition-all duration-300"
                style={{ objectPosition: (activeFolio as any).imagePosition || 'center' }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-[#1F140B] via-transparent to-transparent opacity-70" />

            <div className="absolute bottom-2.5 inset-x-2.5 p-2.5 text-left bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-white">
              <span className="text-[8.5px] uppercase tracking-widest text-[#F5D061] font-bold block">
                RITUAL {activeFolio.num} OF 5
              </span>
              <p className="font-serif text-xs font-semibold truncate text-[#FAF5ED]">
                {activeFolio.title}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Status */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>Tap tabs above to view each ritual step</span>
        <span className="font-mono font-bold text-[#8C5D0D]">
          Step {activeFolioIdx + 1} of 5
        </span>
      </div>

    </section>
  );
};
