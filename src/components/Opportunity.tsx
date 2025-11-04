'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';

export default function Opportunity() {
  const opportunities = [
    "Research Exchanges at Labs",
    "Mentorship Programs",
    "Workshops"
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background with actual image - blurred */}
      <div className="absolute inset-0">
        <Image 
          src="/sheet.jpg" 
          alt="Background" 
          fill
          className="object-cover blur-sm"
          priority
          quality={100}
        />
      </div>

      {/* Main Content */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <AnimatedSection direction="left" delay={0.1}>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-sans">
                Provide opportunity and projects to students and individuals aiming to get exposed to the field
              </p>
            </div>
          </AnimatedSection>

          {/* Right: Tiles with hover effects - brighter and thinner */}
          <div className="flex flex-col gap-6">
            {opportunities.map((title, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                  ease: 'easeOut',
                }}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-white/15 backdrop-blur-sm rounded-xl px-8 py-4 cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-700/40"
              >
                <p className="text-white text-xl sm:text-2xl font-medium text-center transition-colors duration-300 ease-in-out group-hover:text-gray-400 font-sans">
                  {title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
