'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import QDW2026Nav from '@/components/QDW2026Nav';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  major: string;
  year: string;
  bio: string;
  image: string;
  linkedIn: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Victor Yu",
    role: "President",
    major: "Electrical Engineering",
    year: "2nd Year",
    bio: "Victor is a second year at UCLA studying Electrical Engineering with a minor in Mathematics. He works in the Petta Group to model the effects of cosmic rays on semiconductor spin qubits and to perform automated tune-up of quantum dot systems. He enjoys teaching others about quantum science, such as through QCSA's involvement in ACM Quantum. In his free time, he enjoys playing the piano, reading fantasy & science fiction, eating good food, and calisthenics.",
    image: "/images/Victor Yu.png",
    linkedIn: "https://www.linkedin.com/in/victoryu0/",
  },
  {
    id: 2,
    name: "Alexander Jürgens",
    role: "President",
    major: "EECS",
    year: "PhD Student",
    bio: "Alex is an EECS PhD student at the Narang Lab. He completed his BSc in Physics and MSc in Quantum Engineering at ETH Zürich in Switzerland and worked at IBM and the German Aerospace Center before joining UCLA in 2024. In his research, Alexander focuses on Quantum Algorithms and Learning Theory as well as optimization techniques and Machine Learning. On the rare occasion that he quantum tunnels outside the office he enjoys water sports, Brazilian Jiu Jitsu and all things Italian in nature.",
    image: "/images/alexander Jurgens.png",
    linkedIn: "https://www.linkedin.com/in/alexander-jurgens/",
  },
  {
    id: 3,
    name: "Ilaana Khan",
    role: "President",
    major: "Physics",
    year: "2nd Year",
    bio: "Ilaana is an undergraduate at UCLA studying Biophysics and on the QCSA leadership board. She is involved in the research of computational fluid dynamics to model blood vessels, talent development via mixed-methods psychology, and modeling distant stars in the Milky Way galaxy. Ilaana has previously worked with the American Cancer Society, ACM, City of Austin Law Department, Society of Robotic Surgeons, and Ascension Seton Medical Center in Austin. At UCLA, Ilaana is an editor at the Society and Genetics Research Journal and co-manager of the Upsilon Lab CFD group. She is also a nationally registered Emergency Medical Technician. Outside of her academic involvements, Ilaana loves Roblox, Minecraft, and caffeine.",
    image: "/images/Ilaana.png",
    linkedIn: "https://www.linkedin.com/in/ilaanak/",
  },
  {
    id: 4,
    name: "Nicolas Dirnegger",
    role: "Quantum Devices",
    major: "Electrical Engineering",
    year: "PhD Student",
    bio: "Nicolas received a Bachelor of Science in Electrical Engineering at ETH Zurich, Switzerland in 2022 and a Master of Science in Physics at the University of California, Los Angeles in 2023. He is currently pursuing a PhD in Electrical Engineering in the NarangLab. Currently, his main research focus is on quantum sensing and quantum networks. He also has research interests in quantum error correction and quantum computation. Feel free to reach out if you want to go surfing!",
    image: "/images/Nicolas Dirnegger.png",
    linkedIn: "https://www.linkedin.com/in/nicolas-dirnegger-aa8442100/",
  },
  {
    id: 5,
    name: "Cody Fan",
    role: "Quantum Devices",
    major: "EE & Physics",
    year: "PhD Student",
    bio: "Cody received a double Bachelor of Science in Electrical Engineering and Physics from UCLA and a Masters of Science in Electrical Engineering from UCLA with a Distinguished Masters Thesis Award. He is currently pursuing a PhD at the Mesoscopic Optics and Quantum Electronics Lab as an NSF Graduate Research Fellow. Currently, his main research focus is on superconducting bosonic qubits and silicon color centers. Before starting graduate school, he interned at Stanford Research Institute as a Quantum Machine Learning Intern. In his free time, he enjoys producing music, cooking, fashion, and raving.",
    image: "/images/Cody Fan.png",
    linkedIn: "https://www.linkedin.com/in/cody-fan-09717a167/",
  },
  {
    id: 6,
    name: "Samuel Oh",
    role: "Finances",
    major: "Computer Science & Economics",
    year: "3rd Year",
    bio: "Samuel is a 3rd-year Computer Science and Economics student at UCLA. He serves as Sector Head at Bruin Capital Management and is actively involved in multiple finance organizations on campus. Samuel previously served 18 months in the Republic of Korea Army, where he worked in Korean-English interpretation and military logistics. His past experiences also include internships in corporate finance and consulting. After graduation, he hopes to pursue a career in the finance industry.",
    image: "/images/Samuel.png",
    linkedIn: "https://www.linkedin.com/in/samuel-oh-ucla/",
  },
  {
    id: 7,
    name: "Sanskriti Shindadkar",
    role: "Research Lead",
    major: "Bioengineering",
    year: "4th Year",
    bio: "Sanskriti is a fourth year undergraduate bioengineering student at UCLA. She enjoys exploring quantum computing for chemistry and biological applications. She has previously led the industry collaboration with QCSA, BruinAI, and Fetch.ai to explore the use of hybrid quantum-CNNs for predicting protein-ligand binding energies. She loves hearing about projects other people are working on and are excited about, so contact her any time to chat over lunch :)",
    image: "/images/sanskriti.png",
    linkedIn: "https://www.linkedin.com/in/sanskriti/",
  },
  {
    id: 10,
    name: "Connor Engel",
    role: "Events & Advertisement",
    major: "Physics",
    year: "3rd Year",
    bio: "Connor is a third-year undergraduate student majoring in Physics. He currently works as a research assistant in Professor Qianhui Shi's laboratory, where he contributes to condensed matter physics. Connor is passionate about exploring the fundamental principles of physics and is particularly fascinated by the potential of photonics in advancing quantum computing technologies. He also has an adorable dog who is terrified of Connor getting weird ideas about boxes and superpositions.",
    image: "/images/Connor.png",
    linkedIn: "https://www.linkedin.com/in/connor-engel-492216254/",
  },
  {
    id: 12,
    name: "Clyde Villacrusis",
    role: "Web Developer Tech Lead",
    major: "Computer Science",
    year: "4th Year",
    bio: "Helloo!! Clyde Villacrusis is an undergraduate 4th year Computer Science and Linguistics double major. He is apart of the QCSA's tech team and working on making an interactive and accessible website for all. He is extremely excited to learn more about Quantum Computing while also developing his tech skills. Besides QCSA, he also interned under UCLA Health to make their AI-powered application (still in progress) and he is also in fetch.ai x qcsa x bruin.ai research group to research more about predicting binding affinities using hybrid CNNs, traditional Machine learning modes, and quantum circuits! He also likes to play Valorant, Minecraft, nature, and caffeine. Hit him up anytime to learn or just to chat about anything!",
    image: "/images/clyde.png",
    linkedIn: "https://www.linkedin.com/in/clydevillacrusis/",
  },
  {
    id: 13,
    name: "Dibyesh Ganguly",
    role: "Web Developer Tech Lead",
    major: "Computer Science and Engineering",
    year: "2nd Year",
    bio: "Dibyesh is a sophomore at UCLA, majoring in Computer Science and Engineering and Pure Mathematics, where he primarily conducts research in High-energy QCD analyses at the Kang Research Group, with additional interests in quantum simulation and physics-driven machine learning for large-scale scientific modelling. Outside of the lab, he competes on UCLA's Archery team, is active in IEEE at UCLA, and is a big coaster and aviation enthusiast!",
    image: "/images/dibyesh.jpg",
    linkedIn: "https://www.linkedin.com/in/dibyeshganguly/",
  },
  // {
  //   id: 19,
  //   name: "Emma Zhang",
  //   role: "Web Developer",
  //   major: "Computer Science",
  //   year: "2nd Year",
  //   bio: "Emma is a second year undergraduate Computer Science student at UCLA with an interest in software development and AI. In her free time, she enjoys playing volleyball, visiting cafes, and learning Japanese.",
  //   image: "/images/emma.png",
  //   linkedIn: "https://www.linkedin.com/in/emma-zhang-511838245/",
  // },
  {
    id: 20,
    name: "Dhruv Saran",
    role: "Web Developer",
    major: "Computer Science",
    year: "3rd Year",
    bio: "Dhruv is a junior Computer Science student at UCLA with interests in software engineering, machine learning, and systems, and is actively involved in physics research, tutoring through Upsilon Pi Epsilon @ UCLA, and building impactful full-stack and AI projects.",
    image: "/images/dhruv.png",
    linkedIn: "https://www.linkedin.com/in/dhruv-saran/",
  },
  {
    id: 14,
    name: "Kimberley Wu",
    role: "Designer",
    major: "Design Media Arts and Psychology",
    year: "2nd Year",
    bio: "Kimberley is a second-year undergraduate studying Design Media Arts and Psychology. She is part of QCSA's design team, creating engaging websites and developing their visual branding. She is excited to learn more about quantum science while building her design skills. Kimberley previously interned in communications at BOUSD and is currently involved in Daily Bruin, BruinLife, Adobe Creatives, and Stratist Prep. In her free time, she enjoys spontaneous side-quests, playing tennis, photography, and sketch-booking.",
    image: "/images/kimberley.png",
    linkedIn: "https://www.linkedin.com/in/kimberleywu/",
  },
  {
    id: 15,
    name: "Gina Namkung",
    role: "Designer",
    major: "Cognitive Science and Architecture",
    year: "2nd Year",
    bio: "Gina is a second year undergraduate Cognitive Science and Architecture student at UCLA. She is a part of the QCSA's design team and eager to create an intuitive and immersive website experience for all. Gina is passionate about learning more about the art of quantum while developing design skills. At UCLA Gina is involved in the Data-Graphics section of the Daily Bruin, secretary for the American Institute of Architecture Students, and worked as a designer for a journaling app called Rose Garden. In her free time you can find her exploring LA for new thrift finds and cafes.",
    image: "/images/gina.png",
    linkedIn: "https://www.linkedin.com/in/gina-namkung/",
  },
  {
    id: 17,
    name: "Matt Guibord",
    role: "Events & Advertisement",
    major: "Electrical Engineering",
    year: "PhD",
    bio: "Matt is an Electrical Engineering PhD student at UCLA researching quantum-limited cavity optomechanics in the Mesoscopic Optics and Quantum Electronics Laboratory. Before joining UCLA, he received his B.S. in Electrical and Computer Engineering from UIUC, where he explored the intersection of NV centers and plasmonics. Matt has previously studied distributed computing at Northrop Grumman and superconducting qubit packaging at Applied Materials. Outside of the lab, he loves to cycle, produce music, and jam on his sax.",
    image: "/images/matt.JPG",
    linkedIn: "https://www.linkedin.com/in/matthew-guibord/",
  },
  {
    id: 21,
    name: "Charles Victorio",
    role: "Video Producer & Social Media Manager",
    major: "Physics",
    year: "3rd Year",
    bio: "Charles is a third-year undergraduate Physics student at UCLA. He runs the QCSA YouTube channel and social media accounts, leads the muon detector research project under Upsilon Lab, and works as an administrative assistant and data analyst in the Division of Physical Sciences at UCLA.",
    image: "/images/charles.png",
    linkedIn: "https://www.linkedin.com/in/charles-victorio/",
  },
];

export default function QDW2026Team() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useState(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }
  });

  const handleMemberClick = (member: TeamMember) => {
    if (isMobile) {
      setSelectedMember(member);
    } else {
      window.open(member.linkedIn, '_blank', 'noopener,noreferrer');
    }
  };

  return (
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
                Team
              </span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              The dedicated students and researchers behind QDW 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className={`relative group cursor-pointer ${hoveredMember === member.id ? 'z-50' : 'z-0'}`}
                onMouseEnter={() => !isMobile && setHoveredMember(member.id)}
                onMouseLeave={() => !isMobile && setHoveredMember(null)}
                onClick={() => handleMemberClick(member)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.5 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:bg-white/10">
                  <div className="w-full h-64 bg-gray-800 flex items-center justify-center overflow-hidden relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {isMobile && (
                      <button
                        className="absolute top-2 right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:bg-purple-700 transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(member.linkedIn, '_blank', 'noopener,noreferrer');
                        }}
                        aria-label={`View ${member.name}'s LinkedIn profile`}
                      >
                        in
                      </button>
                    )}
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-base text-white mb-1">{member.name}</h3>
                    <p className="text-purple-400 font-medium text-sm mb-1">{member.role}</p>
                    <p className="text-gray-400 text-xs">{member.major} &bull; {member.year}</p>
                  </div>
                </div>

                {/* Desktop hover popup */}
                {!isMobile && hoveredMember === member.id && (
                  <div className="absolute z-50 top-0 left-0 w-80 bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl p-5 transform -translate-x-2 -translate-y-2">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm mb-0.5">{member.name}</h3>
                        <p className="text-purple-400 text-xs font-medium mb-0.5">{member.role}</p>
                        <p className="text-gray-400 text-xs mb-3">{member.major} &bull; {member.year}</p>
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-5">{member.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile bio modal */}
      {isMobile && selectedMember && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedMember(null)}
          style={{ backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 border border-purple-500/30 rounded-xl max-w-md w-full max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 id="modal-title" className="font-bold text-white text-base mb-0.5">{selectedMember.name}</h3>
                  <p className="text-purple-400 text-sm font-medium mb-0.5">{selectedMember.role}</p>
                  <p className="text-gray-400 text-xs">{selectedMember.major} &bull; {selectedMember.year}</p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 rounded p-1 transition-colors flex-shrink-0"
                onClick={() => setSelectedMember(null)}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedMember.bio}</p>
            <div className="mt-5 flex justify-center">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                onClick={() => window.open(selectedMember.linkedIn, '_blank', 'noopener,noreferrer')}
              >
                View LinkedIn Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
