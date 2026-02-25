"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberOnlyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Profile update states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: "", lastName: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Poster update states
  const [editingPoster, setEditingPoster] = useState(false);
  const [posterData, setPosterData] = useState({ projectTitle: "", projectDescription: "", posterPdf: null as File | null });
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterSuccess, setPosterSuccess] = useState(false);
  const [posterError, setPosterError] = useState("");

  // Student ID update states
  const [editingStudentId, setEditingStudentId] = useState(false);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdLoading, setStudentIdLoading] = useState(false);
  const [studentIdSuccess, setStudentIdSuccess] = useState(false);
  const [studentIdError, setStudentIdError] = useState("");

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      });
      setPosterData({
        projectTitle: user.project_title || "",
        projectDescription: user.project_description || "",
        posterPdf: null,
      });
    }
  }, [user]);

  // Check if user is already logged in via session/cookie
  useEffect(() => {
    const checkAuth = async () => {
      const sessionEmail = sessionStorage.getItem("qdw_member_email");
      if (sessionEmail) {
        // Verify the session is still valid
        const response = await fetch("/api/qdw/verify-member", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          sessionStorage.removeItem("qdw_member_email");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const response = await fetch("/api/qdw/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, first_name: profileData.firstName, last_name: profileData.lastName });
        setProfileSuccess(true);
        setEditingProfile(false);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setProfileError("An error occurred. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosterLoading(true);
    setPosterError("");
    setPosterSuccess(false);

    try {
      let posterUrl = user.poster_url;

      // Upload new PDF if provided
      if (posterData.posterPdf) {
        const formData = new FormData();
        formData.append("file", posterData.posterPdf);
        formData.append("email", user.email);
        formData.append("firstName", user.first_name);
        formData.append("lastName", user.last_name);

        const uploadRes = await fetch("/api/upload-poster", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload poster PDF");
        }

        const uploadData = await uploadRes.json();
        posterUrl = uploadData.url;
      }

      // Update poster info in database
      const response = await fetch("/api/qdw/update-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          projectTitle: posterData.projectTitle,
          projectDescription: posterData.projectDescription,
          posterUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({
          ...user,
          project_title: posterData.projectTitle,
          project_description: posterData.projectDescription,
          poster_url: posterUrl,
        });
        setPosterSuccess(true);
        setEditingPoster(false);
        setPosterData({
          projectTitle: posterData.projectTitle,
          projectDescription: posterData.projectDescription,
          posterPdf: null,
        });
        setTimeout(() => setPosterSuccess(false), 3000);
      } else {
        setPosterError(data.error || "Failed to update poster");
      }
    } catch (err: any) {
      setPosterError(err.message || "An error occurred. Please try again.");
    } finally {
      setPosterLoading(false);
    }
  };

  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPosterData({ ...posterData, posterPdf: null });
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const maxBytes = 15 * 1024 * 1024;

    if (!isPdf) {
      setPosterError("File must be a PDF");
      e.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setPosterError("File is too large (max 15MB)");
      e.target.value = "";
      return;
    }

    setPosterError("");
    setPosterData({ ...posterData, posterPdf: file });
  };

  const handleStudentIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setStudentIdFile(null);
      return;
    }

    const isImage = file.type.startsWith("image/") || 
      [".jpg", ".jpeg", ".png", ".webp"].some(ext => file.name.toLowerCase().endsWith(ext));
    const maxBytes = 5 * 1024 * 1024;

    if (!isImage) {
      setStudentIdError("File must be an image (JPG, PNG, WebP)");
      e.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setStudentIdError("File is too large (max 5MB)");
      e.target.value = "";
      return;
    }

    setStudentIdError("");
    setStudentIdFile(file);
  };

  const handleUpdateStudentId = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentIdFile) {
      setStudentIdError("Please select a student ID photo to upload");
      return;
    }

    setStudentIdLoading(true);
    setStudentIdError("");
    setStudentIdSuccess(false);

    try {
      // Upload student ID photo
      const formData = new FormData();
      formData.append("file", studentIdFile);
      formData.append("firstName", user.first_name);
      formData.append("lastName", user.last_name);

      const uploadRes = await fetch("/api/upload-student-id", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Failed to upload student ID photo");
      }

      const uploadData = await uploadRes.json();

      // Update database with student ID URL
      const updateRes = await fetch("/api/qdw/update-student-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          studentIdPhotoUrl: uploadData.url,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update registration with student ID");
      }

      const updateData = await updateRes.json();

      // Update local user state
      setUser({
        ...user,
        student_id_photo_url: uploadData.url,
        approval_status: "pending",
      });

      setStudentIdSuccess(true);
      setEditingStudentId(false);
      setStudentIdFile(null);
      
      setTimeout(() => setStudentIdSuccess(false), 5000);
    } catch (err: any) {
      setStudentIdError(err.message || "An error occurred. Please try again.");
    } finally {
      setStudentIdLoading(false);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/qdw/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        sessionStorage.setItem("qdw_member_email", email);
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setError(data.error || "Login failed. Please check your email and password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setForgotPasswordSuccess(false);

    try {
      const response = await fetch("/api/qdw/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess(true);
      } else {
        // Still show success message for security
        setForgotPasswordSuccess(true);
      }
    } catch (err) {
      setForgotPasswordSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] pt-20">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show initial choice screen
    if (!showLoginForm) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 pt-24">
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-white mb-2">
                QDW 2026 Members Only
              </h1>
              <p className="text-gray-300">
                Exclusive access for registered attendees
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
             Already Registered & Paid? Click Here
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">
                    or
                  </span>
                </div>
              </div>

              <a
                href="/qdw/2026/registration"
                className="block w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-full transition-all text-center border border-white/20 hover:border-white/40 hover:scale-[1.02]"
              >
                Register for QDW 2026
              </a>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs">
                Only paid attendees can access the member portal
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Show login/set password form
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 pt-24">
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
          <button
            onClick={() => {
              setShowLoginForm(false);
              setShowForgotPassword(false);
              setEmail("");
              setPassword("");
              setError("");
              setForgotPasswordEmail("");
              setForgotPasswordSuccess(false);
            }}
            className="text-white/60 hover:text-white mb-4 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {!showForgotPassword ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">
                Member Login
              </h1>
              <p className="text-gray-300 text-center mb-6">
                Sign in with your registered email and password
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-white mb-2 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={8}
                  />
                </div>

                <div className="mb-6 text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">
                Forgot Password
              </h1>
              <p className="text-gray-300 text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>

              {forgotPasswordSuccess ? (
                <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
                  <p className="mb-2">
                    If an account exists with that email, a password reset link has been sent.
                  </p>
                  <p className="text-sm text-green-300">
                    Please check your email (including spam folder).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-6">
                    <label className="block text-white mb-2 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSuccess(false);
                    setForgotPasswordEmail("");
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Authenticated member area
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Welcome, {user?.first_name}!
              </h1>
              <p className="text-gray-600">QDW 2026 Member Portal</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("qdw_member_email");
                setIsAuthenticated(false);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-all font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Registration Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registration Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Registration Type:</span>{" "}
              <span className="font-medium capitalize">
                {user?.registration_type?.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Payment Status:</span>{" "}
              <span className="text-green-600 font-semibold">✓ Paid</span>
            </div>
            <div>
              <span className="text-gray-500">Registered:</span>{" "}
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Update Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              ✓ Profile updated successfully!
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {profileError}
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileData({
                      firstName: user.first_name || "",
                      lastName: user.last_name || "",
                    });
                    setProfileError("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full px-8 py-3 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Full Name:</span>{" "}
                <span className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Student ID Section (for student registrations only) */}
        {(user?.registration_type === 'student_in_person' || user?.registration_type === 'student_online') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Student ID Verification</h2>
              {!editingStudentId && user?.approval_status === "rejected" && (
                <button
                  onClick={() => {
                    setEditingStudentId(true);
                    setStudentIdError("");
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all font-medium"
                >
                  Upload New ID
                </button>
              )}
            </div>

            {/* Approval Status Banner */}
            {user?.approval_status === "pending" && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⏳</span>
                  <div>
                    <p className="font-semibold mb-1">Pending Admin Review</p>
                    <p className="text-sm">Your student ID is being reviewed by our admin team. You'll receive an email once it's approved.</p>
                  </div>
                </div>
              </div>
            )}

            {user?.approval_status === "approved" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold mb-1">Student ID Approved!</p>
                    <p className="text-sm">Your student status has been verified. You can now proceed to payment if you haven't already.</p>
                  </div>
                </div>
              </div>
            )}

            {user?.approval_status === "rejected" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✗</span>
                  <div>
                    <p className="font-semibold mb-1">Student ID Needs Attention</p>
                    <p className="text-sm mb-3">Your student ID photo could not be verified. Please upload a new, clear photo of your valid student ID.</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Ensure the ID shows your name clearly</li>
                      <li>Include your university/institution name</li>
                      <li>Photo should be well-lit and in focus</li>
                      <li>ID must be current (not expired)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {studentIdSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                ✓ Student ID uploaded successfully! Your submission is now pending admin review.
              </div>
            )}

            {studentIdError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {studentIdError}
              </div>
            )}

            {editingStudentId ? (
              <form onSubmit={handleUpdateStudentId} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Upload Student ID Photo
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Please upload a clear photo of your valid student ID card. Accepted formats: JPG, PNG, WebP (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handleStudentIdFileChange}
                    required
                    className="mt-2 block w-full text-sm text-gray-700
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-purple-100 file:text-purple-700
                               hover:file:bg-purple-200"
                  />
                  {studentIdFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {studentIdFile.name} ({(studentIdFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={studentIdLoading || !studentIdFile}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {studentIdLoading ? "Uploading..." : "Submit Student ID"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudentId(false);
                      setStudentIdFile(null);
                      setStudentIdError("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full px-8 py-3 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="font-medium text-gray-900 capitalize">
                    {user?.approval_status === "pending" && "⏳ Pending Review"}
                    {user?.approval_status === "approved" && "✓ Approved"}
                    {user?.approval_status === "rejected" && "✗ Rejected - Action Required"}
                    {!user?.approval_status && "Not Submitted"}
                  </span>
                </div>
                {user?.student_id_photo_url && (
                  <div>
                    <span className="text-gray-500">Student ID:</span>{" "}
                    <a
                      href={`/api/qdw/view-student-id?email=${encodeURIComponent(user.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline font-medium"
                    >
                      View submitted ID →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Update Poster Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Project & Poster</h2>
            {!editingPoster && (
              <button
                onClick={() => {
                  setEditingPoster(true);
                  setPosterData({
                    projectTitle: user.project_title || "",
                    projectDescription: user.project_description || "",
                    posterPdf: null,
                  });
                  setPosterError("");
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all font-medium"
              >
                Update Poster
              </button>
            )}
          </div>

          {posterSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              ✓ Poster information updated successfully!
            </div>
          )}

          {posterError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {posterError}
            </div>
          )}

          {editingPoster ? (
            <form onSubmit={handleUpdatePoster} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={posterData.projectTitle}
                  onChange={(e) => setPosterData({ ...posterData, projectTitle: e.target.value })}
                  required
                  maxLength={500}
                  className="w-full h-12 px-4 border border-gray-300 rounded-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Project Description
                </label>
                <textarea
                  value={posterData.projectDescription}
                  onChange={(e) => setPosterData({ ...posterData, projectDescription: e.target.value })}
                  required
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your project (goals, methods, results, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {posterData.projectDescription.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Update CV/Poster PDF <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty to keep current file, or upload a new PDF to replace it
                </p>
                <input
                  key={editingPoster ? 'poster-file-input' : 'poster-file-reset'}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePosterFileChange}
                  className="mt-2 block w-full text-sm text-gray-700
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-purple-100 file:text-purple-700
                             hover:file:bg-purple-200"
                />
                {posterData.posterPdf && (
                  <p className="text-xs text-gray-500 mt-2">New file: {posterData.posterPdf.name}</p>
                )}
                {user?.poster_url && !posterData.posterPdf && (
                  <p className="text-xs text-gray-500 mt-2">
                    Current file:{" "}
                    <a
                      href={`/api/qdw/view-poster?email=${encodeURIComponent(user.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      View current poster
                    </a>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={posterLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posterLoading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPoster(false);
                    setPosterData({
                      projectTitle: user.project_title || "",
                      projectDescription: user.project_description || "",
                      posterPdf: null,
                    });
                    setPosterError("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full px-8 py-3 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Project Title:</span>{" "}
                <span className="font-medium text-gray-900">{user?.project_title || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-500">Description:</span>{" "}
                <p className="font-medium text-gray-900 mt-1">
                  {user?.project_description || "Not set"}
                </p>
              </div>
              {user?.poster_url && (
                <div>
                  <span className="text-gray-500">Poster PDF:</span>{" "}
                  <a
                    href={`/api/qdw/view-poster?email=${encodeURIComponent(user.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline font-medium"
                  >
                    View poster →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
