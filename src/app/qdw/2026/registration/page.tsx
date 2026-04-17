'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import QDW2026Nav from '@/components/QDW2026Nav';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

type RegistrationType =
  | 'student_in_person'
  | 'student_online'
  | 'professional_in_person'
  | 'professional_online';

// Valid countries list (excluding restricted countries: Cuba, North Korea, Syria, Iraq, Iran, Somalia, South Sudan, Venezuela, Pakistan, China)
const VALID_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia',
  'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
  'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Inner component that uses useSearchParams
function RegistrationContent() {
  const searchParams = useSearchParams();
  const reuploadMode = searchParams.get('reupload') === 'true';
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    location: '',

    registrationType: 'student_in_person' as RegistrationType,

    projectTitle: '',
    projectDescription: '',

    wantsQdcMembership: false,
    agreeToTerms: false,

    dietaryRestriction: '',
    dietaryRestrictionOther: '',

    cvPdf: null as File | null,
    posterPdf: null as File | null,
    studentIdPhoto: null as File | null,
  });

  // Helper to check if current registration type is student
  const isStudentRegistration = formData.registrationType === 'student_in_person' || 
                                 formData.registrationType === 'student_online';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Student ID reupload states
  const [showReuploadLogin, setShowReuploadLogin] = useState(false);
  const [reuploadEmail, setReuploadEmail] = useState('');
  const [reuploadPassword, setReuploadPassword] = useState('');
  const [reuploadAuthenticated, setReuploadAuthenticated] = useState(false);
  const [reuploadUser, setReuploadUser] = useState<any>(null);
  const [reuploadError, setReuploadError] = useState('');
  const [reuploadLoading, setReuploadLoading] = useState(false);
  const [newStudentIdFile, setNewStudentIdFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Check if we're in reupload mode on mount
  useEffect(() => {
    if (reuploadMode) {
      setShowReuploadLogin(true);
      if (emailParam) {
        setReuploadEmail(emailParam);
      }
    }
  }, [reuploadMode, emailParam]);

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

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setFormData(prev => ({ ...prev, cvPdf: null }));
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const maxBytes = 15 * 1024 * 1024;

    if (!isPdf) {
      setSubmitError('CV must be a PDF file.');
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      setSubmitError('CV PDF is too large (max 15MB).');
      e.target.value = '';
      return;
    }

    setSubmitError(null);
    setFormData(prev => ({ ...prev, cvPdf: file }));
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

  const handleStudentIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setFormData(prev => ({ ...prev, studentIdPhoto: null }));
      return;
    }

    // Basic validation: images only, max 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const isImage = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const maxBytes = 5 * 1024 * 1024;

    if (!isImage) {
      setSubmitError('Student ID must be an image file (JPG, PNG, or WebP).');
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      setSubmitError('Student ID photo is too large (max 5MB).');
      e.target.value = '';
      return;
    }

    setSubmitError(null);
    setFormData(prev => ({ ...prev, studentIdPhoto: file }));
  };

  // Handler for student ID reupload file change
  const handleReuploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setNewStudentIdFile(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const isImage = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const maxBytes = 5 * 1024 * 1024;

    if (!isImage) {
      setReuploadError('Student ID must be an image file (JPG, PNG, or WebP).');
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      setReuploadError('Student ID photo is too large (max 5MB).');
      e.target.value = '';
      return;
    }

    setReuploadError('');
    setNewStudentIdFile(file);
  };

  // Handle reupload login
  const handleReuploadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setReuploadLoading(true);
    setReuploadError('');

    try {
      const response = await fetch('/api/qdw/verify-student-reupload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reuploadEmail, password: reuploadPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setReuploadAuthenticated(true);
        setReuploadUser(data.user);
      } else {
        setReuploadError(data.error || 'Login failed. Please check your email and password.');
      }
    } catch (err) {
      setReuploadError('An error occurred. Please try again.');
    } finally {
      setReuploadLoading(false);
    }
  };

  // Handle student ID reupload submission
  const handleReuploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudentIdFile) {
      setReuploadError('Please select a student ID photo to upload.');
      return;
    }

    setReuploadLoading(true);
    setReuploadError('');

    try {
      // Upload student ID photo
      const formData = new FormData();
      formData.append('file', newStudentIdFile);
      formData.append('firstName', reuploadUser.first_name);
      formData.append('lastName', reuploadUser.last_name);

      const uploadRes = await fetch('/api/upload-student-id', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Failed to upload student ID photo');
      }

      const uploadData = await uploadRes.json();

      // Update database with student ID URL
      const updateRes = await fetch('/api/qdw/update-student-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reuploadUser.email,
          studentIdPhotoUrl: uploadData.url,
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update registration with student ID');
      }

      setUploadSuccess(true);
      setNewStudentIdFile(null);
    } catch (err: any) {
      setReuploadError(err.message || 'An error occurred. Please try again.');
    } finally {
      setReuploadLoading(false);
    }
  };

  // Convert file to base64 for storing in sessionStorage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setIsSubmitting(false);
      setSubmitError('Passwords do not match.');
      return;
    }

    // Validate CV is required
    if (!formData.cvPdf) {
      setIsSubmitting(false);
      setSubmitError('CV upload is required.');
      return;
    }

    // Validate student ID photo is required for students
    const isStudent = formData.registrationType === 'student_in_person' || 
                      formData.registrationType === 'student_online';
    if (isStudent && !formData.studentIdPhoto) {
      setIsSubmitting(false);
      setSubmitError('Student ID photo is required for student registration.');
      return;
    }

    // Validate dietary restriction
    if (!formData.dietaryRestriction) {
      setIsSubmitting(false);
      setSubmitError('Please select a dietary restriction.');
      return;
    }
    if (formData.dietaryRestriction === 'Other' && !formData.dietaryRestrictionOther.trim()) {
      setIsSubmitting(false);
      setSubmitError('Please specify your dietary restriction.');
      return;
    }

    try {
      // Check if this is a student registration
      const isStudent = formData.registrationType === 'student_in_person' || 
                        formData.registrationType === 'student_online';

      if (isStudent) {
        // STUDENT FLOW: Save to database immediately and upload student ID for admin verification
        // Student ID must be uploaded now so admin can review it
        // Poster will be uploaded after payment
        
        // Save to database with pending approval status
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            designation: formData.designation,
            location: formData.location,
            registrationType: formData.registrationType,
            projectTitle: formData.projectTitle,
            projectDescription: formData.projectDescription,
            dietaryRestriction: formData.dietaryRestriction === 'Other' ? formData.dietaryRestrictionOther : formData.dietaryRestriction,
            wantsQdcMembership: formData.wantsQdcMembership,
            agreeToTerms: formData.agreeToTerms,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit registration');
        }

        const registrationId = data.id;

        // Upload student ID photo immediately (admin needs to see it for approval)
        if (formData.studentIdPhoto) {
          const studentIdFormData = new FormData();
          studentIdFormData.append('file', formData.studentIdPhoto);
          studentIdFormData.append('firstName', formData.firstName);
          studentIdFormData.append('lastName', formData.lastName);
          studentIdFormData.append('email', formData.email);

          const uploadResponse = await fetch('/api/upload-student-id', {
            method: 'POST',
            body: studentIdFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            
            // Update registration with student ID URL
            await fetch('/api/qdw/update-student-id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: formData.email,
                studentIdPhotoUrl: uploadData.url,
              }),
            });
          }
        }

        // Upload CV immediately (admin needs to see it for approval)
        if (formData.cvPdf) {
          const cvFormData = new FormData();
          cvFormData.append('file', formData.cvPdf);
          cvFormData.append('firstName', formData.firstName);
          cvFormData.append('lastName', formData.lastName);
          cvFormData.append('email', formData.email);

          const cvUploadResponse = await fetch('/api/upload-cv', {
            method: 'POST',
            body: cvFormData,
          });

          if (cvUploadResponse.ok) {
            const cvUploadData = await cvUploadResponse.json();

            // Update registration with CV URL
            await fetch('/api/qdw/update-student-id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: formData.email,
                cvUrl: cvUploadData.url,
              }),
            });
          }
        }

        // Store poster info for after-payment upload (if provided)
        let posterBase64 = '';
        let posterFileName = '';
        if (formData.posterPdf) {
          posterBase64 = await fileToBase64(formData.posterPdf);
          posterFileName = formData.posterPdf.name;
        }
        if (posterBase64) {
          const filesPayload = {
            posterBase64,
            posterFileName,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            registrationId,
          };
          sessionStorage.setItem('qdw_student_files', JSON.stringify(filesPayload));
        }

        // Redirect to waiting room
        window.location.assign('/qdw/2026/waiting-approval');
      } else {
        // NON-STUDENT FLOW: Store in sessionStorage and proceed to payment
        // Convert files to base64 for temporary storage (files will be uploaded AFTER payment)
        const cvBase64 = await fileToBase64(formData.cvPdf);
        const cvFileName = formData.cvPdf.name;
        let posterBase64 = '';
        let posterFileName = '';
        let studentIdBase64 = '';
        let studentIdFileName = '';

        if (formData.posterPdf) {
          posterBase64 = await fileToBase64(formData.posterPdf);
          posterFileName = formData.posterPdf.name;
        }

        if (formData.studentIdPhoto) {
          studentIdBase64 = await fileToBase64(formData.studentIdPhoto);
          studentIdFileName = formData.studentIdPhoto.name;
        }

        // Store registration data in sessionStorage (NOT saved to Supabase yet).
        // Files are stored as base64 and will only be uploaded after successful payment.
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
          dietaryRestriction: formData.dietaryRestriction === 'Other' ? formData.dietaryRestrictionOther : formData.dietaryRestriction,
          // Store files as base64 - will be uploaded after payment
          cvBase64,
          cvFileName,
          posterBase64,
          posterFileName,
          studentIdBase64,
          studentIdFileName,
          wantsQdcMembership: formData.wantsQdcMembership,
          agreeToTerms: formData.agreeToTerms,
        };

        sessionStorage.setItem('qdw_registration', JSON.stringify(registrationPayload));

        setIsSubmitted(true);

        // Redirect to internal payment page with type/email
        const params = new URLSearchParams();
        params.set('type', formData.registrationType);
        params.set('email', formData.email);

        window.location.assign(`/qdw/2026/payment?${params.toString()}`);
      }
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
      <main className="min-h-screen bg-white flex flex-col items-stretch px-4">
        <QDW2026Nav />
        <div className="flex-1 flex items-center justify-center py-20">
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
        </div>
      </main>
    );
  }

  // Show student ID reupload interface
  if (showReuploadLogin) {
    return (
      <main className="min-h-screen bg-white">
        <QDW2026Nav />
        <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Student ID Reupload
              </h1>
              <p className="text-gray-600">
                {reuploadAuthenticated 
                  ? 'Upload your new student ID for verification'
                  : 'Login to update your student ID'}
              </p>
            </div>

            {!reuploadAuthenticated ? (
              // Login form
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sign In</h2>

                {reuploadError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {reuploadError}
                  </div>
                )}

                <form onSubmit={handleReuploadLogin} className="space-y-6">
                  <div>
                    <label htmlFor="reuploadEmail" className="block text-sm font-bold text-gray-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="reuploadEmail"
                      value={reuploadEmail}
                      onChange={(e) => setReuploadEmail(e.target.value)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reuploadPassword" className="block text-sm font-bold text-gray-900 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="reuploadPassword"
                      value={reuploadPassword}
                      onChange={(e) => setReuploadPassword(e.target.value)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reuploadLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reuploadLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowReuploadLogin(false)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </div>
            ) : (
              // Upload form
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Welcome back, {reuploadUser.first_name}!
                  </h2>
                  <p className="text-gray-600">
                    Status: <span className={`font-semibold ${reuploadUser.approval_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {reuploadUser.approval_status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
                    </span>
                  </p>
                </div>

                {uploadSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Student ID Uploaded!</h3>
                    <p className="text-gray-600 mb-6">
                      Your new student ID has been submitted for review. You'll receive an email once it's approved with your payment link.
                    </p>
                    <Link
                      href="/qdw/2026/info"
                      className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all"
                    >
                      Back to Event Info
                    </Link>
                  </div>
                ) : (
                  <>
                    {reuploadUser.approval_status === 'rejected' && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                        <p className="font-semibold mb-2">⚠️ Your previous student ID was not approved</p>
                        <p className="text-sm">
                          Please upload a new, clear photo of your valid student ID. Make sure it shows your name, institution, and is not expired.
                        </p>
                      </div>
                    )}

                    {reuploadError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {reuploadError}
                      </div>
                    )}

                    <form onSubmit={handleReuploadSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          New Student ID Photo
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a clear photo of your valid student ID card. Accepted formats: JPG, PNG, WebP (max 5MB)
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                          onChange={handleReuploadFileChange}
                          required
                          className="mt-2 block w-full text-sm text-gray-700
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-full file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-purple-100 file:text-purple-700
                                     hover:file:bg-purple-200"
                        />
                        {newStudentIdFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            Selected: {newStudentIdFile.name} ({(newStudentIdFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800 mb-2"><strong>💡 Tips for a good photo:</strong></p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>Use good lighting - avoid shadows</li>
                          <li>Ensure all text is readable</li>
                          <li>Take photo straight-on (not at an angle)</li>
                          <li>ID must be current (not expired)</li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        disabled={reuploadLoading || !newStudentIdFile}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reuploadLoading ? 'Uploading...' : 'Submit New Student ID'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <QDW2026Nav />
        <section className="py-20 px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Getting Involved in the Quantum Device Workshop (QDW)</h1>
              <p className="text-lg text-gray-600">
                The Quantum Device Workshop is designed to teach advanced undergraduates and graduate students the art
                of designing quantum devices.
              </p>
            </div>

            <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded-xl text-center">
              <p className="text-amber-800 font-semibold">
                Soft Deadline: May 16, 2026
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Prices may increase after May 16th. Registrations are not guaranteed to remain open after this date, so register early to secure your spot!
              </p>
            </div>

            <div className="bg-white rounded-xl p-8">
              {/* Link for students who need to reupload ID */}
              {/* <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm text-purple-800 text-center">
                  <strong>Already registered as a student but got rejected for invalid student ID?</strong>{' '}
                  <button
                    onClick={() => setShowReuploadLogin(true)}
                    className="text-purple-600 hover:text-purple-700 underline font-semibold"
                  >
                    Click here to update your student ID
                  </button>
                </p>
              </div> */}

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
                    <option value="student_in_person">Student — In Person ($60) </option>
                    <option value="student_online">Student — Online ($30) </option>
                    <option value="professional_in_person">Professional — In Person ($300) </option>
                    <option value="professional_online">Professional — Online ($150) </option>
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-1">
                    Confirm Password <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    placeholder="Re-enter your password"
                  />
                </div>

                {/* Student ID Photo - Required for student registration types */}
                {isStudentRegistration && (
                  <div>
                    <label htmlFor="studentIdPhoto" className="block text-sm font-bold text-gray-900 mb-1">
                      Student ID Photo <span className="font-normal text-gray-500">(required for students)</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Please upload a clear photo of your valid student ID to verify your student status.
                    </p>
                    <input
                      type="file"
                      id="studentIdPhoto"
                      name="studentIdPhoto"
                      accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      onChange={handleStudentIdFileChange}
                      className="mt-2 block w-full text-sm text-gray-700
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-full file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-purple-100 file:text-purple-700
                                 hover:file:bg-purple-200"
                      required
                    />
                    {formData.studentIdPhoto && (
                      <p className="text-xs text-gray-500 mt-2">Selected: {formData.studentIdPhoto.name}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Accepted formats: JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                )}

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-bold text-gray-900 mb-1">
                    Designation <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    required
                  >
                    <option value="">Select your designation</option>
                    <option value="Undergraduate Student">Undergraduate Student</option>
                    <option value="Graduate Student">Graduate Student</option>
                    <option value="Postdoc">Postdoc</option>
                    <option value="Professor">Professor</option>
                    <option value="Industry Professional">Industry Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
      
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-bold text-gray-900 mb-1">
                    Location (Country) <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    required
                  >
                    <option value="">Select your country</option>
                    {VALID_COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Dietary Restriction */}
                <div>
                  <label htmlFor="dietaryRestriction" className="block text-sm font-bold text-gray-900 mb-1">
                    Food Dietary Restriction <span className="font-normal text-gray-500">(required)</span>
                  </label>
                  {formData.dietaryRestriction === 'Other' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        name="dietaryRestrictionOther"
                        value={formData.dietaryRestrictionOther}
                        onChange={handleChange}
                        autoFocus
                        className="flex-1 h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Please specify your dietary restriction"
                        maxLength={200}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, dietaryRestriction: '', dietaryRestrictionOther: '' }))}
                        className="text-sm text-purple-600 hover:text-purple-700 whitespace-nowrap"
                      >
                        ← Back
                      </button>
                    </div>
                  ) : (
                    <select
                      id="dietaryRestriction"
                      name="dietaryRestriction"
                      value={formData.dietaryRestriction}
                      onChange={handleChange}
                      className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                      required
                    >
                      <option value="">Select dietary restriction</option>
                      <option value="None">None / No restriction</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-free">Gluten-free</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Nut allergy">Nut allergy</option>
                      <option value="Dairy-free">Dairy-free</option>
                      <option value="Other">Other (please type)</option>
                    </select>
                  )}
                </div>

                {/* Project info */}
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Poster / Project <span className="font-normal text-gray-500">(optional)</span></h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="projectTitle" className="block text-sm font-bold text-gray-900 mb-1">
                        Project Title <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="projectTitle"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        maxLength={500}
                        className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="projectDescription" className="block text-sm font-bold text-gray-900 mb-1">
                        Project Description <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        id="projectDescription"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleChange}
                        rows={5}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                        placeholder="Briefly describe your poster/project (goals, methods, results, what you want feedback on)."
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.projectDescription.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label htmlFor="cvPdf" className="block text-sm font-bold text-gray-900 mb-1">
                        CV PDF Upload <span className="font-normal text-gray-500">(required)</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Upload your CV (PDF, max 15MB)</p>
                      <input
                        type="file"
                        id="cvPdf"
                        name="cvPdf"
                        accept="application/pdf,.pdf"
                        onChange={handleCvFileChange}
                        required
                        className="mt-2 block w-full text-sm text-gray-700
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-purple-100 file:text-purple-700
                                   hover:file:bg-purple-200"
                      />
                      {formData.cvPdf && (
                        <p className="text-xs text-gray-500 mt-2">Selected: {formData.cvPdf.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="posterPdf" className="block text-sm font-bold text-gray-900 mb-1">
                        Poster PDF Upload <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Upload your project poster (PDF, max 15MB)</p>
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

// Main component with Suspense boundary
export default function QDW2026Registration() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-white text-xl">Loading registration form...</div>
      </div>
    }>
      <RegistrationContent />
    </Suspense>
  );
}