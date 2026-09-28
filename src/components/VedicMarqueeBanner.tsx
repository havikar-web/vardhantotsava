import React from 'react';

interface VedicMarqueeBannerProps {
  variant?: 'shloka' | 'assurance';
}

export const VedicMarqueeBanner: React.FC<VedicMarqueeBannerProps> = ({ variant = 'shloka' }) => {
  if (variant === 'shloka') {
    const shlokas = [
      { sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्', meaning: 'May vitality and health flourish' },
      { sanskrit: 'आयुष्यं वर्चस्तेजो बलं च वर्धते सदा', meaning: 'May longevity, radiance, and strength grow' },
      { sanskrit: 'शतमानं भवति शतायुः पुरुषः शतेन्द्रियः', meaning: 'May you live a blessed century of vitality' },
      { sanskrit: 'दीपं ज्योतिः परं ब्रह्म दीपं ज्योतिर्जनार्दनः', meaning: 'The sacred flame dispelling darkness' },
      { sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः', meaning: 'May all beings experience peace and health' },
    ];

    return (
      <div className="ritual-ribbon relative py-3 bg-[#1C140D] text-[#F3E7D3] border-y border-[#B37418]/30 overflow-hidden select-none">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#1C140D] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#1C140D] to-transparent z-10 pointer-events-none" />

        <div className="ribbon-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="ribbon-copy" aria-hidden={copy === 1}>
              {shlokas.map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-4">
                  <span className="font-sanskrit text-sm font-medium tracking-wide text-amber-100">
                    {item.sanskrit}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-sans font-medium">
                    {item.meaning}
                  </span>
                  <span className="text-[#B37418]/60 text-xs">/</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Assurance Ribbon variant
  const assurances = [
    { text: 'Janma Nakshatra Calculation' },
    { text: 'Authentic Acharya Home Visit' },
    { text: 'Deepa Prajwalana and Punyavachana' },
    { text: 'Maha Sankalpa with Ancestral Gotra' },
    { text: 'Maha Ashirvada with Mantrakshata' },
    { text: 'Consecrated Dravyas and Havikar Samagri' },
  ];

  return (
    <div className="ritual-ribbon relative py-2.5 bg-[#F6ECE0] border-y border-[#D5C2A4]/60 overflow-hidden select-none">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F6ECE0] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F6ECE0] to-transparent z-10 pointer-events-none" />

      <div className="ribbon-track ribbon-reverse">
        {[0, 1].map((copy) => (
          <div key={copy} className="ribbon-copy" aria-hidden={copy === 1}>
            {assurances.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3E3027]">
                  {item.text}
                </span>
                <span className="text-[#B37418] text-xs">/</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
