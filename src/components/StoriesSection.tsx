import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { VedicFloatingAtmosphere } from './VedicFloatingAtmosphere';

export const StoriesSection: React.FC = () => {
  const chronicles = [
    {
      id: '1',
      celebrationType: 'Prathama Vardhanti (7th Birthday)',
      family: 'The Deshpande Family',
      location: 'Jayanagar, Bengaluru',
      quote: "We celebrated with his friends in the evening, but beginning the morning with the Acharya, Deepa Prajwalana, and his grandparents showering Mantrakshata gave his birthday an unforgettable soul. Seeing him touch his grandfather feet was priceless.",
      highlight: 'Vedic dawn blessings followed by evening festivities.',
      image: '/assets/story-boy.jpg',
    },
    {
      id: '2',
      celebrationType: 'Global Connection (30th Birthday)',
      family: 'Dr. Sharada and Sridhar K.',
      location: 'Malleshwaram (Daughter in London)',
      quote: "Our daughter was in London for her 30th birthday. The Acharya took her Gotra and Nakshatra into the Ayushya Homa live on video. She chanted along with us across 5,000 miles. Distance completely vanished during the Sankalpa.",
      highlight: 'Connecting parents in Bengaluru with daughter abroad.',
      image: '/assets/story-parent.jpg',
    },
    {
      id: '3',
      celebrationType: 'Sapthathi (70th Milestone)',
      family: 'The Hegde Family',
      location: 'Indiranagar, Bengaluru',
      quote: "For my father 70th, we wanted an authentic ritual. The Ayushya Homa at our family home was the most dignified, emotional tribute we could ever give him. The handcrafted brass deepa now burns in his prayer room every day.",
      highlight: 'Three generations honoring their patriarch with Vedic hymns.',
      image: '/assets/story-couple.jpg',
    },
  ];

  return (
    <section 
      id="stories" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF6EE] via-[#F4ECE0] to-[#FAF6EE] text-[#1F1914] overflow-hidden select-none"
    >
      <VedicFloatingAtmosphere />

      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <Heart className="w-3 h-3 text-[#B37418]" />
          <span>FAMILY EXPERIENCES</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          Living Havikar Traditions in Bengaluru
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-xl mx-auto mt-0.5 font-sans">
          How families across Bengaluru celebrate birthdays the authentic Vedic way.
        </p>
      </div>

      {/* 3 Editorial Chronicles Grid */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-5 items-stretch my-auto relative z-10">
        {chronicles.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-2xl border border-[#D5C2A4] p-4 flex flex-col justify-between text-left shadow-xs hover:border-[#B37418] transition-all duration-200 group cursor-default"
          >
            <div className="space-y-2.5">
              
              <div className="flex items-center gap-3 border-b border-[#E5D7C3] pb-2.5">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF5ED] flex-shrink-0 border border-[#D5C2A4]">
                  <img
                    src={story.image}
                    alt={story.family}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <span className="text-[9.5px] uppercase tracking-wider font-bold text-[#8C5D0D] block">
                    {story.celebrationType}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-[#1F1914] leading-tight mt-0.5">
                    {story.family}
                  </h4>
                  <span className="text-[10px] text-[#7A6E62] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#B37418]" />
                    <span>{story.location}</span>
                  </span>
                </div>
              </div>

              <p className="font-serif text-[12px] sm:text-[12.5px] text-[#2C231C] leading-relaxed italic font-normal line-clamp-5">
                "{story.quote}"
              </p>

            </div>

            <div className="pt-2 mt-2 border-t border-[#E5D7C3] flex items-center gap-1.5 text-[10.5px] text-[#8C5D0D] font-medium">
              <span className="truncate">{story.highlight}</span>
            </div>

          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span className="text-[#8C5D0D] font-semibold">Over 1,000 celebrations conducted in Bengaluru</span>
        <span>Verified family reviews</span>
      </div>

    </section>
  );
};
