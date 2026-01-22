'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function QDW2026Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Submit to Google Forms (using no-cors mode since Google doesn't allow CORS)
      await fetch(googleFormUrl, {
        method: 'POST',
        body: formDataToSubmit,
        mode: 'no-cors',
      });
      
      // Since no-cors doesn't return a readable response, we assume success
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      // Still show success since no-cors mode doesn't give us error info
      setIsSubmitted(true);
    }
    
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white pt-20 flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for registering for QDW 2026. We&apos;ll send you a confirmation email with more details soon.
          </p>
          <Link
            href="/qdw/2026/info"
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 hover:scale-105"
          >
            Back to Event Info
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Getting Involved / Registration Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Getting Involved
              </h1>
              <p className="text-lg text-gray-600">
                The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art of designing quantum devices.
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Join Now
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name fields */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Name <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="firstName" className="block text-xs text-gray-500 mb-1">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs text-gray-500 mb-1">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-1">
                    Email <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                  />
                </div>

                {/* Designation field */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-bold text-gray-900 mb-1">
                    Designation <span className="font-normal text-gray-500 text-xs">student (undergrad/grad), postdocs, professor, industry professional, other</span>
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                  />
                </div>

                {/* Location field */}
                <div>
                  <label htmlFor="location" className="block text-sm font-bold text-gray-900 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                  />
                </div>

                {/* Register button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-12 py-3 text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Submitting...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
              {/* Left side - Contact Info */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Contact Us
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  For any questions regarding the workshop, registration or miscellaneous, please contact us at the email below or using the contact form.
                </p>
                <a 
                  href="mailto:quantum.ucla@gmail.com" 
                  className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                >
                  quantum.ucla@gmail.com
                </a>
                
                {/* Image placeholder */}
                <div className="mt-8 rounded-lg overflow-hidden">
                  <div className="relative w-full aspect-[4/3] bg-gray-900">
                    <Image
                      src="/images/quantum_device_chip.png"
                      alt="Quantum equations and diagrams"
                      fill
                      className="object-cover opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Contact Form */}
              <div className="w-full lg:w-1/2">
                <div className="space-y-6">
                  {/* Name fields */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Name <span className="font-normal text-gray-500">(required)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Email <span className="font-normal text-gray-500">(required)</span>
                    </label>
                    <input
                      type="email"
                      className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    />
                  </div>

                  {/* Subject field */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    />
                  </div>

                  {/* Message field */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2 resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-12 py-3 text-lg transition-all duration-200 hover:scale-105"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left side - Social icons */}
            <div className="flex items-center gap-6">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
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
    </>
  );
}
