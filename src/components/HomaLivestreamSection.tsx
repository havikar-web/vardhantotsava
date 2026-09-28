import React from 'react';
import { Flame, Video, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface HomaLivestreamSectionProps {
  navigate: (path: string) => void;
}

export const HomaLivestreamSection: React.FC<HomaLivestreamSectionProps> = ({ navigate }) => {
  return (
    <section 
      id="livestream" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-4 pb-5 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#18110B] via-[#22160E] to-[#18110B] text-[#FFF8E9] overflow-hidden select-none"
    >
      {/* Top Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D97706]/40 bg-[#351F10]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#F59E0B] shadow-2xs mb-1">
          <Flame className="w-3 h-3 text-[#F59E0B]" />
          <span>AYUSHYA HOMA OPTIONS</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#FFF8E9] leading-tight">
          Sacred Ayushya Fire Ritual
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#CBBBA6] max-w-xl mx-auto mt-1 font-sans">
          Virtual Ayushya Homa with private family broadcast in Sampoorna, or complete Ayushya Homa at your home in Parampara.
        </p>
      </div>

      {/* Center Showcase */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto relative z-10">
        
        {/* Left Column: Broadcast Visual */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="w-full max-w-[460px] rounded-2xl overflow-hidden border border-[#D97706]/40 bg-[#120B06] shadow-[0_20px_50px_-10px_rgba(217,119,6,0.25)] relative group">
            
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-700/90 text-white font-mono font-bold text-[9.5px] tracking-wider uppercase">
                <span>Live Broadcast</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-white text-[10px] flex items-center gap-1.5">
                <Users className="w-3 h-3 text-[#F59E0B]" />
                <span>Family Worldwide</span>
              </span>
            </div>

            <div className="h-[220px] sm:h-[250px] relative overflow-hidden">
              <img 
                src="/assets/reference-homa.png" 
                alt="Sacred Ayushya Fire Ritual" 
                className="gsap-parallax-img w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120B06] via-transparent to-transparent opacity-80" />
            </div>

            <div className="p-3 bg-[#170E08] border-t border-[#D97706]/20 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-xs font-semibold text-[#FFF8E9] flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#F59E0B]" />
                  <span>Ayushya Homa for Longevity</span>
                </h4>
                <p className="text-[10.5px] text-[#A69785]">
                  Chanted with celebrant Gotra and Janma Nakshatra
                </p>
              </div>

              <span className="text-[10px] text-[#F59E0B] font-mono font-semibold">
                4K Stream
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-6 space-y-3 text-left">
          
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#FFF8E9] leading-tight">
              Virtual or at home, tailored to your family.
            </h3>
            <p className="text-[12.5px] text-[#CBBBA6] mt-1 leading-relaxed font-sans">
              Choose the format that fits your preference. Relatives across the world receive an encrypted link to participate in the Sankalpa and watch the offerings in real time.
            </p>
          </div>

          {/* 2 Options Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#26180E] border border-[#D97706]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <Video className="w-3.5 h-3.5" />
                <strong className="text-xs font-semibold text-[#FFF8E9]">Virtual Homa (Sampoorna)</strong>
              </div>
              <p className="text-[10.5px] text-[#A89885]">
                Conducted at Havikar Kshetra in your name and streamed live. Upgradeable to At-Home.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#26180E] border border-[#D97706]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <Flame className="w-3.5 h-3.5" />
                <strong className="text-xs font-semibold text-[#FFF8E9]">At-Home Homa (Parampara)</strong>
              </div>
              <p className="text-[10.5px] text-[#A89885]">
                2 Acharyas perform the homa directly at your residence with sacred samidha and gifts included.
              </p>
            </div>
          </div>

          {/* Smoke Safety */}
          <div className="p-2.5 rounded-xl bg-[#2A1B10]/80 border border-[#D97706]/20 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
            <p className="text-[11px] text-[#D8C7AD]">
              Dry herbal samidha wood used indoors to ensure apartment safety and minimal aromatic smoke.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => navigate('/book?package=parampara')}
              className="px-6 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-gold-glow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book At-Home Homa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/book?package=sampoorna')}
              className="px-5 py-2.5 border border-[#D97706]/50 hover:bg-[#351F10] text-[#F59E0B] rounded-full text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
            >
              <span>Select Virtual Homa</span>
            </button>
          </div>

        </div>

      </div>

      {/* Footnote */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px] text-[#9E8D7B]">
        <span>Virtual Homa included in Sampoorna | At-Home Homa in Parampara</span>
        <span className="text-[#F59E0B]">Bengaluru doorstep service</span>
      </div>

    </section>
  );
};
