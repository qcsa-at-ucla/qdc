'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

export default function ResearchPartners({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const partners = [
    {
      name: 'University of Oregon',
      logo: '/images/partners/oregon.png',
      width: 280,
      height: 100,
    },
    {
      name: 'USC',
      logo: '/images/partners/eli.png',
      width: 200,
      height: 100,
    },
    {
      name: 'Northwestern University',
      logo: '/images/partners/koch.png',
      width: 280,
      height: 100,
    },
    {
      name: 'Google AI Quantum',
      logo: '/images/partners/google-quantum.png',
      width: 280,
      height: 100,
    },
    {
      name: 'Niels Bohr Institute',
      logo: '/images/partners/niels-bohr.png',
      width: 280,
      height: 100,
    },
    {
      name: 'QCSA',
      logo: '/images/partners/Final_QCSA_Logo-15.png',
      width: 260,
      height: 130,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-left {
          animation: scrollLeft 25s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scrollRight 25s linear infinite;
        }
        
        .animate-scroll-left.paused,
        .animate-scroll-right.paused {
          animation-play-state: paused;
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left,
          .animate-scroll-right {
            animation: none !important;
          }
        }
      `}</style>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <AnimatedSection direction="fade" delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black text-center mb-12 md:mb-20">
              Research Partners
            </h2>
          </AnimatedSection>
        </div>

        {/* Infinite Carousel */}
        <div className="w-full px-4">
          <div 
            className="relative overflow-hidden"
            role="region"
            aria-label="Scrolling partner logos"
            aria-live="polite"
          >
            {/* Gradient overlays */}
            <div 
              className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" 
              style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
              aria-hidden="true"
            ></div>
            <div 
              className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" 
              style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}
              aria-hidden="true"
            ></div>
            
            {/* Scrolling container */}
            <div 
              className={`flex ${!reducedMotion ? (direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right') : ''}`}
            >
              {/* First set of logos */}
              {partners.map((partner, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-40 lg:w-60 bg-white rounded-lg transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    boxShadow: '0 10px 15px -3px rgba(51, 102, 255, 0.1), 0 4px 6px -2px rgba(51, 102, 255, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(51, 102, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(51, 102, 255, 0.1), 0 4px 6px -2px rgba(51, 102, 255, 0.05)';
                  }}
                  aria-label={partner.name}
                >
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={partner.width}
                    height={partner.height}
                    className="max-w-full max-h-full object-contain transition-all duration-300 p-2"
                  />
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {partners.map((partner, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-40 lg:w-60 bg-white rounded-lg transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    boxShadow: '0 10px 15px -3px rgba(51, 102, 255, 0.1), 0 4px 6px -2px rgba(51, 102, 255, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(51, 102, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(51, 102, 255, 0.1), 0 4px 6px -2px rgba(51, 102, 255, 0.05)';
                  }}
                  aria-hidden="true"
                >
                  <Image
                    src={partner.logo}
                    alt=""
                    width={partner.width}
                    height={partner.height}
                    className="max-w-full max-h-full object-contain transition-all duration-300 p-2"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Screen reader friendly list */}
          <div className="sr-only">
            <h3>Complete list of research partners:</h3>
            <ul>
              {partners.map((partner, index) => (
                <li key={index}>{partner.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
