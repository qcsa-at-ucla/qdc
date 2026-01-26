'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function QDW2026Info() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Google Form submission URL from environment variables
    const googleFormUrl = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || '';

    // Map form data to Google Form entry IDs from environment variables
    const formDataToSubmit = new FormData();
    formDataToSubmit.append(process.env.NEXT_PUBLIC_ENTRY_FIRST_NAME || '', formData.firstName);
    formDataToSubmit.append(process.env.NEXT_PUBLIC_ENTRY_LAST_NAME || '', formData.lastName);
    formDataToSubmit.append(process.env.NEXT_PUBLIC_ENTRY_EMAIL || '', formData.email);
    formDataToSubmit.append(process.env.NEXT_PUBLIC_ENTRY_DESIGNATION || '', formData.designation);
    formDataToSubmit.append(process.env.NEXT_PUBLIC_ENTRY_LOCATION || '', formData.location);

    try {
      await fetch(googleFormUrl, {
        method: 'POST',
        body: formDataToSubmit,
        mode: 'no-cors',
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitted(true);
    }

    setIsSubmitting(false);
  };

  // Sponsors - using partner images as placeholders
  const sponsors = [
    { name: 'Google Quantum', logo: '/images/partners/google-quantum.png' },
    { name: 'Koch', logo: '/images/partners/koch.png' },
    { name: 'Eli', logo: '/images/partners/eli.png' },
    { name: 'SuperQubit', logo: '/images/partners/superqubit.png' },
  ];

  // Academic Groups - using partner images as placeholders
  const academicGroups = [
    { name: 'UCLA', logo: '/images/partners/ucla.png' },
    { name: 'USC', logo: '/images/partners/usc.png' },
    { name: 'Northwestern', logo: '/images/partners/northwestern.png' },
    { name: 'Oregon', logo: '/images/partners/oregon.png' },
  ];

  return (
    <>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-left {
          animation: scrollLeft 25s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scrollRight 25s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left,
          .animate-scroll-right {
            animation: none !important;
          }
        }
      `}</style>
      <main className="min-h-screen">
      {/* Hero Section - Background image with overlay text */}
      <section className="relative min-h-screen pt-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/qdw_main.png"
            alt="Quantum Device Design Workshop"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-right lg:ml-auto lg:max-w-2xl"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                Quantum Device Workshop
              </h1>
              <Link
                href="/qdw/2026/registration"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
              >
                Register Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - White background */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                About Quantum Device Workshop
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art of designing quantum devices. This year we have a 4-day hands-on workshop on how to effectively design superconducting qubits.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                We covered basic theory and simulation techniques, best practices, and general constraints for designing superconducting devices. We offered a beginner track and an advanced track so that people of all different skill levels could gain something from this event.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                There was an in-person registration for the lectures, workshop, and panel sessions. Attendants could also register for an online-only session for the lectures and limited workshop sessions.
              </p>
            </motion.div>

            {/* Right side - Chip image in dark card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 flex justify-center lg:justify-end"
            >
              <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
                <div className="relative w-[250px] h-[250px] sm:w-[300px] sm:h-[300px]">
                  <Image
                    src="/images/quantum_device_chip.png"
                    alt="Quantum Device Chip"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Sponsors
          </h2>
        </div>
        <div className="w-full">
          <div className="relative overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }}></div>
            <div className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }}></div>
            
            {/* Scrolling container */}
            <div className={`flex ${!reducedMotion ? 'animate-scroll-left' : ''}`}>
              {/* First set */}
              {sponsors.map((sponsor, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-32 lg:w-52 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={200}
                    height={80}
                    className="max-w-full max-h-full object-contain p-3"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {sponsors.map((sponsor, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-32 lg:w-52 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={sponsor.logo}
                    alt=""
                    width={200}
                    height={80}
                    className="max-w-full max-h-full object-contain p-3"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academic Groups Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Academic Groups
          </h2>
        </div>
        <div className="w-full">
          <div className="relative overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}></div>
            <div className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}></div>
            
            {/* Scrolling container - opposite direction */}
            <div className={`flex ${!reducedMotion ? 'animate-scroll-right' : ''}`}>
              {/* First set */}
              {academicGroups.map((group, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-32 lg:w-52 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={group.logo}
                    alt={group.name}
                    width={200}
                    height={80}
                    className="max-w-full max-h-full object-contain p-3"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {academicGroups.map((group, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8 flex items-center justify-center h-20 w-32 sm:h-24 sm:w-36 md:h-28 md:w-44 lg:h-32 lg:w-52 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={group.logo}
                    alt=""
                    width={200}
                    height={80}
                    className="max-w-full max-h-full object-contain p-3"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left side - Social icons */}
            <div className="flex items-center gap-6">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>

            {/* Right side - Logo and text */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-xl p-2">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/quantum_device_chip.png"
                    alt="Quantum Device Workshop"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-white font-semibold text-lg leading-tight">
                Quantum<br />Device<br />Workshop
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
