import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Privacy Policy | Quantum Device Consortium',
  description: 'Privacy Policy for the Quantum Device Consortium and Quantum Device Workshop.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#090714] text-neutral-200 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-neutral-400 text-sm mb-10">Last updated: May 27, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p className="text-neutral-300 leading-relaxed">
              The Quantum Device Consortium (&quot;QDC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the QDC website and the Quantum Device Workshop (&quot;QDW&quot;) event platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or register for our events.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="text-neutral-300 leading-relaxed mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 leading-relaxed">
              <li><strong className="text-white">Personal identification information</strong> — name, email address, institution, and designation when you register for an event or join our organization.</li>
              <li><strong className="text-white">Academic and professional information</strong> — student ID, CV/resume, and poster submissions provided during the registration or verification process.</li>
              <li><strong className="text-white">Payment information</strong> — processed securely through Stripe; we do not store full card numbers.</li>
              <li><strong className="text-white">Usage data</strong> — pages visited, browser type, and IP address collected automatically for analytics and security purposes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 leading-relaxed">
              <li>To process event registrations and membership applications.</li>
              <li>To verify student or professional status.</li>
              <li>To send event-related communications and updates.</li>
              <li>To improve our website and services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">4. Sharing of Information</h2>
            <p className="text-neutral-300 leading-relaxed">
              We do not sell or rent your personal information. We may share information with trusted third-party service providers (such as Stripe for payment processing and Supabase for data storage) solely to operate our services, under strict confidentiality agreements. We may also disclose information if required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p className="text-neutral-300 leading-relaxed">
              We retain personal data only for as long as necessary to fulfill the purposes described in this policy, or as required by law. You may request deletion of your data by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">6. Security</h2>
            <p className="text-neutral-300 leading-relaxed">
              We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="text-neutral-300 leading-relaxed">
              Depending on your location, you may have rights to access, correct, or delete your personal data. To exercise these rights, please contact us at the email below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Links</h2>
            <p className="text-neutral-300 leading-relaxed">
              Our website may contain links to third-party sites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us via the{' '}
              <Link href="/contact" className="text-cyan-400 hover:underline">
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
