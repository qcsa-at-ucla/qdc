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
  cvUrl: string | null;
  posterUrl: string | null;
  studentIdPhotoUrl: string | null;
  paymentStatus: string;
  approvalStatus: string | null;
  approvedAt: string | null;
  stripeSessionId: string;
  dietaryRestriction: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved, paid
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [registrationToReject, setRegistrationToReject] = useState<string | null>(null);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Applicant | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Admin tabs
  const [activeTab, setActiveTab] = useState<"applicants" | "job-requests">("applicants");

  // Job requests
  interface JobRequest {
    id: string;
    company_name: string;
    contact_name: string;
    contact_email: string;
    job_title: string;
    job_type: string;
    location: string;
    description: string;
    link: string | null;
    status: "pending" | "approved" | "rejected";
    admin_notes: string | null;
    created_at: string;
  }
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [jobRequestsLoading, setJobRequestsLoading] = useState(false);
  const [jobRequestsError, setJobRequestsError] = useState("");
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const fetchJobRequests = async (key: string) => {
    setJobRequestsLoading(true);
    setJobRequestsError("");
    try {
      const res = await fetch("/api/jobs/admin-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setJobRequests(data.requests || []);
    } catch (err: any) {
      setJobRequestsError(err.message);
    } finally {
      setJobRequestsLoading(false);
    }
  };

  const handleJobRequestAction = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`${action === "approve" ? "Approve" : "Reject"} this job request?`)) return;
    setProcessingJobId(id);
    try {
      const res = await fetch("/api/jobs/admin-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, action, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await fetchJobRequests(apiKey);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingJobId(null);
    }
  };

  // Check if already authenticated
  useEffect(() => {
    const storedKey = sessionStorage.getItem("admin_api_key");
    const storedEmail = sessionStorage.getItem("admin_email");
    if (storedKey && storedEmail) {
      setApiKey(storedKey);
      setAdminEmail(storedEmail);
      fetchApplicants(storedKey, storedEmail);
      fetchJobRequests(storedKey);
    }
  }, []);

  const fetchApplicants = async (key: string, email: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/qdw/admin/get-applicants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key, adminEmail: email }),
        cache: "no-store", // Prevent caching of applicant data
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch applicants");
      }

      setApplicants(data.applicants);
      setAuthenticated(true);
      sessionStorage.setItem("admin_api_key", key);
      sessionStorage.setItem("admin_email", email);
      fetchJobRequests(key);
    } catch (err: any) {
      setError(err.message);
      setAuthenticated(false);
      sessionStorage.removeItem("admin_api_key");
      sessionStorage.removeItem("admin_email");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplicants(apiKey, adminEmail);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setApiKey("");
    setAdminEmail("");
    setApplicants([]);
    setJobRequests([]);
    sessionStorage.removeItem("admin_api_key");
    sessionStorage.removeItem("admin_email");
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
      await fetchApplicants(apiKey, adminEmail);
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
      await fetchApplicants(apiKey, adminEmail);
    } catch (err: any) {
      alert("Error: " + err.message);
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleResendApproval = async (registrationId: string) => {
    if (!confirm("Resend the approval notification with payment link to this student?")) {
      return;
    }

    setResendingId(registrationId);
    setError("");

    try {
      const response = await fetch("/api/qdw/admin/resend-approval", {
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
        throw new Error(data.error || "Failed to resend approval notification");
      }

      // Show success message
      alert(data.message || "Approval notification resent successfully!");

      // Refresh applicants list
      await fetchApplicants(apiKey, adminEmail);
    } catch (err: any) {
      alert("Error: " + err.message);
      setError(err.message);
    } finally {
      setResendingId(null);
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

  const exportPaidCSV = () => {
    const paidApplicants = applicants.filter((app) => app.paymentStatus === "paid");

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Registration Type",
      "Designation",
      "Location",
      "Dietary Restriction",
      "Project Title",
      "Project Description",
      "Registration Date",
      "CV URL",
    ];

    const origin = window.location.origin;
    const csvData = paidApplicants.map((app) => [
      app.firstName,
      app.lastName,
      app.email,
      app.registrationType,
      app.designation,
      app.location,
      app.dietaryRestriction || "",
      app.projectTitle || "",
      app.projectDescription || "",
      new Date(app.createdAt).toLocaleDateString(),
      app.cvUrl ? `${origin}/api/qdw/view-cv?email=${encodeURIComponent(app.email)}` : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qdw-2026-paid-users-${new Date().toISOString().split("T")[0]}.csv`;
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
      filterType === "all" ||
      (filterType === "in_person_all"
        ? app.registrationType === "student_in_person" || app.registrationType === "professional_in_person"
        : filterType === "online_all"
        ? app.registrationType === "student_online" || app.registrationType === "professional_online"
        : app.registrationType === filterType);

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
            <p className="text-gray-600">Enter your credentials to access the dashboard</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin email"
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
                onClick={exportPaidCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full transition-all font-medium"
              >
                Export Paid CSV
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("applicants")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === "applicants" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Applicants
            </button>
            <button
              onClick={() => { setActiveTab("job-requests"); fetchJobRequests(apiKey); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "job-requests" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Job Requests
              {jobRequests.filter(r => r.status === "pending").length > 0 && (
                <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${activeTab === "job-requests" ? "bg-white/20 text-white" : "bg-indigo-600 text-white"}`}>
                  {jobRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeTab === "applicants" && (
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
                <option value="in_person_all">All In-Person</option>
                <option value="online_all">All Online</option>
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
                      {applicant.cvUrl && (
                        <a
                          href={`/api/qdw/view-cv?email=${encodeURIComponent(
                            applicant.email
                          )}&t=${Date.now()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          📄 View CV
                        </a>
                      )}
                      {applicant.posterUrl && (
                        <a
                          href={`/api/qdw/view-poster?email=${encodeURIComponent(
                            applicant.email
                          )}&t=${Date.now()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          📄 View Poster
                        </a>
                      )}
                      {applicant.studentIdPhotoUrl && (
                        <a
                          href={`/api/qdw/view-student-id?email=${encodeURIComponent(
                            applicant.email
                          )}&t=${Date.now()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          🆔 View Student ID
                        </a>
                      )}
                      {!applicant.cvUrl && !applicant.posterUrl && !applicant.studentIdPhotoUrl && (
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

                    {/* Resend Notification Button (for approved students who haven't paid) */}
                    {applicant.approvalStatus === "approved" && applicant.paymentStatus !== "paid" && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleResendApproval(applicant.id)}
                          disabled={resendingId === applicant.id}
                          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-4 py-2 text-sm transition-all"
                        >
                          {resendingId === applicant.id ? "Sending..." : "📧 Resend Payment Link"}
                        </button>
                      </div>
                    )}

                    {/* Send Email button — always visible */}
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setEmailTarget(applicant);
                          setEmailSubject("Regarding your QDW 2026 Registration");
                          setEmailBody(`Dear ${applicant.firstName},\n\n\n\nBest regards,\nClyde Villacrusis\nQuantum Device Workshop 2026`);
                          setEmailSuccess(false);
                          setEmailError("");
                          setShowEmailModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ✉️ Send Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )} {/* end activeTab === "applicants" */}

      {/* Job Requests Tab */}
      {activeTab === "job-requests" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Company Job Requests</h2>
            <button
              onClick={() => fetchJobRequests(apiKey)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ↻ Refresh
            </button>
          </div>

          {jobRequestsLoading && <p className="text-gray-500">Loading…</p>}
          {jobRequestsError && <p className="text-red-600">{jobRequestsError}</p>}

          {!jobRequestsLoading && jobRequests.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              No job requests yet.
            </div>
          )}

          {jobRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm ${
                req.status === "pending"
                  ? "border-yellow-300"
                  : req.status === "approved"
                  ? "border-green-300"
                  : "border-red-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{req.job_title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      req.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      req.status === "approved" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-indigo-600 font-medium">{req.company_name}</p>
                  <p className="text-gray-500 text-sm">{req.location} · {req.job_type}</p>
                  <p className="text-gray-700 text-sm mt-2">{req.description}</p>
                  {req.link && (
                    <a href={req.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 text-sm underline">
                      {req.link}
                    </a>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
                    <p>Contact: {req.contact_name} &lt;{req.contact_email}&gt;</p>
                    <p>Submitted: {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={processingJobId === req.id}
                      onClick={() => handleJobRequestAction(req.id, "approve")}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-2 text-sm transition-all"
                    >
                      {processingJobId === req.id ? "…" : "✓ Approve"}
                    </button>
                    <button
                      disabled={processingJobId === req.id}
                      onClick={() => handleJobRequestAction(req.id, "reject")}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-2 text-sm transition-all"
                    >
                      {processingJobId === req.id ? "…" : "✗ Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
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

      {/* Send Email Modal */}
      {showEmailModal && emailTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Send Email</h3>
            <p className="text-sm text-gray-500 mb-4">To: {emailTarget.firstName} {emailTarget.lastName} &lt;{emailTarget.email}&gt;</p>

            {emailSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                ✓ Email sent successfully!
              </div>
            )}
            {emailError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {emailError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailTarget(null);
                  setEmailSuccess(false);
                  setEmailError("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full px-4 py-2 transition-all"
              >
                Close
              </button>
              <button
                disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                onClick={async () => {
                  setSendingEmail(true);
                  setEmailError("");
                  setEmailSuccess(false);
                  try {
                    const res = await fetch("/api/qdw/admin/send-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        apiKey,
                        registrationId: emailTarget.id,
                        subject: emailSubject,
                        body: emailBody,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setEmailSuccess(true);
                    } else {
                      setEmailError(data.error || "Failed to send email");
                    }
                  } catch {
                    setEmailError("An error occurred. Please try again.");
                  } finally {
                    setSendingEmail(false);
                  }
                }}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full px-4 py-2 transition-all"
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
