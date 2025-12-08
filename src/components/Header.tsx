'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/first_header_background.png"
          alt="Quantum background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-5xl sm:text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-10  px-2 leading-relaxed"
        >
          Quantum Device Consortium
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-4xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white text-center max-w-5xl mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2"
        >
          The Quantum Device Community aims to be an open association for pioneers of the quantum device design and simulation community.
        </motion.p>

        {/* Join Us Link (styled like a button) with gradient and expand-on-hover/focus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 0.87 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        >
          <Link
            href="/join"
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 rounded-full transition-transform duration-200 ease-out transform hover:scale-[1.02] focus:scale-[1.02] active:scale-100 shadow-2xl outline-none focus:ring-4 focus:ring-indigo-300/40"
            aria-label="Join Quantum Device Consortium"
          >
            Join Us
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
