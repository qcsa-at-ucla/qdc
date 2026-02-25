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
  approvalStatus: string | null;
  approvedAt: string | null;
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
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved, paid
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [registrationToReject, setRegistrationToReject] = useState<string | null>(null);

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

  const handleReject = async (registrationId: string) => {
    setRegistrationToReject(registrationId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!registrationToReject) return;

    setRejectingId(registrationToReject);
    setError("");
    setShowRejectModal(false);

    try {
      const response = await fetch("/api/qdw/admin/reject-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          registrationId: registrationToReject,
          reason: rejectReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject registration");
      }

      // Show success message
      alert(data.message || "Registration rejected and email sent!");

      // Reset state
      setRejectReason("");
      setRegistrationToReject(null);

      // Refresh applicants list
      await fetchApplicants(apiKey);
    } catch (err: any) {
      alert("Error: " + err.message);
      setError(err.message);
    } finally {
      setRejectingId(null);
    }
  };

  const handleApprove = async (registrationId: string) => {
    if (!confirm("Are you sure you want to approve this student registration? They will receive an email with a payment link.")) {
      return;
    }

    setApprovingId(registrationId);
    setError("");

    try {
      const response = await fetch("/api/qdw/admin/approve-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          registrationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve registration");
      }

      // Show success message
      alert(data.message || "Registration approved and email sent!");

      // Refresh applicants list
      await fetchApplicants(apiKey);
    } catch (err: any) {
      alert("Error: " + err.message);
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
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

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && app.approvalStatus === "pending") ||
      (statusFilter === "approved" && app.approvalStatus === "approved" && app.paymentStatus === "pending") ||
      (statusFilter === "rejected" && app.approvalStatus === "rejected") ||
      (statusFilter === "paid" && app.paymentStatus === "paid");

    return matchesSearch && matchesFilter && matchesStatus;
  });

  // Count statistics
  const pendingCount = applicants.filter(a => a.approvalStatus === "pending").length;
  const approvedCount = applicants.filter(a => a.approvalStatus === "approved" && a.paymentStatus === "pending").length;
  const rejectedCount = applicants.filter(a => a.approvalStatus === "rejected").length;
  const paidCount = applicants.filter(a => a.paymentStatus === "paid").length;


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
                {paidCount} paid • {approvedCount} approved (awaiting payment) • {pendingCount} pending approval • {rejectedCount} rejected
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
          <div className="grid md:grid-cols-3 gap-4">
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
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl font-medium text-purple-600 capitalize  focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval ({pendingCount})</option>
                <option value="approved">Approved - Awaiting Payment ({approvedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
                <option value="paid">Paid ({paidCount})</option>
              </select>
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
                          )}&t=${encodeURIComponent(applicant.posterUrl)}`}
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
                          )}&t=${encodeURIComponent(applicant.studentIdPhotoUrl)}`}
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
                    
                    {/* Status Badge */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {applicant.approvalStatus === "pending" && (
                        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          ⏳ PENDING APPROVAL
                        </span>
                      )}
                      {applicant.approvalStatus === "approved" && applicant.paymentStatus === "pending" && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          ✓ APPROVED (Awaiting Payment)
                        </span>
                      )}
                      {applicant.approvalStatus === "rejected" && (
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          ✗ REJECTED (ID Resubmission Required)
                        </span>
                      )}
                      {applicant.paymentStatus === "paid" && (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          ✓ PAID
                        </span>
                      )}
                    </div>

                    {/* Approve/Reject Buttons (for pending students) */}
                    {applicant.approvalStatus === "pending" && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => handleApprove(applicant.id)}
                          disabled={approvingId === applicant.id || rejectingId === applicant.id}
                          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-4 py-2 text-sm transition-all"
                        >
                          {approvingId === applicant.id ? "Approving..." : "✓ Approve Student"}
                        </button>
                        <button
                          onClick={() => handleReject(applicant.id)}
                          disabled={approvingId === applicant.id || rejectingId === applicant.id}
                          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-4 py-2 text-sm transition-all"
                        >
                          {rejectingId === applicant.id ? "Rejecting..." : "✗ Reject ID"}
                        </button>
                      </div>
                    )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Student Registration
            </h3>
            <p className="text-gray-600 mb-4">
              The student will receive an email asking them to resubmit their student ID. You can optionally provide a reason for rejection.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., 'The ID photo was not clear' or 'The ID appears to be expired'"
                className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                If left blank, a default message will be used.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRegistrationToReject(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full px-4 py-2 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-4 py-2 transition-all"
              >
                Reject & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
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
