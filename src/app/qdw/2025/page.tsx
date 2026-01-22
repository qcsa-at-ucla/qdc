'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function QDW2025() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pt-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6">
              Past Event - May 2025
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Quantum Device Design Workshop: Superconducting Qubits
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              A 4-day hands-on workshop on how to effectively design superconducting qubits
            </p>
          </motion.div>
        </div>
      </section>

      {/* Workshop Goals Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Workshop Goals</h2>
            
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art of designing quantum devices. This year we have a 4-day hands-on workshop on how to effectively design superconducting qubits.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                We covered basic theory and simulation techniques, best practices, and general constraints for designing superconducting devices. We offered a beginner track and an advanced track so that people of all different skill levels could gain something from this event.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                There was an in-person registration for the lectures, workshop, and panel sessions. Attendants could also register for an online-only session for the lectures and limited workshop sessions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Location</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  The Quantum Device Workshop was hosted in person at the <strong className="text-white">Tesla and Shannon Rooms of Engineering IV</strong>, 420 Westwood Plaza, Los Angeles, CA 90095
                </p>
                <p className="text-gray-400">
                  Online sessions were also available via Zoom for remote participants.
                </p>
              </div>
              <div className="w-full md:w-1/3">
                <div className="bg-indigo-500/20 rounded-xl p-6 text-center">
                  <svg className="w-12 h-12 text-indigo-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-white font-semibold">UCLA Engineering IV</p>
                  <p className="text-gray-400 text-sm">Los Angeles, CA</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Track Schedules */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Workshop Tracks</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Beginner Track */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Beginner Track</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 1: Foundation</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Review classical LC circuits, resonance, and transmission lines</li>
                      <li>• Circuit quantization, the Josephson junction, and transmon qubits</li>
                      <li>• Introduction to circuit QED and dispersive interactions</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 2: Theory</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Charge and flux drives and single-qubit gates</li>
                      <li>• Qubit-qubit coupling and two-qubit gates</li>
                      <li>• Readout, SNR, and Purcell effects</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 3: Design</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Design circuit Hamiltonians</li>
                      <li>• Perform EM simulation and learn layout generation tools</li>
                      <li>• Interpret EM simulations (LOM and EPR)</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-green-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Day 4: Non-idealities and more</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Quantum and classical crosstalk, crosstalk suppression techniques</li>
                      <li>• Interface dielectric loss and suppression techniques</li>
                      <li>• Advanced designs, including flip-chips, through-silicon vias, and multi-chip-modules</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Advanced Track */}
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
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 2: Advanced simulation</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Finite element analysis, energy participation ratio calculations, and optimization algorithms</li>
                      <li>• AI-driven approaches in simulation, automated device design processes, and intelligent control systems</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 3: Devices</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Advanced device architectures and cutting-edge applications</li>
                      <li>• Complex multi-qubit systems and advanced control techniques</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-2 border-purple-500/50 pl-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">Day 4: Error correction</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Surface code implementations and logical qubit architectures</li>
                      <li>• Device layout optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academic Groups Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Special Thanks to these Academic Groups</h2>
            
            <div className="flex flex-wrap justify-center gap-6">
              {['UCLA', 'USC', 'Northwestern', 'Oregon'].map((group) => (
                <div
                  key={group}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-24 h-24 flex items-center justify-center">
                    <Image
                      src={`/images/partners/${group.toLowerCase()}.png`}
                      alt={group}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Sponsors</h2>
            
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { name: 'Google Quantum', logo: '/images/partners/google-quantum.png' },
                { name: 'Koch', logo: '/images/partners/koch.png' },
                { name: 'Eli', logo: '/images/partners/eli.png' },
                { name: 'SuperQubit', logo: '/images/partners/superqubit.png' },
              ].map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-32 h-20 flex items-center justify-center">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={120}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA for 2026 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Don&apos;t Miss QDW 2026!
            </h2>
            <p className="text-gray-400 mb-8">
              Join us for the next Quantum Design Workshop and be part of the quantum revolution.
            </p>
            <Link
              href="/qdw/2026/info"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-full px-8 py-4 text-lg shadow-2xl transition-transform duration-200 hover:scale-[1.03]"
            >
              Learn About QDW 2026
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
