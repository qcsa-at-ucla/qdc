'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import QDW2026Nav from '@/components/QDW2026Nav';

type SessionType = 'lecture' | 'workshop' | 'break' | 'social' | 'meal' | 'panel' | 'talk' | 'project' | 'poster';

interface Session {
  title: string;
  type: SessionType;
  speaker?: string;
  company?: string;
}

interface TimeSlot {
  time: string;
  days: (Session | null)[];
}

const sessionStyles: Record<SessionType, string> = {
  lecture:  'bg-purple-900/40 border-purple-500/50 text-purple-100',
  workshop: 'bg-green-900/40 border-green-500/50 text-green-100',
  break:    'bg-gray-800/60 border-gray-600/40 text-gray-400',
  meal:     'bg-gray-800/60 border-gray-600/40 text-gray-400',
  social:   'bg-amber-900/40 border-amber-500/50 text-amber-100',
  panel:    'bg-indigo-900/40 border-indigo-500/50 text-indigo-100',
  talk:     'bg-cyan-900/40 border-cyan-500/50 text-cyan-100',
  project:  'bg-emerald-900/40 border-emerald-500/50 text-emerald-100',
  poster:   'bg-pink-900/40 border-pink-500/50 text-pink-100',
};

const sessionDotStyles: Record<SessionType, string> = {
  lecture:  'bg-purple-400',
  workshop: 'bg-green-400',
  break:    'bg-gray-500',
  meal:     'bg-gray-500',
  social:   'bg-amber-400',
  panel:    'bg-indigo-400',
  talk:     'bg-cyan-400',
  project:  'bg-emerald-400',
  poster:   'bg-pink-400',
};

const trainingSchedule: TimeSlot[] = [
  {
    time: '8:00 – 9:00 AM',
    days: [
      { title: 'Breakfast', type: 'meal', speaker: 'Intro-background (8:45)', company: 'Eli Levenson-Falk' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
    ],
  },
  {
    time: '9:00 – 9:45 AM',
    days: [
      { title: 'Intro to cQED', type: 'lecture', speaker: 'Zlatko Minev' },
      { title: 'Noise', type: 'lecture', speaker: 'Kyle Serniak' },
      { title: 'Circuit Analysis', type: 'lecture', speaker: 'Kevin O\'Brien' },
      { title: 'Intro to Design Project', type: 'lecture', speaker: 'Murat Can Sarihan' },
    ],
  },
  {
    time: '9:45 – 10:30 AM',
    days: [
      { title: 'Intro to Circuits', type: 'lecture', speaker: 'Aziza Almanakly' },
      { title: 'Circuit Simulation', type: 'lecture', speaker: 'Jens Koch' },
      { title: 'Circuit Analysis', type: 'lecture', speaker: 'David & Lukas Pahl' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '10:30 – 11:15 AM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '11:15 AM – 12:00 PM',
    days: [
      { title: 'Intro to Circuits Part 2', type: 'lecture', speaker: 'Nik Zhelev' },
      { title: 'Workshop – Circuit Analysis & Simulation', type: 'workshop' },
      { title: 'EM Quantum Analysis Techniques', type: 'lecture', speaker: 'Alp Sipahigil' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '12:00 – 1:30 PM',
    days: [
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
    ],
  },
  {
    time: '1:30 – 2:15 PM',
    days: [
      { title: 'Intro to Gates', type: 'lecture', speaker: 'Eli Levenson-Falk' },
      { title: 'EM Simulations – Classical', type: 'lecture', speaker: 'Sara Sussman' },
      { title: 'Workshop – EM & Circuit Analysis', type: 'workshop', speaker: 'TBD' },
      { title: 'Designing for Foundries', type: 'talk', speaker: 'Mollie Schwartz' },
    ],
  },
  {
    time: '2:15 – 3:00 PM',
    days: [
      { title: 'Intro to Readout', type: 'lecture', speaker: 'Daniel Sank' },
      { title: 'Workshop – EM Simulations', type: 'workshop', speaker: 'Sadman Shanto' },
      { title: 'Materials', type: 'lecture', speaker: 'Loren Alegria' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '3:00 – 3:30 PM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '3:30 – 4:15 PM',
    days: [
      { title: 'Intro to Layout', type: 'lecture', speaker: 'Murat Can Sarihan' },
      { title: 'Couplers & 2Q Gates', type: 'lecture', speaker: 'Michael Hatridge' },
      { title: 'Error Correction Basics', type: 'talk', speaker: 'Andreas Walraff' },
      { title: 'Nanoacademic', type: 'talk', speaker: 'TBC', company: 'Nanoacademic' },
    ],
  },
  {
    time: '4:15 – 5:00 PM',
    days: [
      { title: 'Workshop – Design & Layout', type: 'workshop' },
      { title: 'Workshop – Full Device Simulation', type: 'workshop', company: 'Synopsys / Qolab' },
      { title: 'Large Scale Quantum', type: 'talk', speaker: 'Reza Molavi' },
      { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Moderator)' },
    ],
  },
  {
    time: '5:00 – 6:00 PM',
    days: [
      { title: 'Poster Session', type: 'poster' },
      { title: 'Quantum Beers', type: 'social' },
      { title: 'Career Session', type: 'social' },
      { title: 'Panel & Reception', type: 'panel' },
    ],
  },
  {
    time: '',
    days: [
      null,
      null,
      null,
      { title: 'Reception', type: 'social' },
    ],
  },
];

const advancedSchedule: TimeSlot[] = [
  {
    time: '8:00 – 9:00 AM',
    days: [
      { title: 'Breakfast', type: 'meal', speaker: 'Intro-background (8:45)', company: 'Eli Levenson-Falk' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
    ],
  },
  {
    time: '9:00 – 9:45 AM',
    days: [
      { title: 'Ani Nersisyan', type: 'lecture', company: 'Google' },
      { title: 'Michael Hatridge', type: 'lecture', company: 'Univ. of Pittsburgh' },
      { title: 'Andreas Walraff', type: 'lecture', company: 'ETH Zurich' },
      { title: 'Yvonne Gao', type: 'lecture', company: 'NUS' },
    ],
  },
  {
    time: '9:45 – 10:30 AM',
    days: [
      { title: 'Shuhei Tamate', type: 'lecture', company: 'RIKEN' },
      { title: 'Jeff Grover', type: 'lecture', company: 'MIT' },
      { title: 'Aziza Almanakly', type: 'lecture', company: 'NYU' },
      { title: 'Mark Gyure', type: 'lecture', company: 'UCLA' },
    ],
  },
  {
    time: '10:30 – 11:15 AM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '11:15 AM – 12:00 PM',
    days: [
      { title: 'Ebrahim Forati', type: 'lecture', company: 'Google' },
      { title: 'Kyle Serniak', type: 'lecture', company: 'MIT Lincoln Lab' },
      { title: 'Anna Grassellino', type: 'lecture', company: 'Fermilab' },
      { title: 'Holly Stemp', type: 'lecture', company: 'MIT' },
    ],
  },
  {
    time: '12:00 – 1:30 PM',
    days: [
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
    ],
  },
  {
    time: '1:30 – 2:15 PM',
    days: [
      { title: 'Greg Peairs', type: 'talk', company: 'AWS' },
      { title: 'Kevin O\'Brien', type: 'lecture', company: 'MIT' },
      { title: 'Taylor Patti', type: 'talk', company: 'NVIDIA' },
      { title: 'Alice & Bob', type: 'talk', company: 'Alice & Bob' },
    ],
  },
  {
    time: '2:15 – 3:00 PM',
    days: [
      { title: 'Hugh Carson', type: 'talk', company: 'AWS' },
      { title: 'Wei Dai', type: 'lecture', company: 'Quantum Machines' },
      { title: 'Nicola Pancotti', type: 'talk', company: 'NVIDIA' },
      { title: 'Nanoacademic', type: 'talk', company: 'Nanoacademic' },
    ],
  },
  {
    time: '3:00 – 3:30 PM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '3:30 – 4:15 PM',
    days: [
      { title: 'Rigetti', type: 'talk', company: 'Rigetti' },
      { title: 'Rigetti', type: 'talk', company: 'Rigetti' },
      { title: 'Sadman Ahmed Shanto', type: 'lecture', company: 'USC' },
      { title: 'Quantum Design', type: 'talk', speaker: 'TBA' },
    ],
  },
  {
    time: '4:15 – 5:00 PM',
    days: [
      { title: 'Silvia Zorzetti', type: 'lecture', company: 'Fermilab' },
      { title: 'Joseph Glick', type: 'talk', company: 'QBlox' },
      { title: 'Taekwan Yoon', type: 'talk', company: 'Zurich Instruments' },
      { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Moderator, begin 4:30)' },
    ],
  },
  {
    time: '5:00 – 6:00 PM',
    days: [
      { title: 'Poster Session', type: 'poster' },
      { title: 'Quantum Beers', type: 'social' },
      { title: 'Breakout: Business\n(Panel + Talk + Mini Workshop)', type: 'panel' },
      { title: 'Panel & Reception', type: 'panel' },
    ],
  },
  {
    time: '',
    days: [
      null,
      null,
      { title: 'QDC', type: 'social' },
      { title: 'Reception', type: 'social' },
    ],
  },
];

const days = ['Day 1\nJune 15', 'Day 2\nJune 16', 'Day 3\nJune 17', 'Day 4\nJune 18'];

const legend: { type: SessionType; label: string }[] = [
  { type: 'lecture',  label: 'Lecture' },
  { type: 'workshop', label: 'Workshop' },
  { type: 'talk',     label: 'Industry Talk' },
  { type: 'panel',    label: 'Panel / Event' },
  { type: 'project',  label: 'Design Project' },
  { type: 'poster',   label: 'Poster Session' },
  { type: 'social',   label: 'Social / Networking' },
  { type: 'break',    label: 'Break / Meal' },
];

function SessionCell({ session }: { session: Session | null }) {
  if (!session) return <div className="h-full min-h-[60px]" />;

  const styles = sessionStyles[session.type];
  const dot = sessionDotStyles[session.type];

  return (
    <div className={`rounded-xl border px-3 py-2 h-full min-h-[64px] flex flex-col justify-center gap-0.5 ${styles}`}>
      <div className="flex items-start gap-1.5">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-xs sm:text-sm font-semibold leading-snug whitespace-pre-line">{session.title}</span>
      </div>
      {session.speaker && (
        <p className="text-[10px] sm:text-xs opacity-70 pl-3">{session.speaker}</p>
      )}
      {session.company && (
        <p className="text-[10px] sm:text-xs opacity-60 pl-3 italic">{session.company}</p>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const [track, setTrack] = useState<'training' | 'advanced'>('training');
  const schedule = track === 'training' ? trainingSchedule : advancedSchedule;

  return (
    <>
      <main className="min-h-screen bg-[#05050f]">
        <QDW2026Nav />

        {/* Hero */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-transparent to-indigo-950/30 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3">
                Quantum Device Workshop
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ textShadow: '0 0 40px rgba(147,51,234,0.3)' }}
              >
                QDW 2026 Schedule
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                June 15–18 &nbsp;·&nbsp; Cohen Room & Mong Auditorium &nbsp;·&nbsp; UCLA
              </p>
            </motion.div>

            {/* Track Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center mb-10"
            >
              <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
                <button
                  onClick={() => setTrack('training')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    track === 'training'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Training Track
                </button>
                <button
                  onClick={() => setTrack('advanced')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    track === 'advanced'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Advanced Track
                </button>
              </div>
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {legend.map(({ type, label }) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sessionDotStyles[type]}`} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Schedule Grid */}
            <motion.div
              key={track}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="overflow-x-auto rounded-2xl border border-white/10"
            >
              <div className="min-w-[700px]">
                {/* Header Row */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] bg-white/5 border-b border-white/10">
                  <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </div>
                  {days.map((day, i) => (
                    <div key={i} className="px-3 py-3 text-center">
                      <p className={`text-xs font-bold uppercase tracking-wider whitespace-pre-line ${
                        track === 'training' ? 'text-green-400' : 'text-purple-400'
                      }`}>
                        {day}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {schedule.map((slot, rowIdx) => {
                  const isBreakRow = slot.days.every(d => d?.type === 'break' || d?.type === 'meal' || d === null);
                  return (
                    <motion.div
                      key={rowIdx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: rowIdx * 0.03 }}
                      className={`grid grid-cols-[140px_1fr_1fr_1fr_1fr] border-b border-white/5 ${
                        isBreakRow ? 'bg-white/[0.02]' : 'bg-transparent hover:bg-white/[0.03] transition-colors'
                      }`}
                    >
                      <div className="px-4 py-3 flex items-center">
                        <span className={`text-[11px] font-medium leading-snug ${
                          slot.time ? 'text-gray-400' : 'text-transparent'
                        }`}>
                          {slot.time || '—'}
                        </span>
                      </div>
                      {slot.days.map((session, colIdx) => (
                        <div key={colIdx} className="px-2 py-2">
                          <SessionCell session={session} />
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center text-gray-600 text-xs mt-6"
            >
              Schedule subject to change. All times Pacific Time (PT). Both tracks share the same venue.
            </motion.p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 px-4 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Quantum Computing Science Association — QDW 2026
          </p>
        </footer>
      </main>
    </>
  );
}
