import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { FAQS } from '../lib/content';

interface FaqProps {
  limit?: number;
  navigate?: (path: string) => void;
}

export const FaqAccordion: React.FC<FaqProps> = ({ limit = 4, navigate }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const items = FAQS.slice(0, limit);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section 
      id="faqs" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF5ED] via-[#F4ECE0] to-[#FAF5ED] text-[#1F1914] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <HelpCircle className="w-3 h-3 text-[#B37418]" />
          <span>FREQUENT QUESTIONS</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          Ritual and Booking Clarifications
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-xl mx-auto mt-0.5 font-sans">
          Details on rituals, samagri arrangements, and home preparations.
        </p>
      </div>

      {/* 2-Column Split */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center my-auto relative z-10">
        
        {/* Left Column: Home Preparation Details */}
        <div className="lg:col-span-5 space-y-3 text-left">
          <div className="p-4 rounded-2xl bg-white/90 border border-[#D5C2A4] shadow-sacred space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5ED] border border-[#B37418] flex items-center justify-center text-[#B37418]">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#1F1914]">
                Everything arranged for your home.
              </h3>
              <p className="text-[11.5px] text-[#5C5147] mt-1 leading-relaxed">
                The Acharya arrives with all essential consecrated samagri, including brass vessels, samidha firewood, unbroken akshata, kumkuma, and arishina.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E5D7C3] space-y-2">
              <div className="text-[11px] text-[#7A6E62]">
                Serving all neighborhoods across Bengaluru: South (Jayanagar, JP Nagar, Banashankari), East (Indiranagar, Whitefield), North (Malleshwaram, Hebbal), and Central.
              </div>

              {navigate && (
                <button
                  onClick={() => navigate('/faqs')}
                  className="w-full py-1.5 text-center text-xs font-semibold text-[#8C5D0D] hover:text-[#B37418] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View all questions and answers</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Accordions */}
        <div className="lg:col-span-7 space-y-2 text-left">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#B37418] shadow-sm'
                    : 'bg-white/80 border-[#E3D6C3] hover:border-[#D5C2A4]'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-xs sm:text-sm font-semibold text-[#1F1914]">
                    {item.q}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#B37418] text-white rotate-180'
                        : 'bg-[#FAF5ED] text-[#8C5D0D]'
                    }`}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3 pt-0.5 text-[11.5px] text-[#5C5147] leading-relaxed border-t border-[#FAF5ED]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>Transparent fixed pricing</span>
        <span className="text-[#8C5D0D]">Dedicated ceremony coordinator assistance</span>
      </div>

    </section>
  );
};
