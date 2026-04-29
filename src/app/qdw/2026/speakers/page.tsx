'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import QDW2026Nav from '@/components/QDW2026Nav';

interface Speaker {
  name: string;
  affiliation: string;
  image: string;
  bio: string;
  title?: string;
  sponsored?: boolean;
}

const speakers: Speaker[] = [
  {
    name: 'Andrew Bestwick',
    affiliation: 'Rigetti Computing',
    title: 'Director of Qubit Technology',
    image: '/images/andrew_bestwick.jpg',
    bio: 'Andrew Bestwick is a leading researcher in superconducting quantum computing at Rigetti Computing, focusing on qubit design, fabrication, and scalable quantum architectures. His work bridges materials science and device engineering to push the boundaries of coherent quantum systems.',
  },
  {
    name: 'Anna Grassellino',
    affiliation: 'Fermilab',
    title: 'Senior Scientist & SQMS Center Director',
    image: '/images/Anna_Grassellino.jpg',
    bio: 'Anna Grassellino is a Senior Scientist at Fermilab and Director of the Superconducting Quantum Materials and Systems (SQMS) Center. She is a world leader in superconducting radio-frequency (SRF) cavity science and quantum information technologies, pioneering advances that enable longer coherence times in superconducting systems.',
  },
  {
    name: 'Yvonne Gao',
    affiliation: 'National University of Singapore',
    title: 'Assistant Professor',
    image: '/images/yvoneegao.jpg',
    bio: 'Yvonne Gao is an Assistant Professor at NUS working on bosonic quantum error correction and novel superconducting qubit architectures. Her research focuses on hardware-efficient quantum error correction schemes and new qubit modalities for fault-tolerant quantum computing.',
  },
  {
    name: 'Andreas Walraff',
    affiliation: 'ETH Zurich',
    title: 'Professor of Solid State Physics',
    image: '/images/Andreas_Walraff.jpg',
    bio: 'Andreas Walraff is a Professor at ETH Zurich and a pioneer in circuit quantum electrodynamics (cQED). He discovered the strong coupling between a single photon and a superconducting qubit, opening a new paradigm in quantum information science. His group works on qubit design, quantum communication, and fault-tolerant quantum computation.',
  },
  {
    name: 'Zlatko Minev',
    affiliation: 'Google Quantum AI',
    title: 'Research Scientist',
    image: '/images/ZMinev.jpeg',
    bio: 'Zlatko Minev is a Research Scientist at Google Quantum AI, known for his landmark work on catching and reversing quantum jumps. He also created Qiskit Metal, an open-source quantum hardware design tool. His research spans quantum measurement, qubit design automation, and machine learning for quantum systems.',
  },
  {
    name: 'Eli Levenson-Falk',
    affiliation: 'University of Southern California',
    title: 'Associate Professor',
    image: '/images/ELILF.jpeg',
    bio: 'Eli Levenson-Falk is an Associate Professor at USC specializing in quantum device fabrication, materials science, and noise in superconducting quantum systems. His group studies the microscopic origins of decoherence and develops new approaches to building long-lived qubits.',
  },
  {
    name: 'Jens Koch',
    affiliation: 'Northwestern University',
    title: 'Associate Professor of Physics',
    image: '/images/Jens_Koch.jpeg',
    bio: 'Jens Koch is an Associate Professor at Northwestern University and the co-inventor of the transmon qubit — today the most widely used superconducting qubit architecture. His theoretical research covers circuit QED, quantum engineering, open quantum systems, and the design of noise-protected qubits.',
  },
  {
    name: 'Mollie Schwartz',
    affiliation: 'MIT Lincoln Laboratory',
    title: 'Technical Staff',
    image: '/images/Mollie_Schwartz.jpg',
    bio: 'Mollie Schwartz is a member of the Technical Staff at MIT Lincoln Laboratory where she develops superconducting quantum devices and integrated quantum systems. Her work focuses on qubit fabrication, multi-qubit processors, and the engineering challenges of scaling superconducting quantum hardware.',
  },
  {
    name: 'Kevin O\'Brien',
    affiliation: 'MIT',
    title: 'Assistant Professor of EECS',
    image: '/images/Kevin_Brien.jpg',
    bio: 'Kevin O\'Brien is an Assistant Professor at MIT EECS working on engineering quantum light-matter interactions and superconducting circuits for quantum technologies. His group develops new qubit architectures, quantum amplifiers, and hardware approaches to fault-tolerant quantum computing.',
  },
  {
    name: 'Alp Sipahigil',
    affiliation: 'UC Berkeley',
    title: 'Assistant Professor',
    image: '/images/Alp_Sipahigil.jpg',
    bio: 'Alp Sipahigil is an Assistant Professor at UC Berkeley developing solid-state quantum hardware using superconducting circuits and quantum photonics. His group works on microwave-to-optical transduction, quantum networks, and integrated photonic quantum devices.',
  },
  {
    name: 'Holly Stemp',
    affiliation: 'MIT',
    title: 'Postdoctoral Associate',
    image: '/images/Holly_Stemp.jpg',
    bio: 'Holly Stemp is a Postdoctoral Associate at MIT working at the intersection of spin qubits and superconducting circuits. Her research explores hybrid qubit architectures that combine the long coherence of spin systems with the connectivity and control of superconducting platforms.',
  },
  {
    name: 'Jeffrey Grover',
    affiliation: 'MIT',
    title: 'Researcher',
    image: '/images/Jeffrey_Grover.jpg',
    bio: 'Jeffrey Grover is a researcher at MIT working on quantum devices, superconducting qubit systems, and novel qubit modalities. His work spans device design, fabrication, and experimental characterization of quantum circuits.',
  },
  {
    name: 'Daniel Sank',
    affiliation: 'Google Quantum AI',
    title: 'Research Scientist',
    image: '/images/Daniel_Sank.png',
    bio: 'Daniel Sank is a Research Scientist at Google Quantum AI, where he has made key contributions to understanding and mitigating noise in superconducting qubits, including the discovery and characterization of two-level system defects. His work has been central to Google\'s advances in qubit coherence and quantum supremacy.',
  },
  {
    name: 'Reza Molavi',
    affiliation: 'Google Quantum AI',
    title: 'Research Scientist',
    image: '/images/Reza_Molavi.jpg',
    bio: 'Reza Molavi is a Research Scientist at Google Quantum AI focusing on superconducting qubit design and quantum computing research. His work contributes to advancing qubit performance and the development of scalable multi-qubit processors.',
  },
  {
    name: 'Shuhei Tamate',
    affiliation: 'RIKEN',
    title: 'Research Scientist',
    image: '/images/Shuhei_Tamate.png',
    bio: 'Shuhei Tamate is a Research Scientist at RIKEN specializing in superconducting quantum circuits and scalable quantum computing hardware. His research advances the fabrication and characterization of large-scale superconducting qubit arrays for practical quantum computation.',
  },
  {
    name: 'Kyle Serniak',
    affiliation: 'MIT Lincoln Laboratory',
    title: 'Technical Staff',
    image: '/images/Kyle_Sernia.jpeg',
    bio: 'Kyle Serniak is a member of the Technical Staff at MIT Lincoln Laboratory working on superconducting qubit technologies and quantum systems. His research focuses on improving qubit coherence, understanding loss mechanisms, and developing high-performance quantum hardware for large-scale applications.',
  },
  {
    name: 'Silvia Zorzetti',
    affiliation: 'Fermilab',
    title: 'Scientist',
    image: '/images/Silvia_Zorzetti.jpg',
    bio: 'Silvia Zorzetti is a Scientist at Fermilab contributing to the SQMS Center, working on quantum information science, superconducting technologies, and high-coherence cavity quantum electrodynamics. Her research bridges particle physics instrumentation and quantum computing.',
  },
  {
    name: 'Sara Sussman',
    affiliation: 'Fermilab',
    title: 'Researcher',
    image: '/images/Sara_Sussman.png',
    bio: 'Sara Sussman is a researcher at Fermilab specializing in quantum device design and fabrication within the SQMS Center. Her work focuses on developing and characterizing superconducting quantum systems for both quantum computing and quantum sensing applications.',
  },
  {
    name: 'Nicola Pancotti',
    affiliation: 'NVIDIA',
    title: 'Research Scientist',
    image: '/images/Nico_Pancotti.jpeg',
    bio: 'Nicola Pancotti is a Research Scientist at NVIDIA working at the intersection of quantum computing and machine learning. His research covers quantum algorithms, quantum machine learning, and the development of AI-accelerated simulation tools for quantum hardware design.',
  },
  {
    name: 'Taylor Patti',
    affiliation: 'NVIDIA',
    title: 'Research Scientist',
    image: '/images/Taylor_Patti.jpg',
    bio: 'Taylor Patti is a Research Scientist at NVIDIA advancing quantum computing through hardware-software co-design and quantum algorithm development. Her work spans near-term quantum algorithms, tensor network methods, and high-performance simulation of quantum systems.',
  },
  {
    name: 'Aziza Almanakly',
    affiliation: 'NYU',
    title: 'Researcher',
    image: '/images/Aziza_Almanakly.jpg',
    bio: 'Aziza Almanakly is a researcher at New York University specializing in quantum computing and superconducting qubit design. Her work focuses on qubit engineering, device characterization, and advancing hardware for near-term and fault-tolerant quantum processors.',
  },
  {
    name: 'Mark Gyure',
    affiliation: 'UCLA',
    title: 'Executive Director, UCLA CQSE',
    image: '/images/Mark_Gyure.jpg',
    bio: 'Mark Gyure is a Professor at UCLA and Executive Director of the Center for Quantum Science and Engineering (CQSE). He specializes in the theory and simulation of solid-state quantum information devices, bridging computational modeling and experimental device design to advance scalable quantum hardware.',
  },
  {
    name: 'Felix Beaudoin',
    affiliation: 'Nanoacademic Technologies',
    title: 'CEO & Co-founder',
    image: '/images/Felix_Beaudoin.jpg',
    bio: 'Félix Beaudoin is a physicist and CEO of Nanoacademic Technologies, leading the development of QTCAD and other quantum-technology modeling tools. His work enables accurate simulation and design of qubits and quantum devices, spanning spin qubits, superconducting qubits, and topological systems.',
  },
  {
    name: 'Jens Koch',
    affiliation: 'Northwestern University',
    title: 'Associate Professor',
    image: '/images/Jens_Koch.jpeg',
    bio: 'Jens Koch is an Associate Professor of Physics at Northwestern University and co-inventor of the transmon qubit. His theoretical work on circuit QED and noise-protected qubits underpins much of modern superconducting quantum hardware.',
  },
  {
    name: 'Sadman Ahmed Shanto',
    affiliation: 'USC',
    title: 'PhD Candidate',
    image: '/images/Sadman_Shanto.jpeg',
    bio: 'Sadman Ahmed Shanto is a PhD candidate in physics at USC working on superconducting quantum hardware design and simulation. His research centers on developing new tools and techniques for designing high-coherence quantum devices.',
  },
  {
    name: 'Lukas Pahl',
    affiliation: 'MIT',
    title: 'PhD Student',
    image: '/images/Lukas_Pahl.jpg',
    bio: 'Lukas Pahl is a PhD student at MIT working on scalable superconducting quantum computing, improving qubit control, and quantum error correction. His research contributes to building the next generation of fault-tolerant quantum processors.',
  },
  {
    name: 'David Pahl',
    affiliation: 'MIT',
    title: 'PhD Student',
    image: '/images/David_Pahl.jpg',
    bio: 'David Pahl is a PhD student at MIT researching superconducting qubits and scalable quantum error-correction architectures. His work addresses key challenges in building reliable multi-qubit systems for fault-tolerant quantum computation.',
  },
  {
    name: 'Murat Can Sarihan',
    affiliation: 'Google Quantum AI',
    title: 'Research Scientist',
    image: '/images/Murat_Can_Sarihan.jpeg',
    bio: 'Murat Can Sarihan is a Research Scientist at Google Quantum AI focusing on superconducting qubit design and quantum error correction. His research contributes to Google\'s efforts to build large-scale, error-corrected quantum processors.',
  },
  {
    name: 'Michael Hatridge',
    affiliation: 'University of Pittsburgh',
    title: 'Associate Professor of Physics',
    image: '/images/Michael_Hatridge.png',
    bio: 'Michael Hatridge is an Associate Professor at the University of Pittsburgh whose research focuses on superconducting quantum circuits, quantum amplification, and the fundamentals of quantum measurement. His group develops Josephson parametric amplifiers and explores the physics of quantum backaction and feedback.',
  },
  {
    name: 'Ani Nersisyan',
    affiliation: 'Google Quantum AI',
    title: 'Research Scientist',
    image: '/images/Ani_Nersisyan.png',
    bio: 'Ani Nersisyan is a Research Scientist at Google Quantum AI working on superconducting qubit systems and scalable quantum computing hardware. Her contributions span qubit design, chip integration, and the engineering of high-performance quantum processors.',
  },
  {
    name: 'Nik Zhelev',
    affiliation: 'University of Oregon',
    title: 'Research Assistant Professor & Director of Quantum Technology Master\'s Internship Program',
    image: '/images/Nik Zhelev.png',
    bio: 'Nik Zhelev is a Research Assistant Professor at the University of Oregon\'s Materials Science Institute, affiliated with OMQ and the Physics department. He also serves as Director of the Quantum Technology Master\'s Internship Program. His research focuses on superconducting quantum circuits and quantum computing hardware.',
  },
  {
    name: 'Alice & Bob',
    affiliation: 'Alice & Bob',
    title: 'Quantum Computing Company',
    image: '/images/Alice-Bob.png',
    bio: 'Alice & Bob is a French quantum computing company pioneering the cat qubit: a superconducting qubit architecture with built-in error correction that dramatically reduces the overhead required for fault-tolerant quantum computing. Their approach leverages the natural noise bias of cat qubits to build hardware-efficient, error-corrected quantum processors, with a roadmap toward the first universal fault-tolerant quantum computer.',
    sponsored: true,
  },
];

export default function QDW2026Speakers() {
  const [selected, setSelected] = useState<Speaker | null>(null);
  const [search, setSearch] = useState('');

  const filtered = speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.affiliation.toLowerCase().includes(search.toLowerCase())
  );

  // Deduplicate by name (Jens Koch appeared twice in source data)
  const unique = filtered.filter(
    (s, i, arr) => arr.findIndex((t) => t.name === s.name) === i
  );

  return (
    <>
      <main className="min-h-screen">
        {/* Quick Navigation Bar */}
        <QDW2026Nav />

        {/* Hero */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-indigo-900/30" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-4">
                QDW 2026 &bull; June 15–18 &bull; UCLA
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Meet the{' '}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Speakers
                </span>
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                World-class researchers and engineers from leading quantum computing labs, universities, and industry.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or institution…"
                className="w-full pl-12 pr-4 py-3 bg-white/8 border border-white/20 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm [color-scheme:light]"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
        </section>

        {/* Speaker Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
              {unique.map((speaker, i) => (
                <motion.button
                  key={speaker.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 5) * 0.07 }}
                  onClick={() => setSelected(speaker)}
                  className="group flex flex-col items-center text-center focus:outline-none"
                >
                  <div className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 bg-gray-800 ${speaker.sponsored ? 'border-[#C0C0C0] group-hover:border-[#E8E8E8] group-hover:shadow-[0_0_24px_rgba(192,192,192,0.5)]' : 'border-white/10 group-hover:border-purple-400 group-hover:shadow-[0_0_24px_rgba(147,51,234,0.4)]'}`}>
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 text-white font-semibold text-sm leading-snug group-hover:text-purple-300 transition-colors duration-200">
                    {speaker.name}
                  </p>
                  <p className="text-purple-400 text-xs mt-0.5">{speaker.affiliation}</p>
                  {speaker.title && (
                    <p className="text-gray-500 text-xs mt-0.5 leading-tight">{speaker.title}</p>
                  )}
                </motion.button>
              ))}
            </div>

            {unique.length === 0 && (
              <p className="text-center text-gray-500 py-16">No speakers match your search.</p>
            )}
          </div>
        </section>

        {/* Bio Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                {/* Modal header gradient strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600" />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-purple-500/50 bg-gray-800">
                      <Image
                        src={selected.image}
                        alt={selected.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{selected.name}</h2>
                      {selected.title && (
                        <p className="text-purple-300 text-sm mt-1">{selected.title}</p>
                      )}
                      <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {selected.affiliation}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-gray-300 text-sm sm:text-base leading-relaxed">
                    {selected.bio}
                  </p>

                  <button
                    onClick={() => setSelected(null)}
                    className="mt-6 w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white font-semibold rounded-full py-2.5 text-sm transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="bg-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              Quantum Device Workshop 2026 &bull; Quantum Computing Student Association, UCLA
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <Link href="/qdw/2026/info" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Workshop Info</Link>
              <Link href="/qdw/2026/registration" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Register</Link>
              <Link href="/qdw/2026/faq" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">FAQ</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
