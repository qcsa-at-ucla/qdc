import Link from 'next/link';

export default function JoinPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Join the Quantum Device Consortium</h1>
        <p className="text-xl sm:text-2xl text-gray-700 mb-8">
          Ready to be part of the quantum device design and simulation community? Choose how you&apos;d like to connect with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdIjYlL-Bc9mDbAtzYaoFJJMZwLFPZx048jhwuIz_rvDkCbrw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            Member Interest Form
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
