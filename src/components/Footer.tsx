'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Footer() {
  return (



    <footer className="relative bg-gradient-to-b from-neutral-900 via-black to-black text-neutral-300 mt-0">
      
      
      {/*Curved Footer Bar*/}
      <div className="absolute -top-10 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-10 text-neutral-900"
        >
          <path
            d="M985.66 83.4c-70.5 0-142-16.1-212.5-33.3C704.66 31.4 634.66 15.4 564.66 15.4S424.66 31.4 354.66 50.1c-70.5 17.2-142 33.3-212.5 33.3H0v36h1200v-36h-214.34z"
            fill="currentColor"
          ></path>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center text-center px-6 py-16 space-y-6"
      >



        {/* Footer Title */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/images/qdcLogo.png"
            alt="QDC Logo"
            width={160}
            height={160}
            className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 drop-shadow-2xl"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
            Quantum Device Consortium
          </h2>
        </div>




        {/* Contact Info */}
        <div className="space-y-1 text-sm sm:text-base text-neutral-400">
          <p className="font-medium text-white">Contact Us</p>
          <a
            href="mailto:info@quantumdevices.org"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            info@quantumdevices.org
          </a>
        </div>
      </motion.div>




      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Quantum Device Consortium · All rights reserved.
      </div>
    </footer>


  );
}
