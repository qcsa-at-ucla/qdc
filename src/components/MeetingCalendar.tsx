'use client';

import { motion } from 'framer-motion';

interface MeetingCalendarProps {
  calendarUrl?: string;
}

const DEFAULT_CALENDAR_URL = 'https://calendar.google.com/calendar/embed?src=70e5c433011f8f8b954b98c30728ec1833d5e56a7fb0602ad097bf39a302f695%40group.calendar.google.com&ctz=Europe%2FBerlin';

export default function MeetingCalendar({ 
  calendarUrl 
}: MeetingCalendarProps) {
  // Use the provided URL or fall back to default
  const effectiveCalendarUrl = calendarUrl && calendarUrl.length > 0 ? calendarUrl : DEFAULT_CALENDAR_URL;
  const hasValidCalendar = effectiveCalendarUrl && effectiveCalendarUrl.length > 0;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Maintainer Meetings
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay up to date with our upcoming community meetings and events
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10"
        >
          {hasValidCalendar ? (
            <div className="relative w-full overflow-hidden rounded-xl">
              <iframe
                src={effectiveCalendarUrl}
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                className="w-full min-h-[400px] md:min-h-[600px] rounded-xl bg-white"
                title="QDC Maintainer Meetings Calendar"
                loading="lazy"
              />
            </div>
          ) : (
            // Placeholder when no calendar URL is configured
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Calendar Coming Soon
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Our maintainer meeting calendar will be displayed here. Check back soon for upcoming meeting schedules.
              </p>
              <div className="bg-white/5 rounded-lg p-4 max-w-lg mx-auto text-left">
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="text-gray-400">To add the calendar:</strong>
                </p>
                <ol className="text-sm text-gray-500 list-decimal list-inside space-y-1">
                  <li>Create a Google Calendar for maintainer meetings</li>
                  <li>Go to Calendar Settings → Integrate calendar</li>
                  <li>Copy the embed URL</li>
                  <li>Pass it as the <code className="text-indigo-400">calendarUrl</code> prop</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>

        {/* Meeting Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {/* Regular Meetings Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Regular Meetings</h3>
            <p className="text-gray-400 text-sm">
              Join our regular maintainer meetings to discuss project updates and roadmap.
            </p>
          </div>

          {/* How to Join Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">How to Join</h3>
            <p className="text-gray-400 text-sm">
              Meeting links are shared via our Discord. Join our community to get access by emailing quantum.ucla@gmail.com for now!
            </p>
          </div>

          {/* Open to All Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Open to All</h3>
            <p className="text-gray-400 text-sm">
              Our meetings are open to anyone interested in quantum device design and simulation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
