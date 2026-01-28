'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function QDW2026Terms() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 pt-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-600">
              Quantum Device Workshop 2026
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="prose prose-gray max-w-none"
          >
            {/* Section 1 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By registering for the Quantum Device Workshop 2026 (&quot;QDW 2026&quot; or &quot;the Workshop&quot;), 
                you agree to be bound by these Terms & Conditions. If you do not agree to these terms, 
                please do not complete your registration.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Registration and Fees</h2>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>Registration fees are non-refundable unless the Workshop is cancelled by the organizers.</li>
                <li>Registration is confirmed only upon receipt of full payment.</li>
                <li>The organizers reserve the right to cancel registrations if payment is not received within the specified timeframe.</li>
                <li>Fee waivers may be available upon request. Please contact quantum.ucla@gmail.com for more information.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Workshop Format</h2>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>The Workshop will be held from June 15-18, 2026 at UCLA.</li>
                <li>Both in-person and online participation options are available.</li>
                <li>The organizers reserve the right to modify the schedule, speakers, or format as necessary.</li>
                <li>Lectures will be recorded and made available to registered participants.</li>
                <li>Hands-on workshop materials will be provided for the duration of the workshop period.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Code of Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All participants are expected to:
              </p>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>Treat all participants, speakers, and organizers with respect and professionalism.</li>
                <li>Refrain from any form of harassment, discrimination, or disruptive behavior.</li>
                <li>Follow all instructions from Workshop staff and venue security.</li>
                <li>Respect intellectual property rights and not share workshop materials without permission.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                The organizers reserve the right to remove any participant who violates the code of conduct 
                without refund.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>All workshop materials, including presentations, code, and documentation, are the intellectual property of their respective owners.</li>
                <li>Participants may use workshop materials for personal educational purposes only.</li>
                <li>Redistribution or commercial use of workshop materials is prohibited without explicit written permission.</li>
                <li>If you submit a poster or project, you retain ownership of your work but grant the organizers permission to display it during the Workshop.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Photography and Recording</h2>
              <p className="text-gray-600 leading-relaxed">
                By attending the Workshop in person, you consent to being photographed or recorded. 
                These materials may be used for promotional purposes, social media, and future Workshop 
                announcements. If you do not wish to be photographed, please notify the organizers in advance.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Liability</h2>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>The organizers are not responsible for any personal injury, loss, or damage to property during the Workshop.</li>
                <li>Participants are responsible for their own travel arrangements, accommodation, and insurance.</li>
                <li>The organizers are not liable for any technical issues that may affect online participation.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your personal information will be collected and used for the following purposes:
              </p>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>Processing your registration and payment.</li>
                <li>Communicating workshop-related information.</li>
                <li>Providing access to workshop materials and resources.</li>
                <li>If you opt-in, sharing information about QDC membership opportunities.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We will not sell or share your personal information with third parties for marketing purposes 
                without your explicit consent.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Cancellation Policy</h2>
              <ul className="list-disc ml-6 text-gray-600 space-y-2">
                <li>If the Workshop is cancelled by the organizers, all registration fees will be fully refunded.</li>
                <li>If the Workshop is moved to an online-only format, in-person registrants will receive a partial refund for the difference in registration fees.</li>
                <li>Participant cancellations are generally non-refundable, but requests may be considered on a case-by-case basis.</li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                The organizers reserve the right to update these Terms & Conditions at any time. 
                Participants will be notified of any significant changes via email. Continued participation 
                in the Workshop constitutes acceptance of the updated terms.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions or concerns regarding these Terms & Conditions, please contact us at:
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:quantum.ucla@gmail.com" className="text-purple-600 hover:underline">
                  quantum.ucla@gmail.com
                </a>
              </p>
            </div>

            {/* Back button */}
            <div className="pt-8 text-center">
              <Link
                href="/qdw/2026/registration"
                className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 hover:scale-105"
              >
                Back to Registration
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>

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
  );
}
