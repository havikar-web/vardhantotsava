import React from 'react';
import { Sun, Home, Flame, Gift, Moon, Clock } from 'lucide-react';
import { VedicFloatingAtmosphere } from './VedicFloatingAtmosphere';

export const SunriseTimeline: React.FC = () => {
  const diurnalArc = [
    {
      time: '06:30 AM',
      phase: 'Brahma Muhurta',
      title: 'Dawn Preparation',
      desc: 'Celebrant takes snana and dresses in traditional vastra.',
      icon: Sun,
    },
    {
      time: '08:00 AM',
      phase: 'Acharya Agamana',
      title: 'Arrival and Sankalpa',
      desc: 'Acharya arrives, sacred deepa is lit, and Punyavachana begins.',
      icon: Home,
    },
    {
      time: '08:45 AM',
      phase: 'Ayushya Homa',
      title: 'Fire and Broadcast',
      desc: 'Medicinal herbs offered into the fire; family joins live broadcast.',
      icon: Flame,
    },
    {
      time: '09:30 AM',
      phase: 'Maha Ashirvada',
      title: 'Blessings and Prasada',
      desc: 'Mantrakshata shower by elders, touching feet, and prasada.',
      icon: Gift,
    },
    {
      time: '11:00 AM+',
      phase: 'Purna Dinam',
      title: 'Celebrate Your Way',
      desc: 'The rest of your day is entirely yours for cake, dinner, and parties.',
      icon: Moon,
    },
  ];

  return (
    <section 
      id="timeline" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#F6ECE0] via-[#FAF5ED] to-[#F6ECE0] text-[#1F1914] overflow-hidden select-none"
    >
      <VedicFloatingAtmosphere />

      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#FAF5ED] text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <Clock className="w-3 h-3 text-[#B37418]" />
          <span>MORNING CEREMONY TIMELINE</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          A Sacred Morning. Celebrate Freely All Evening.
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-2xl mx-auto mt-0.5 font-sans">
          Vardhantotsava sanctifies your morning hours with ancestral purpose, leaving the afternoon and evening open for modern festivities.
        </p>
      </div>

      {/* 5-Card Horizon */}
      <div className="max-w-[1280px] w-full mx-auto my-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
          {diurnalArc.map((node, i) => {
            const IconComp = node.icon;
            const isHighlight = i === 2 || i === 4;

            return (
              <div
                key={i}
                className={`p-3.5 sm:p-4 rounded-xl flex flex-col justify-between text-left transition-all duration-200 relative ${
                  isHighlight
                    ? 'bg-white border-2 border-[#B37418] shadow-sm'
                    : 'bg-white/80 border border-[#E3D6C3] shadow-xs hover:border-[#D5C2A4]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-mono font-bold tracking-wider text-[#8C5D0D] bg-[#FAF5ED] px-1.5 py-0.5 rounded border border-[#E3D6C3]">
                      {node.time}
                    </span>
                    <div 
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isHighlight
                          ? 'bg-[#B37418] text-white border-[#B37418]'
                          : 'bg-[#FAF5ED] border-[#D5C2A4] text-[#B37418]'
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8C7A6E] block">
                      {node.phase}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#1F1914] mt-0.5 leading-snug">
                      {node.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#5C5147] leading-relaxed line-clamp-3">
                    {node.desc}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E5D7C3]/60 flex items-center justify-between text-[10px] text-[#8C5D0D] font-medium">
                  <span>Phase {i + 1} of 5</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>Total morning ceremony duration: ~2.5 hours</span>
        <span className="text-[#8C5D0D]">Consecrated dravyas and herbal samidha supplied</span>
      </div>

    </section>
  );
};
