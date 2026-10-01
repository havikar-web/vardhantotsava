import React, { useState } from 'react';
import { ArrowRight, Award, Box, Flame } from 'lucide-react';
import { PACKAGES, PackageDetail, HAVIKAR_PRODUCTS } from '../lib/content';

interface PackageCardsProps {
  navigate: (path: string) => void;
  onSelectPackage?: (pkg: PackageDetail) => void;
}

export const PackageCards: React.FC<PackageCardsProps> = ({ navigate, onSelectPackage }) => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'sandalwood-bracelet',
    'japa-mala',
    'rose-kumkuma',
    'pure-arishina',
    'mantrakshata'
  ]);

  const handleSelect = (pkg: PackageDetail) => {
    onSelectPackage?.(pkg);
    navigate('/book?package=' + pkg.id);
  };

  const toggleGiftItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <section 
      id="packages" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF5ED] via-[#F6ECE0] to-[#FAF5ED] text-[#1F1914] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <Award className="w-3 h-3 text-[#B37418]" />
          <span>CELEBRATION PACKAGES</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          Vedic Birthday Offerings
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-xl mx-auto mt-0.5 font-sans">
          Ceremonies conducted at your home in Bengaluru with initiated Acharyas and authentic Havikar samagri.
        </p>
      </div>

      {/* 3 Horizontal Cards Grid fitting in 100vh */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-5 items-stretch my-auto relative z-10">
        {PACKAGES.map((pkg, index) => {
          const isFeatured = index === 1; // Sampoorna
          const isPremium = index === 2; // Parampara

          return (
            <div
              key={pkg.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between text-left relative group ${
                isFeatured
                  ? 'bg-white border-2 border-[#B37418] shadow-[0_15px_40px_-10px_rgba(179,116,24,0.2)] ring-1 ring-[#B37418]'
                  : isPremium
                    ? 'bg-gradient-to-b from-white to-[#FAF6EE] border-2 border-[#8C5D0D] shadow-sacred'
                    : 'bg-white/85 border border-[#D5C2A4] shadow-xs hover:border-[#B37418]'
              }`}
            >
              {/* Badge Header */}
              <div 
                className={`text-[9.5px] uppercase tracking-widest font-bold text-center py-1 flex items-center justify-center gap-1.5 ${
                  isFeatured 
                    ? 'bg-[#B37418] text-white' 
                    : isPremium 
                      ? 'bg-[#2F392E] text-[#D4AF37]' 
                      : 'bg-[#F4EADA] text-[#8C5D0D]'
                }`}
              >
                <span>{pkg.tag}</span>
              </div>

              {/* Package Content */}
              <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1914]">
                      {pkg.name}
                    </h3>
                    <strong className="text-base sm:text-lg font-bold text-[#8C5D0D] font-sans">
                      {pkg.priceFormatted}
                    </strong>
                  </div>

                  <p className="text-[11px] text-[#7A6E62] mt-0.5 line-clamp-1">
                    {pkg.tagline}
                  </p>

                  {/* Highlights checklist */}
                  <ul className="mt-2.5 space-y-1.5 text-[11px] text-[#4A3E33]">
                    {pkg.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <span className="text-[#B37418] font-bold text-xs select-none mt-[-1px]">·</span>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Specific notes for package tiers */}
                  {pkg.id === 'aarambha' && (
                    <div className="mt-2 p-1.5 rounded-lg bg-[#FAF5ED] border border-[#E5D7C3] text-[10px] text-[#8C5D0D]">
                      Home rituals by Acharya. Ayushya Homa and Havikar gifts available as add-ons.
                    </div>
                  )}

                  {pkg.id === 'sampoorna' && (
                    <div className="mt-2 p-1.5 rounded-lg bg-[#FAF5ED] border border-[#B37418]/40 text-[10px] text-[#8C5D0D]">
                      Virtual Ayushya Homa included. Upgradeable to At-Home Ayushya Homa (+₹4,999).
                    </div>
                  )}

                  {pkg.id === 'parampara' && (
                    <div className="mt-2 p-1.5 rounded-lg bg-[#F4EADA] border border-[#8C5D0D]/40 text-[10px] text-[#6E4F18]">
                      Ayushya Homa at home by 2 Acharyas. Includes Havikar gift box with Sandalwood bracelet, Japa mala, and kumkum.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-1.5 pt-1">
                  {pkg.id === 'parampara' && (
                    <button
                      type="button"
                      onClick={() => setShowGiftModal(true)}
                      className="w-full py-1 text-[10.5px] text-[#8C5D0D] hover:underline font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Box className="w-3 h-3" />
                      <span>Build Your Own Gift Box</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSelect(pkg)}
                    className={`w-full py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isFeatured
                        ? 'bg-[#B37418] hover:bg-[#8C5D0D] text-white shadow-sacred'
                        : isPremium
                          ? 'bg-[#2F392E] hover:bg-[#1E251E] text-white shadow-sacred'
                          : 'bg-[#FAF5ED] hover:bg-[#B37418] hover:text-white text-[#8C5D0D] border border-[#D5C2A4]'
                    }`}
                  >
                    <span>Select {pkg.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>All packages include Acharya travel and consecrated sacred samagri in Bengaluru</span>
        <span className="text-[#8C5D0D]">Authentic Havikar Vedic lineage</span>
      </div>

      {/* Build Your Own Gift Box Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full border border-[#D5C2A4] shadow-2xl text-left space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5D7C3] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C5D0D] block">
                  HAVIKAR SAMAGRI & GIFTS
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1F1914]">
                  Customize Your Parampara Gift Box
                </h3>
              </div>
              <button 
                onClick={() => setShowGiftModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF5ED] text-[#7A6E62] hover:bg-[#E5D7C3] flex items-center justify-center text-xs font-bold"
              >
                X
              </button>
            </div>

            <p className="text-xs text-[#5C5147]">
              Included in the Parampara package. Select the authentic Havikar products to include in your handcrafted family keepsake box:
            </p>

            <div className="space-y-2">
              {HAVIKAR_PRODUCTS.map((prod) => {
                const isChecked = selectedItems.includes(prod.id);
                return (
                  <label
                    key={prod.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked ? 'bg-[#FAF5ED] border-[#B37418]' : 'bg-white border-[#E3D6C3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGiftItem(prod.id)}
                        className="accent-[#B37418] w-4 h-4"
                      />
                      <div>
                        <strong className="text-xs text-[#1F1914] block">{prod.name}</strong>
                        <span className="text-[10.5px] text-[#7A6E62]">{prod.description}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8C5D0D] ml-2">₹{prod.price}</span>
                  </label>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowGiftModal(false);
                handleSelect(PACKAGES[2]);
              }}
              className="w-full py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sacred transition-all cursor-pointer"
            >
              Confirm Gift Box Selection and Book Parampara
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
