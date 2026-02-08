'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type RegistrationType =
  | 'student_in_person'
  | 'student_online'
  | 'professional_in_person'
  | 'professional_online';

export default function QDW2026Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    designation: '',
    location: '',

    registrationType: 'student_in_person' as RegistrationType,

    projectTitle: '',
    projectDescription: '',

    wantsQdcMembership: false,
    agreeToTerms: false,

    posterPdf: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setFormData(prev => ({ ...prev, posterPdf: null }));
      return;
    }

    // Basic validation: PDF only, max 15MB
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const maxBytes = 15 * 1024 * 1024;

    if (!isPdf) {
      setSubmitError('Poster must be a PDF file.');
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      setSubmitError('Poster PDF is too large (max 15MB).');
      e.target.value = '';
      return;
    }

    setSubmitError(null);
    setFormData(prev => ({ ...prev, posterPdf: file }));
  };

  // Upload poster PDF to /api/upload-poster (your existing route)
  const uploadPosterIfNeeded = async (): Promise<string> => {
    if (!formData.posterPdf) return '';

    const body = new FormData();
    body.append('file', formData.posterPdf);
    body.append('email', formData.email);

    const res = await fetch('/api/upload-poster', {
      method: 'POST',
      body,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Poster upload failed. ${txt}`);
    }

    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error('Poster upload failed (no URL returned).');
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (!formData.agreeToTerms) {
      setIsSubmitting(false);
      setSubmitError('You must agree to the Terms & Conditions to continue.');
      return;
    }

    try {
      // 1) Upload poster (optional)
      const posterUrl = await uploadPosterIfNeeded();

      // 2) Store registration data in sessionStorage (NOT saved to Supabase yet).
      //    Data will only be persisted to Supabase after successful Stripe payment
      //    via the webhook, so cancelling payment means nothing is saved.
      const registrationPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
        location: formData.location,
        registrationType: formData.registrationType,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        posterUrl,
        wantsQdcMembership: formData.wantsQdcMembership,
        agreeToTerms: formData.agreeToTerms,
      };

      sessionStorage.setItem('qdw_registration', JSON.stringify(registrationPayload));

      setIsSubmitted(true);

      // 3) Redirect to internal payment page with type/email
      const params = new URLSearchParams();
      params.set('type', formData.registrationType);
      params.set('email', formData.email);

      window.location.assign(`/qdw/2026/payment?${params.toString()}`);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong submitting your registration. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-gray-600 mb-8">Redirecting you to payment…</p>
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Getting Involved</h1>
              <p className="text-lg text-gray-600">
                The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art
                of designing quantum devices.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Join Now</h2>

              {submitError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration category */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Registration Type <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <select
                    id="registrationType"
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    required
                  >
                    <option value="student_in_person">Student — In Person</option>
                    <option value="student_online">Student — Online</option>
                    <option value="professional_in_person">Professional — In Person</option>
                    <option value="professional_online">Professional — Online</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Name <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="firstName" className="block text-xs text-gray-500 mb-1">
                        First Name
                      </label>
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
                      <label htmlFor="lastName" className="block text-xs text-gray-500 mb-1">
                        Last Name
                      </label>
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

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-1">
                    Password <span className="font-normal text-gray-500">(required, min 8 characters)</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    placeholder="Create a password for member access"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You'll use this password to access the member portal after payment
                  </p>
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-bold text-gray-900 mb-1">
                    Designation{' '}
                    <span className="font-normal text-gray-500 text-xs">
                      student (undergrad/grad), postdocs, professor, industry professional, other
                    </span>
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
      
                {/* Location */}
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

                {/* Project info */}
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Poster / Project (optional)</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="projectTitle" className="block text-sm font-bold text-gray-900 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        id="projectTitle"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="projectDescription" className="block text-sm font-bold text-gray-900 mb-1">
                        Project Description
                      </label>
                      <textarea
                        id="projectDescription"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                        placeholder="Briefly describe your poster/project (goals, methods, results, what you want feedback on)."
                      />
                    </div>

                    <div>
                      <label htmlFor="posterPdf" className="block text-sm font-bold text-gray-900 mb-1">
                        Poster PDF Upload
                        <span className="font-normal text-gray-500 text-xs"> (PDF, max 15MB)</span>
                      </label>
                      <input
                        type="file"
                        id="posterPdf"
                        name="posterPdf"
                        accept="application/pdf,.pdf"
                        onChange={handleFileChange}
                        className="mt-2 block w-full text-sm text-gray-700
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-purple-100 file:text-purple-700
                                   hover:file:bg-purple-200"
                      />
                      {formData.posterPdf && (
                        <p className="text-xs text-gray-500 mt-2">Selected: {formData.posterPdf.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* QDC membership */}
                <div className="pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="wantsQdcMembership"
                      checked={formData.wantsQdcMembership}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-purple-600"
                    />
                    <span className="text-sm text-gray-900">
                      I’d like to learn about becoming a member of <span className="font-semibold">QDC</span>.
                    </span>
                  </label>
                </div>

                {/* Terms */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-purple-600"
                      required
                    />
                    <span className="text-sm text-gray-900">
                      I agree to the{' '}
                      <a
                        href="/qdw/2026/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        Terms & Conditions
                      </a>
                      <span className="text-gray-500"> (required)</span>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-12 py-3 text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit & Continue to Payment'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center pt-2">
                  After submitting, you’ll be redirected to payment.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (unchanged) */}
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
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.791 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
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
    </>
  );
}