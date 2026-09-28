import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapParallax(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Parallax on background atmosphere mandalas & glows
      gsap.utils.toArray<HTMLElement>('.gsap-parallax-bg').forEach((elem) => {
        const speed = parseFloat(elem.dataset.speed || '0.2');
        gsap.to(elem, {
          y: () => -120 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: elem.closest('section') || elem,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // 2. Parallax zoom & translation on sacred framed images
      gsap.utils.toArray<HTMLElement>('.gsap-parallax-img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.08 },
          {
            yPercent: 8,
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('section') || img,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      });

      // 3. Floating rotating sacred seals
      gsap.utils.toArray<HTMLElement>('.gsap-rotate-seal').forEach((seal) => {
        gsap.to(seal, {
          rotation: 360,
          ease: 'none',
          scrollTrigger: {
            trigger: seal.closest('section') || seal,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        });
      });

      // 4. Subtle staggered reveal on section headings
      gsap.utils.toArray<HTMLElement>('.gsap-reveal-title').forEach((title) => {
        gsap.from(title, {
          opacity: 0,
          y: 35,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // 5. Staggered card reveals
      gsap.utils.toArray<HTMLElement>('.gsap-cards-stagger').forEach((container) => {
        const cards = container.children;
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [containerRef]);
}
