'use client';

import AnimatedSection from "./AnimatedSection";

export default function AnnouncementBanner() {
  return (
    <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 text-center">
        <AnimatedSection direction="fade">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3">
            PhD and Postdoctoral Positions in Superconducting Quantum Technologies
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4">
            Applications are invited for research positions in a €1M project developing
            advanced numerical methods for the modeling and optimization of
            superconducting quantum devices.
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-7">
            Department of Industrial Engineering • University of Padova, Italy • Positions opening 2026–2029
          </p>

          <div className="flex justify-center">
            <a
              href="https://linkedin.com/posts/quantum-computing-student-association-ucla_open-phd-postdoc-positions-superconducting-activity-7435725364238262272-ZVvW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-base px-7 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            >
              View Full Announcement
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14M5 5v14h14"/>
              </svg>
            </a>
          </div>

        </AnimatedSection>

      </div>
    </section>
  );
}