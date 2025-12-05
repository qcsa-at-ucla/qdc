'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';

export default function ResearchPartners() {
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
      scale: 2.4,
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <AnimatedSection direction="fade" delay={0.1}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black text-center mb-12 md:mb-20">
            Research Partners
          </h2>
        </AnimatedSection>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-center justify-items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center w-full h-24 md:h-28 lg:h-32 px-4"
            >
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={partner.scale ? { transform: `scale(${partner.scale})` } : undefined}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
