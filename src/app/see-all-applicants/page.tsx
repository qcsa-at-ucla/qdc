"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationType: string;
  designation: string;
  location: string;
  projectTitle: string;
  projectDescription: string;
  posterUrl: string | null;
  studentIdPhotoUrl: string | null;
  paymentStatus: string;
  stripeSessionId: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Check if already authenticated
  useEffect(() => {
    const storedKey = sessionStorage.getItem("admin_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      fetchApplicants(storedKey);
    }
  }, []);

  const fetchApplicants = async (key: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/qdw/admin/get-applicants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch applicants");
      }

      setApplicants(data.applicants);
      setAuthenticated(true);
      sessionStorage.setItem("admin_api_key", key);
    } catch (err: any) {
      setError(err.message);
      setAuthenticated(false);
      sessionStorage.removeItem("admin_api_key");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplicants(apiKey);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setApiKey("");
    setApplicants([]);
    sessionStorage.removeItem("admin_api_key");
  };

  const exportToCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Registration Type",
      "Designation",
      "Location",
      "Project Title",
      "Project Description",
      "Registration Date",
    ];

    const csvData = applicants.map((app) => [
      app.firstName,
      app.lastName,
      app.email,
      app.registrationType,
      app.designation,
      app.location,
      app.projectTitle || "",
      app.projectDescription || "",
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qdw-2026-applicants-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" || app.registrationType === filterType;

    return matchesSearch && matchesFilter;
  });

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              QDW 2026 Admin
            </h1>
            <p className="text-gray-600">Enter admin API key to access dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin API key"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                QDW 2026 Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {applicants.length} paid registrations
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-all font-medium"
              >
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-medium text-purple-600 capitalize mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or project..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl font-medium text-purple-600 capitalize  focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-medium text-purple-600 capitalize mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl font-medium text-purple-600 capitalize  focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="student_in_person">Student (In-Person)</option>
                <option value="student_online">Student (Online)</option>
                <option value="professional_in_person">Professional (In-Person)</option>
                <option value="professional_online">Professional (Online)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredApplicants.length} of {applicants.length} applicants
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No applicants found
            </div>
          ) : (
            filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {applicant.firstName} {applicant.lastName}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <a
                          href={`mailto:${applicant.email}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          {applicant.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-purple-600 font-semibold">Type:</span>{" "}
                        <span className="font-medium text-purple-600 capitalize">
                          {applicant.registrationType.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-600 font-semibold">Designation:</span>{" "}
                        <span className="font-medium text-purple-600 capitalize">{applicant.designation}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 font-semibold">Location:</span>{" "}
                        <span className="font-medium text-purple-600 capitalize">{applicant.location}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 font-semibold">Registered:</span>{" "}
                        <span className="font-medium text-purple-600 capitalize">
                          {new Date(applicant.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Project</h4>
                    {applicant.projectTitle ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Title:</span>{" "}
                          <p className="font-medium text-gray-900">
                            {applicant.projectTitle}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>{" "}
                          <p className="text-gray-700 mt-1">
                            {applicant.projectDescription || "N/A"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No project submitted</p>
                    )}
                  </div>

                  {/* Files & Actions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Files</h4>
                    <div className="space-y-2">
                      {applicant.posterUrl && (
                        <a
                          href={`/api/qdw/view-poster?email=${encodeURIComponent(
                            applicant.email
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          📄 View Poster/CV
                        </a>
                      )}
                      {applicant.studentIdPhotoUrl && (
                        <a
                          href={`/api/qdw/view-student-id?email=${encodeURIComponent(
                            applicant.email
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          🆔 View Student ID
                        </a>
                      )}
                      {!applicant.posterUrl && !applicant.studentIdPhotoUrl && (
                        <p className="text-gray-500 text-sm">No files uploaded</p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        ✓ {applicant.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
