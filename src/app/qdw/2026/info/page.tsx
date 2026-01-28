'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function QDW2026Info() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [speakerPage, setSpeakerPage] = useState(0);
  const [isSponsorsScrolling, setIsSponsorsScrolling] = useState(false);
  const [isAcademicScrolling, setIsAcademicScrolling] = useState(false);
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

  // Sponsors - updated with new sponsor list
  const sponsors = [
    { name: 'Rigetti', logo: '/images/partners/rigetti.png' },
    { name: 'Google Quantum', logo: '/images/partners/google-quantum.png' },
    { name: 'QBlox', logo: '/images/partners/qblox.png' },
    { name: 'Nvidia', logo: '/images/partners/nvidia.png' },
  ];

  // Academic Groups - using partner images as placeholders
  const academicGroups = [
    { name: 'UCLA', logo: '/images/partners/ucla.png' },
    { name: 'USC', logo: '/images/partners/usc.png' },
    { name: 'Northwestern', logo: '/images/partners/northwestern.png' },
    { name: 'Oregon', logo: '/images/partners/oregon.png' },
  ];

  // Speakers
  const speakers = [
    {
      name: 'Daniel Sank',
      affiliation: 'Google',
      image: '/images/Daniel_Sank.png',
      bio: 'Daniel Sank is a research scientist at Google Quantum AI, working on superconducting qubit systems and quantum error correction.',
    },
    {
      name: 'Jeffrey Grover',
      affiliation: 'MIT',
      image: '/images/Jeffrey_Grover.jpg',
      bio: 'Jeffrey Grover is a researcher at MIT focusing on quantum devices and superconducting qubit technologies.',
    },
    {
      name: 'Jens Koch',
      affiliation: 'Northwestern',
      image: '/images/Jens_Koch.jpeg',
      bio: 'Jens Koch is a professor at Northwestern University, known for his foundational work on transmon qubits and circuit quantum electrodynamics.',
    },
    {
      name: 'Andrew Bestwick',
      affiliation: 'Rigetti',
      image: '/images/andrew_bestwick.jpg',
      bio: 'Andrew Bestwick is a leading researcher in superconducting quantum computing, focusing on qubit design and scalable quantum architectures.',
    },
    {
      name: 'Anna Grassellino',
      affiliation: 'Fermilab',
      image: '/images/Anna_Grassellino.jpg',
      bio: 'Anna Grassellino is a physicist at Fermilab, pioneering advances in superconducting radio-frequency cavities and quantum information science.',
    },
    {
      name: 'Eli Levenson-Falk',
      affiliation: 'USC',
      image: '/images/ELILF.jpeg',
      bio: 'Eli Levenson-Falk is an expert in quantum device fabrication and materials science for superconducting quantum systems.',
    },
    {
      name: 'Yvonne Gao',
      affiliation: 'NUS',
      image: '/images/yvoneegao.jpg',
      bio: 'Yvonne Gao is a quantum physicist specializing in bosonic quantum error correction and novel qubit architectures.',
    },
    {
      name: 'Zlatko Minev',
      affiliation: 'Google',
      image: '/images/ZMinev.jpeg',
      bio: 'Zlatko Minev is a research scientist known for his work on quantum jumps, qubit design, and the development of Qiskit Metal.',
    },
    {
      name: 'Mollie Schwartz',
      affiliation: 'MIT LL',
      image: '/images/Mollie_Schwartz.jpg',
      bio: 'Mollie Schwartz is a researcher at MIT Lincoln Laboratory working on superconducting quantum devices and systems.',
    },
    {
      name: 'Aziza Almanakly',
      affiliation: 'NYU',
      image: '/images/Aziza_Almanakly.jpg',
      bio: 'Aziza Almanakly is a researcher at NYU specializing in quantum computing and superconducting qubit design.',
    },
    {
      name: 'Taylor Patti',
      affiliation: 'Nvidia',
      image: '/images/Taylor_Patti.jpg',
      bio: 'Taylor Patti is a researcher at Nvidia working on quantum computing algorithms and hardware-software co-design.',
    },
    {
      name: 'Silvia Zorzetti',
      affiliation: 'Fermilab',
      image: '/images/Silvia_Zorzetti.jpg',
      bio: 'Silvia Zorzetti is a scientist at Fermilab focusing on quantum information science and superconducting technologies.',
    },
    {
      name: 'Sara Sussman',
      affiliation: 'FermiLab',
      image: '/images/Sara_Sussman.png',
      bio: 'Sara Sussman is a researcher at FermiLab specializing in quantum device design and fabrication.',
    },
    {
      name: 'Kyle Serniak',
      affiliation: 'MIT LL',
      image: '/images/Kyle_Sernia.jpeg',
      bio: 'Kyle Serniak is a researcher at MIT Lincoln Laboratory working on superconducting qubit technologies and quantum systems.',
    },
    {
      name: 'Nicolas Pancotti',
      affiliation: 'Nvidia',
      image: '/images/Nico_Pancotti.jpeg',
      bio: 'Nicolas Pancotti is a quantum computing researcher working on quantum algorithms and quantum machine learning.',
    },
    {
      name: "Murat Can Sarihan",
      affiliation: 'Google',
      image: '/images/Murat_Can_Sarihan.jpg',
      bio: 'Murat Can Sarihan is a research scientist at Google Quantum AI, focusing on superconducting qubit design and quantum error correction.',

    },
  ];

  return (
    <>
      <main className="min-h-screen">
      {/* Quick Navigation Bar */}
      <section className="bg-black/90 backdrop-blur-md border-b border-white/10 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/qdw/2026/info"
              className="text-purple-300 font-semibold px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30"
            >
              Workshop Info
            </Link>
            <Link
              href="/qdw/2026/registration"
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full border border-white/20 hover:border-white/40"
            >
              Registration
            </Link>
            <Link
              href="/qdw/2026/faq"
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full border border-white/20 hover:border-white/40"
            >
              FAQ
            </Link>
            <Link
              href="/design-tools"
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full border border-white/20 hover:border-white/40"
            >
              Design Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section - Smaller on desktop (3/4 rule), full on mobile */}
      <section className="relative min-h-screen lg:min-h-[75vh] pt-0 overflow-hidden">
        {/* Background Image - smaller visual on horizontal/desktop */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/qdw_main.png"
            alt="Quantum Device Design Workshop"
            fill
            className="object-cover object-center lg:object-[center_30%]"
            priority
          />
          {/* Enhanced gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-screen lg:min-h-[75vh] pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-right lg:ml-auto lg:max-w-2xl"
            >
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                style={{ textShadow: '0 0 20px rgba(147, 51, 234, 0.4), 0 0 40px rgba(147, 51, 234, 0.2), 0 2px 4px rgba(0,0,0,0.5)' }}
              >
                Quantum Device Design Workshop
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-purple-300 mb-1 drop-shadow-lg">
                June 15–18, 2026
              </p>
              <p className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow-lg">
                Cohen Room and Mong Auditorium, Engineering VI Building at UCLA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Link
                  href="/qdw/2026/registration"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full px-8 py-4 text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-300"
                >
                  Register Now
                </Link>
                <Link
                  href="/design-tools"
                  className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full px-8 py-4 text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
                >
                  Design Tools
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - White background, no chip image, content moved up */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white lg:min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              About Quantum Device Workshop
            </h2>
            <p className="text-gray-900 text-lg leading-relaxed">
              The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art of designing quantum devices. QDW 2026 features a 4-day hands-on workshop on how to effectively design, simulate and work with superconducting qubits.
              We will cover theory and simulation techniques, best practices, and general constraints for designing superconducting devices. We offer an introductory track and an advanced track so that people of all skill levels can gain something from this event.
              We offer in-person lectures, workshops, and panel sessions. In 2026 we will also offer a Poster session, a design project and a career perspective session. Attendees can register for an online-only option for the lectures and workshop sessions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Location & Date Section — side-by-side on desktop, 2026 info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 lg:min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          >
            {/* Location — left on desktop */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-10 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Location</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                QDW 2026 will be hosted in person at the <strong className="text-white">Cohen Room and Mong Auditorium in the Engineering VI Building at UCLA</strong>, 404 Westwood Plaza, Los Angeles, CA 90095.
              </p>
              <p className="text-gray-400">
                Online sessions will also be available via Zoom for remote participants.
              </p>
              <a 
                href="https://www.google.com/maps/place/Engineering+VI,+404+Westwood+Plaza,+Los+Angeles,+CA+90095"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium mt-4"
              >
                Open in Google Maps
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Date & time — right on desktop */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-10 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Date & time</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-2">
                <strong className="text-white">June 15–18, 2026</strong>
              </p>
              <p className="text-gray-400">
                In-person and online options. Schedule details for QDW 2026 will be posted closer to the event.
              </p>
            </div>
          </motion.div>
          {/* Map — full width below on mobile, or inline on desktop if preferred */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <div className="rounded-xl overflow-hidden border border-white/10 h-48 md:h-56 lg:h-64">
              <iframe
                title="UCLA Engineering VI"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0126853671!2d-118.4449077!3d34.0689755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc88bcefb20f%3A0xc622b89fcd2f5d21!2sEngineering%20VI%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1706000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">UCLA Engineering VI — QDW 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Track Schedules — QDW 2026 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 lg:min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Workshop Tracks</h2>
            <p className="text-gray-400 text-center mb-12">QDW 2026</p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Training Track */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Training Track</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 1: Foundation</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Review of Device Design and Simulation Tools</li>
                      <li>• Initialization, Gates & Readout</li>
                      <li>• Workshop on Design&Layout</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 2: Couplers</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Couplers and Noise in superconducting systems</li>
                      <li>• Designing Qubit-Coupler System</li>
                      <li>• Workshop on Simulation Techniques</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 3: Material Considerations & Errors</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Material Considerations for superconducting systems</li>
                      <li>• ABCD Formalism, Quantum Error Correction and Large Scale Simulation</li>
                      <li>• Simulation Workshop of Qubit-Coupler System</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 4: Project</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Design Project</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Advanced Track — QDW 2026 */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Advanced Track</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 1: Introduction</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Review of essential topics in superconducting quantum devices, including device design, simulation, and control integration</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 2: Advanced simulation and Cryogenic On Chip Control</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Advanced simulation methods and cryogenic on chip control architectures</li>
                    
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 3: Quantum Error Correction</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Quantum error correction implementation for device design and simulaton</li>
            
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 4: Hybrid Systems and Novel Couplers</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Hybrid Quantum Systems and novel device architectures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workshop Activities Section — 3/4 rule on desktop */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 lg:min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Workshop Activities</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Panel Discussions */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Panel Discussions</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Engage with industry experts and researchers in interactive panel sessions covering career perspectives, emerging technologies, and the future of quantum computing.
                </p>
              </div>

              {/* Quantum Beers */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-amber-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Quantum Beers</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Unwind and network with fellow attendees, speakers, and sponsors during our casual evening social events. Build connections over refreshments in a relaxed atmosphere.
                </p>
              </div>

              {/* Design Project */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Design Project</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Apply your knowledge hands-on! Work in teams to design and simulate a quantum device, receiving feedback from mentors and presenting your work on the final day.
                </p>
              </div>

              {/* Poster Session */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Poster Session</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Present your research and projects to the quantum community. Exchange ideas, receive feedback, and discover cutting-edge work from researchers across institutions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Speakers Section — 3/4 rule on desktop */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 lg:min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            QDW Speakers
          </h2>
          
          {/* Speakers list with navigation */}
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              onClick={() => setSpeakerPage((prev) => (prev === 0 ? Math.ceil(speakers.length / 4) - 1 : prev - 1))}
              className="flex-shrink-0 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center hover:bg-purple-600/50 transition-all duration-300"
              aria-label="Previous speakers"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Speakers Grid */}
            <div className="overflow-x-hidden overflow-y-visible flex-1 mx-4 md:mx-8">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${speakerPage * 100}%)` }}
              >
                {/* Group speakers into pages of 4 */}
                {Array.from({ length: Math.ceil(speakers.length / 4) }).map((_, pageIndex) => (
                  <div key={pageIndex} className="flex-shrink-0 w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pb-48">
                      {speakers.slice(pageIndex * 4, pageIndex * 4 + 4).map((speaker, index) => (
                        <div key={index} className="relative flex flex-col items-center group">
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:scale-105 bg-gray-900 cursor-pointer">
                            <Image
                              src={speaker.image}
                              alt={speaker.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-white font-semibold mt-3 text-center text-sm sm:text-base">{speaker.name}</p>
                          {speaker.affiliation && (
                            <p className="text-purple-300 text-xs sm:text-sm text-center">{speaker.affiliation}</p>
                          )}
                          {/* Hover tooltip */}
                          <div className={`absolute top-full mt-2 w-56 sm:w-64 p-3 sm:p-4 bg-gray-900 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 border border-purple-500/30 ${index % 2 === 0 ? 'left-0 sm:left-1/2 sm:-translate-x-1/2' : 'right-0 sm:left-1/2 sm:-translate-x-1/2'}`}>
                            <p className="text-white font-semibold mb-1 text-sm sm:text-base">{speaker.name}</p>
                            {speaker.affiliation && (
                              <p className="text-purple-300 text-xs mb-1">{speaker.affiliation}</p>
                            )}
                            <p className="text-gray-300 text-xs sm:text-sm">{speaker.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Arrow */}
            <button
              onClick={() => setSpeakerPage((prev) => (prev === Math.ceil(speakers.length / 4) - 1 ? 0 : prev + 1))}
              className="flex-shrink-0 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center hover:bg-purple-600/50 transition-all duration-300"
              aria-label="Next speakers"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Page indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(speakers.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setSpeakerPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${speakerPage === index ? 'bg-purple-500 w-6' : 'bg-gray-600 hover:bg-gray-500'}`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            Sponsors
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            {isSponsorsScrolling ? 'Click to stop scrolling' : 'Click to start scrolling'}
          </p>
        </div>
        <div className="w-full">
          <div 
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setIsSponsorsScrolling(!isSponsorsScrolling)}
          >
            {/* Enhanced gradient overlays */}
            <div className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgb(249 250 251), transparent)' }}></div>
            <div className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgb(249 250 251), transparent)' }}></div>
            
            {/* Scrolling container */}
            <div className={`flex ${isSponsorsScrolling && !reducedMotion ? 'animate-scroll-left' : ''}`}>
              {/* First set */}
              {sponsors.map((sponsor, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 flex items-center justify-center h-24 w-40 sm:h-28 sm:w-48 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-purple-200 [&_img]:max-w-[85%] [&_img]:max-h-[85%] [&_img]:object-contain [&_img]:object-center"
                >
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={160}
                    height={96}
                    className="object-contain object-center p-3 bg-transparent"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {sponsors.map((sponsor, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 flex items-center justify-center h-24 w-40 sm:h-28 sm:w-48 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-purple-200 [&_img]:max-w-[85%] [&_img]:max-h-[85%] [&_img]:object-contain [&_img]:object-center"
                >
                  <Image
                    src={sponsor.logo}
                    alt=""
                    width={160}
                    height={96}
                    className="object-contain object-center p-3 bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academic Groups Section */}
      <section className="py-16 bg-gradient-to-br from-white to-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            Academic Groups
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            {isAcademicScrolling ? 'Click to stop scrolling' : 'Click to start scrolling'}
          </p>
        </div>
        <div className="w-full">
          <div 
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setIsAcademicScrolling(!isAcademicScrolling)}
          >
            {/* Enhanced gradient overlays */}
            <div className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}></div>
            <div className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}></div>
            
            {/* Scrolling container - opposite direction */}
            <div className={`flex ${isAcademicScrolling && !reducedMotion ? 'animate-scroll-right' : ''}`}>
              {/* First set */}
              {academicGroups.map((group, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 flex items-center justify-center h-24 w-40 sm:h-28 sm:w-48 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-indigo-200 [&_img]:max-w-[85%] [&_img]:max-h-[85%] [&_img]:object-contain [&_img]:object-center"
                >
                  <Image
                    src={group.logo}
                    alt={group.name}
                    width={160}
                    height={96}
                    className="object-contain object-center p-3 bg-transparent"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {academicGroups.map((group, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 sm:mx-6 flex items-center justify-center h-24 w-40 sm:h-28 sm:w-48 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-indigo-200 [&_img]:max-w-[85%] [&_img]:max-h-[85%] [&_img]:object-contain [&_img]:object-center"
                >
                  <Image
                    src={group.logo}
                    alt=""
                    width={160}
                    height={96}
                    className="object-contain object-center p-3 bg-transparent"
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
                href="https://github.com/qcsa-at-ucla"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/10"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="https://discord.gg/qcsa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/10"
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
