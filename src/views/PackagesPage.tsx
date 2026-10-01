import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PACKAGES } from '../lib/content';

interface PackagesProps {
  navigate: (path: string) => void;
}

export const PackagesPage: React.FC<PackagesProps> = ({ navigate }) => {
  const comparisonRows = [
    { feature: 'Acharya Home Visit (Bengaluru)', aarambha: true, sampoorna: true, parampara: true },
    { feature: 'Deepa Prajwalana (Sacred Lamp Lighting)', aarambha: true, sampoorna: true, parampara: true },
    { feature: 'Punyavachana (Purification of Home)', aarambha: true, sampoorna: true, parampara: true },
    { feature: 'Maha Sankalpa in Gotra and Nakshatra', aarambha: true, sampoorna: true, parampara: true },
    { feature: 'Maha Ashirvada with Mantrakshata', aarambha: true, sampoorna: true, parampara: true },
    { feature: 'Virtual Ayushya Homa (Live Broadcast)', aarambha: false, sampoorna: true, parampara: false },
    { feature: 'Ayushya Homa conducted AT HOME', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Option to Upgrade to At-Home Homa (+₹4,999)', aarambha: false, sampoorna: true, parampara: false },
    { feature: '4K Private Family Broadcast Link', aarambha: false, sampoorna: true, parampara: true },
    { feature: 'Fresh Consecrated Prasada Delivery', aarambha: false, sampoorna: true, parampara: true },
    { feature: '2 Initiated Vedic Acharyas', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Curated Havikar Gift Box Included', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Sandalwood Bracelet (Chandana Bandha)', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Japa Mala (108 Sacred Beads)', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Traditional Rose Kumkuma and Arishina', aarambha: false, sampoorna: false, parampara: true },
    { feature: 'Build Your Own Havikar Gift Box Option', aarambha: false, sampoorna: false, parampara: true },
  ];

  return (
    <div className="py-12 bg-[#FAF6EE] min-h-screen text-[#1F1914] select-none">
      
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 pb-12">
        <span className="text-xs uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] block">
          THREE SACRED PACKAGES
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1F1914] leading-tight">
          Packages and Detailed Inclusions
        </h1>
        <p className="text-sm sm:text-base text-[#5C5147] max-w-xl mx-auto font-sans">
          All essential Havikar samagri and consecrated dravyas included.
        </p>
      </section>

      {/* Package Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PACKAGES.map((pkg) => {
            const isFeatured = pkg.id === 'sampoorna';
            const isPremium = pkg.id === 'parampara';

            return (
              <div 
                key={pkg.id}
                className={`rounded-2xl p-5 sm:p-7 flex flex-col justify-between border transition-all text-left ${
                  isFeatured 
                    ? 'border-2 border-[#B37418] shadow-sacred bg-white ring-1 ring-[#B37418]' 
                    : isPremium
                      ? 'border-2 border-[#8C5D0D] bg-gradient-to-b from-white to-[#FAF6EE] shadow-sacred'
                      : 'border-[#D5C2A4] bg-white/85 shadow-sm'
                }`}
              >
                <div className="space-y-3.5">
                  {pkg.tag && (
                    <span className="bg-[#B37418] text-white text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                      {pkg.tag}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl font-bold text-[#1F1914]">{pkg.name}</h3>
                  <p className="text-xs text-[#5C5147]">{pkg.tagline}</p>
                  
                  <div className="py-2 border-y border-[#E5D7C3]">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1914]">{pkg.priceFormatted}</span>
                    <span className="text-xs text-[#7A6E62] ml-2">all inclusive</span>
                  </div>

                  <p className="text-xs text-[#4A3E33] leading-relaxed">{pkg.description}</p>

                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[#8C5D0D] block">Key Inclusions</span>
                    <ul className="space-y-1.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#4A3E33]">
                          <span className="text-[#B37418] font-bold text-xs select-none">·</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => navigate(`/book?package=${pkg.id}`)}
                    className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isFeatured
                        ? 'bg-[#B37418] hover:bg-[#8C5D0D] text-white shadow-sacred'
                        : isPremium
                          ? 'bg-[#2F392E] hover:bg-[#1E251E] text-white shadow-sacred'
                          : 'bg-[#FAF5ED] hover:bg-[#B37418] hover:text-white text-[#8C5D0D] border border-[#D5C2A4]'
                    }`}
                  >
                    <span>Choose {pkg.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-left">
        <div className="text-center mb-8 space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C5D0D]">Side-by-Side</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F1914]">Detailed Feature Matrix</h2>
        </div>

        <div className="bg-[#FDFBF7] rounded-md border border-[#D5C2A4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5ED] border-b border-[#D5C2A4] text-xs uppercase tracking-wider text-[#1F1914]">
                  <th className="p-3.5 sm:p-4 font-semibold">Included Service</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-center">Aarambha (₹4,999)</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-center text-[#8C5D0D] font-bold bg-[#FAF5ED]">Sampoorna (₹9,999)</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-center">Parampara (₹18,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C3] text-xs">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5]">
                    <td className="p-3 sm:p-3.5 font-medium text-[#1F1914]">{row.feature}</td>
                    <td className="p-3 sm:p-3.5 text-center">
                      {row.aarambha ? <span className="font-semibold text-[#8C5D0D]">Included</span> : <span className="text-[#C2B5A3]">—</span>}
                    </td>
                    <td className="p-3 sm:p-3.5 text-center bg-[#FAF5ED]/50">
                      {row.sampoorna ? <span className="font-bold text-[#8C5D0D]">Included</span> : <span className="text-[#C2B5A3]">—</span>}
                    </td>
                    <td className="p-3 sm:p-3.5 text-center">
                      {row.parampara ? <span className="font-semibold text-[#8C5D0D]">Included</span> : <span className="text-[#C2B5A3]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
