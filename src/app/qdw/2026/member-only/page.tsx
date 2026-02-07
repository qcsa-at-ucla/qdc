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
              setEmail("");
              setPassword("");
              setError("");
            }}
            className="text-white/60 hover:text-white mb-4 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

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

            <div className="mb-6">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated member area
  return (
    <div className="min-h-screen bg-[#0a0a1a] px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-gray-300">QDW 2026 Member Portal</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("qdw_member_email");
                setIsAuthenticated(false);
              }}
              className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2 rounded-full transition-all border border-white/20 hover:border-white/40"
            >
              Sign Out
            </button>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-purple-500/30 rounded-2xl p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Member Portal Coming Soon!
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              We're building something amazing for you. Soon you'll be able to:
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="text-white font-semibold mb-1">
                  Update Your Profile
                </h3>
                <p className="text-gray-400 text-sm">
                  Edit your information anytime
                </p>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="text-2xl mb-2">🖼️</div>
                <h3 className="text-white font-semibold mb-1">
                  Manage Your Poster
                </h3>
                <p className="text-gray-400 text-sm">
                  Upload or update your project poster
                </p>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="text-2xl mb-2">🎫</div>
                <h3 className="text-white font-semibold mb-1">
                  Event Access
                </h3>
                <p className="text-gray-400 text-sm">
                  View your ticket and event details
                </p>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="text-white font-semibold mb-1">
                  Network
                </h3>
                <p className="text-gray-400 text-sm">
                  Connect with other attendees
                </p>
              </div>
            </div>
          </div>

          {/* User Info Preview */}
          <div className="mt-8 bg-white/5 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">
              Your Registration Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="text-gray-400">Name:</span>{" "}
                <span className="text-white">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>{" "}
                <span className="text-white">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Registration Type:</span>{" "}
                <span className="text-white capitalize">
                  {user?.registration_type?.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Payment Status:</span>{" "}
                <span className="text-green-400 font-semibold">✓ Paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
