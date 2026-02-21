'use client';

import Link from 'next/link';

export default function WaitingApprovalPage() {
  return (
    <main className="min-h-screen bg-white pt-20">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Registration Submitted!
          </h1>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mb-6">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-semibold text-yellow-800">Pending Admin Approval</span>
          </div>

          {/* Main Message */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What happens next?
            </h2>
            <div className="text-left space-y-4 text-gray-700">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">We're reviewing your registration</p>
                  <p className="text-sm">Our admin team will verify your student status using the ID you provided.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">You'll receive an email</p>
                  <p className="text-sm">Once approved, we'll send you an email with a secure payment link to complete your registration.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Complete payment</p>
                  <p className="text-sm">Click the link in the email to pay with your verified student email address.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start">
              <svg 
                className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review typically takes 1-2 business days</li>
                  <li>Check your email (including spam folder) for the approval notification</li>
                  <li>Your registration is saved and secured</li>
                  <li>You will NOT be charged until after approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/qdw/2026/info"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 hover:scale-105"
            >
              Learn More About QDW
            </Link>
            <Link
              href="/"
              className="inline-block bg-white hover:bg-gray-50 text-purple-600 font-semibold rounded-full px-8 py-3 border-2 border-purple-500 transition-all duration-200 hover:scale-105"
            >
              Back to Homepage
            </Link>
          </div>

          {/* Questions */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Have questions about your registration?</p>
            <Link
              href="/contact"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
