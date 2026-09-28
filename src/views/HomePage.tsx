import React, { useEffect, useRef } from 'react';
import { FaqAccordion } from '../components/FaqAccordion';
import { HeroSection } from '../components/HeroSection';
import { RitualJourney } from '../components/RitualJourney';
import { HomaLivestreamSection } from '../components/HomaLivestreamSection';
import { VedicPersonalisation } from '../components/VedicPersonalisation';
import { PackageCards } from '../components/PackageCards';
import { SunriseTimeline } from '../components/SunriseTimeline';
import { GiftingBanner } from '../components/GiftingBanner';
import { StoriesSection } from '../components/StoriesSection';
import { VedicMarqueeBanner } from '../components/VedicMarqueeBanner';
import { SectionNavigator } from '../components/SectionNavigator';
import { useGsapParallax } from '../lib/useGsapParallax';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const root = useRef<HTMLDivElement>(null);

  // Initialize GSAP Parallax and ScrollTrigger scrubbers
  useGsapParallax(root);

  useEffect(() => {
    const sections = root.current?.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    sections?.forEach((section) => {
      section.classList.add('reveal-section');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="home-experience space-y-0 relative">
      {/* Floating Sacred Section Navigator on Desktop */}
      <SectionNavigator />

      {/* 01: The Sacred Hero Screen */}
      <HeroSection navigate={navigate} />

      {/* Shloka Transition Ribbon */}
      <VedicMarqueeBanner variant="shloka" />

      {/* 02: The Fivefold Vedic Tapestry */}
      <RitualJourney navigate={navigate} />

      {/* 03: Ayushya Homa & Global 4K Livestream */}
      <HomaLivestreamSection navigate={navigate} />

      {/* 04: The Celestial Astrolabe (Nakshatra Alignment) */}
      <VedicPersonalisation navigate={navigate} />

      {/* 05: Three Sacred Offerings (Packages) */}
      <PackageCards navigate={navigate} />

      {/* Assurance Transition Ribbon */}
      <VedicMarqueeBanner variant="assurance" />

      {/* 06: The Diurnal Solar Arc (Sunrise Timeline) */}
      <SunriseTimeline />

      {/* 07: The Keepsake Sanctuary (Gifting) */}
      <GiftingBanner navigate={navigate} />

      {/* 08: The Heritage Chronicles (Family Stories) */}
      <StoriesSection />

      {/* 09: Clarity & Guidance (FAQs) */}
      <FaqAccordion limit={4} navigate={navigate} />
    </div>
  );
};
