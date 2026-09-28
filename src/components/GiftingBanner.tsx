import React from 'react';
import { ArrowRight, Gift, Flame, Scroll, Box } from 'lucide-react';

interface GiftingBannerProps {
  navigate: (path: string) => void;
}

export const GiftingBanner: React.FC<GiftingBannerProps> = ({ navigate }) => {
  return (
    <section 
      id="gifting" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF5ED] via-[#F3E8D7] to-[#FAF5ED] text-[#1F1914] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#FAF5ED] text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <Gift className="w-3 h-3 text-[#B37418]" />
          <span>HAVIKAR GIFTS AND KEEPSAKES</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          Gifts with Enduring Meaning
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-xl mx-auto mt-0.5 font-sans">
          Curated gift boxes with Sandalwood bracelets, Japa malas, rose kumkuma, and pure arishina included in Parampara or as add-ons.
        </p>
      </div>

      {/* Split Showcase */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center my-auto relative z-10">
        
        {/* Left Column: Keepsake Box Image Frame */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="w-full max-w-[420px] h-[240px] sm:h-[280px] rounded-2xl overflow-hidden border-2 border-[#D5C2A4] bg-[#2A1D13] shadow-sacred relative group">
            <img 
              src="/assets/ivory-gift-box.png" 
              alt="Parampara Keepsake Gift Box" 
              className="gsap-parallax-img w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F140B] via-transparent to-transparent opacity-75" />
            <div className="absolute bottom-2.5 inset-x-2.5 p-2.5 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-white text-left">
              <span className="text-[8.5px] uppercase tracking-widest text-[#F5D061] font-bold block">
                HAVIKAR KEEPSAKE BOX
              </span>
              <p className="font-serif text-xs font-semibold truncate text-[#FAF5ED]">
                Sandalwood Bracelet, Japa Mala, Rose Kumkum and Arishina
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Gift Narrative & Action */}
        <div className="lg:col-span-6 space-y-3 text-left">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F1914] leading-tight">
              A lasting tradition for parents, children, or family.
            </h3>
            <p className="text-[12.5px] text-[#5C5147] mt-1 leading-relaxed font-sans">
              Included in the Parampara package or available as an add-on. You can build your own gift box with authentic Havikar farm and spiritual products.
            </p>
          </div>

          {/* 3 Gift Inclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white/80 border border-[#E3D6C3] space-y-1">
              <Flame className="w-3.5 h-3.5 text-[#B37418]" />
              <strong className="text-xs font-semibold text-[#1F1914] block">Sandalwood Bracelet</strong>
              <p className="text-[10px] text-[#7A6E62]">Fragrant Chandana bandha consecrated with Vedic mantras.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-[#E3D6C3] space-y-1">
              <Scroll className="w-3.5 h-3.5 text-[#B37418]" />
              <strong className="text-xs font-semibold text-[#1F1914] block">Japa Mala (108)</strong>
              <p className="text-[10px] text-[#7A6E62]">Traditional meditation mala of pure Tulasi and Sandalwood.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-[#E3D6C3] space-y-1">
              <Box className="w-3.5 h-3.5 text-[#B37418]" />
              <strong className="text-xs font-semibold text-[#1F1914] block">Rose Kumkum & Arishina</strong>
              <p className="text-[10px] text-[#7A6E62]">Temple-grade rose kumkuma and pure Western Ghats turmeric.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => navigate('/gift')}
              className="px-6 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-sacred transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Build or Gift Box</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>Handcrafted in Malnad, Karnataka</span>
        <span className="text-[#8C5D0D]">Doorstep delivery across Bengaluru and India</span>
      </div>

    </section>
  );
};
