"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Schedule data ──────────────────────────────────────────────────────────────
type SessionType = 'lecture' | 'workshop' | 'break' | 'social' | 'meal' | 'panel' | 'talk' | 'project' | 'poster';
interface ScheduleSession { title: string; type: SessionType; speaker?: string; company?: string; }
interface ScheduleSlot { time: string; days: (ScheduleSession | null)[]; }

const SESSION_STYLES: Record<SessionType, string> = {
  lecture:  'bg-purple-900/40 border-purple-500/50 text-purple-100',
  workshop: 'bg-green-900/40 border-green-500/50 text-green-100',
  break:    'bg-gray-800/60 border-gray-600/40 text-gray-400',
  meal:     'bg-gray-800/60 border-gray-600/40 text-gray-400',
  social:   'bg-amber-900/40 border-amber-500/50 text-amber-100',
  panel:    'bg-indigo-900/40 border-indigo-500/50 text-indigo-100',
  talk:     'bg-cyan-900/40 border-cyan-500/50 text-cyan-100',
  project:  'bg-emerald-900/40 border-emerald-500/50 text-emerald-100',
  poster:   'bg-pink-900/40 border-pink-500/50 text-pink-100',
};
const SESSION_DOTS: Record<SessionType, string> = {
  lecture: 'bg-purple-400', workshop: 'bg-green-400', break: 'bg-gray-500', meal: 'bg-gray-500',
  social: 'bg-amber-400', panel: 'bg-indigo-400', talk: 'bg-cyan-400', project: 'bg-emerald-400', poster: 'bg-pink-400',
};

const TRAINING_SCHEDULE: ScheduleSlot[] = [
  { time: '8:00 – 9:00 AM', days: [{ title: 'Breakfast', type: 'meal', speaker: 'Intro (8:45)', company: 'Eli Levenson-Falk' }, { title: 'Breakfast', type: 'meal' }, { title: 'Breakfast', type: 'meal' }, { title: 'Breakfast', type: 'meal' }] },
  { time: '9:00 – 9:45 AM', days: [{ title: 'Intro to cQED', type: 'lecture', speaker: 'Zlatko Minev' }, { title: 'Noise', type: 'lecture', speaker: 'Kyle Serniak' }, { title: 'Circuit Analysis', type: 'lecture', speaker: "Kevin O'Brien" }, { title: 'Intro to Design Project', type: 'lecture', speaker: 'Murat Can Sarihan' }] },
  { time: '9:45 – 10:30 AM', days: [{ title: 'Intro to Circuits', type: 'lecture', speaker: 'Aziza Almanakly' }, { title: 'Circuit Simulation', type: 'lecture', speaker: 'Jens Koch' }, { title: 'Circuit Analysis', type: 'lecture', speaker: 'David & Lukas Pahl' }, { title: 'Design Project', type: 'project' }] },
  { time: '10:30 – 11:15 AM', days: [{ title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }] },
  { time: '11:15 AM – 12:00 PM', days: [{ title: 'Intro to Circuits Pt. 2', type: 'lecture', speaker: 'Nik Zhelev' }, { title: 'Workshop – Circuit Analysis & Simulation', type: 'workshop' }, { title: 'EM Quantum Analysis Techniques', type: 'lecture', speaker: 'Alp Sipahigil' }, { title: 'Design Project', type: 'project' }] },
  { time: '12:00 – 1:30 PM', days: [{ title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }] },
  { time: '1:30 – 2:15 PM', days: [{ title: 'Intro to Gates', type: 'lecture', speaker: 'Eli Levenson-Falk' }, { title: 'EM Simulations – Classical', type: 'lecture', speaker: 'Sara Sussman' }, { title: 'Workshop – EM & Circuit Analysis', type: 'workshop', speaker: 'TBD' }, { title: 'Designing for Foundries', type: 'talk', speaker: 'Mollie Schwartz' }] },
  { time: '2:15 – 3:00 PM', days: [{ title: 'Intro to Readout', type: 'lecture', speaker: 'Daniel Sank' }, { title: 'Workshop – EM Simulations', type: 'workshop', speaker: 'Sadman Shanto' }, { title: 'Materials', type: 'lecture', speaker: 'Loren Alegria' }, { title: 'Design Project', type: 'project' }] },
  { time: '3:00 – 3:30 PM', days: [{ title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }] },
  { time: '3:30 – 4:15 PM', days: [{ title: 'Intro to Layout', type: 'lecture', speaker: 'Murat Can Sarihan' }, { title: 'Couplers & 2Q Gates', type: 'lecture', speaker: 'Michael Hatridge' }, { title: 'Error Correction Basics', type: 'talk', speaker: 'Andreas Walraff' }, { title: 'Nanoacademic', type: 'talk', company: 'Nanoacademic' }] },
  { time: '4:15 – 5:00 PM', days: [{ title: 'Workshop – Design & Layout', type: 'workshop' }, { title: 'Workshop – Full Device Simulation', type: 'workshop', company: 'Synopsys / Qolab' }, { title: 'Large Scale Quantum', type: 'talk', speaker: 'Reza Molavi' }, { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Mod.)' }] },
  { time: '5:00 – 6:00 PM', days: [{ title: 'Poster Session', type: 'poster' }, { title: 'Quantum Beers', type: 'social' }, { title: 'Career Session', type: 'social' }, { title: 'Panel & Reception', type: 'panel' }] },
  { time: '', days: [null, null, null, { title: 'Reception', type: 'social' }] },
];

const ADVANCED_SCHEDULE: ScheduleSlot[] = [
  { time: '8:00 – 9:00 AM', days: [{ title: 'Breakfast', type: 'meal', speaker: 'Intro (8:45)', company: 'Eli Levenson-Falk' }, { title: 'Breakfast', type: 'meal' }, { title: 'Breakfast', type: 'meal' }, { title: 'Breakfast', type: 'meal' }] },
  { time: '9:00 – 9:45 AM', days: [{ title: 'Ani Nersisyan', type: 'lecture', company: 'Google' }, { title: 'Michael Hatridge', type: 'lecture', company: 'Univ. of Pittsburgh' }, { title: 'Andreas Walraff', type: 'lecture', company: 'ETH Zurich' }, { title: 'Yvonne Gao', type: 'lecture', company: 'NUS' }] },
  { time: '9:45 – 10:30 AM', days: [{ title: 'Shuhei Tamate', type: 'lecture', company: 'RIKEN' }, { title: 'Jeff Grover', type: 'lecture', company: 'MIT' }, { title: 'Aziza Almanakly', type: 'lecture', company: 'NYU' }, { title: 'Mark Gyure', type: 'lecture', company: 'UCLA' }] },
  { time: '10:30 – 11:15 AM', days: [{ title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }] },
  { time: '11:15 AM – 12:00 PM', days: [{ title: 'Ebrahim Forati', type: 'lecture', company: 'Google' }, { title: 'Kyle Serniak', type: 'lecture', company: 'MIT Lincoln Lab' }, { title: 'Anna Grassellino', type: 'lecture', company: 'Fermilab' }, { title: 'Holly Stemp', type: 'lecture', company: 'MIT' }] },
  { time: '12:00 – 1:30 PM', days: [{ title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }, { title: 'Lunch', type: 'meal' }] },
  { time: '1:30 – 2:15 PM', days: [{ title: 'Greg Peairs', type: 'talk', company: 'AWS' }, { title: "Kevin O'Brien", type: 'lecture', company: 'MIT' }, { title: 'Taylor Patti', type: 'talk', company: 'NVIDIA' }, { title: 'Alice & Bob', type: 'talk', company: 'Alice & Bob' }] },
  { time: '2:15 – 3:00 PM', days: [{ title: 'Hugh Carson', type: 'talk', company: 'AWS' }, { title: 'Wei Dai', type: 'lecture', company: 'Quantum Machines' }, { title: 'Nicola Pancotti', type: 'talk', company: 'NVIDIA' }, { title: 'Nanoacademic', type: 'talk', company: 'Nanoacademic' }] },
  { time: '3:00 – 3:30 PM', days: [{ title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }, { title: 'Coffee Break', type: 'break' }] },
  { time: '3:30 – 4:15 PM', days: [{ title: 'Rigetti', type: 'talk', company: 'Rigetti' }, { title: 'Rigetti', type: 'talk', company: 'Rigetti' }, { title: 'Sadman Ahmed Shanto', type: 'lecture', company: 'USC' }, { title: 'Quantum Design', type: 'talk', speaker: 'TBA' }] },
  { time: '4:15 – 5:00 PM', days: [{ title: 'Silvia Zorzetti', type: 'lecture', company: 'Fermilab' }, { title: 'Joseph Glick', type: 'talk', company: 'QBlox' }, { title: 'Taekwan Yoon', type: 'talk', company: 'Zurich Instruments' }, { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Mod., 4:30)' }] },
  { time: '5:00 – 6:00 PM', days: [{ title: 'Poster Session', type: 'poster' }, { title: 'Quantum Beers', type: 'social' }, { title: 'Breakout: Business', type: 'panel', speaker: 'Panel + Talk + Mini Workshop' }, { title: 'Panel & Reception', type: 'panel' }] },
  { time: '', days: [null, null, { title: 'QDC', type: 'social' }, { title: 'Reception', type: 'social' }] },
];

const SCHEDULE_DAYS = ['Day 1 · Jun 15', 'Day 2 · Jun 16', 'Day 3 · Jun 17', 'Day 4 · Jun 18'];

function MemberScheduleCell({ s }: { s: ScheduleSession | null }) {
  if (!s) return <div className="min-h-[52px]" />;
  return (
    <div className={`rounded-lg border px-2.5 py-2 min-h-[52px] flex flex-col justify-center gap-0.5 ${SESSION_STYLES[s.type]}`}>
      <div className="flex items-start gap-1.5">
        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${SESSION_DOTS[s.type]}`} />
        <span className="text-[11px] sm:text-xs font-semibold leading-snug">{s.title}</span>
      </div>
      {s.speaker && <p className="text-[10px] opacity-70 pl-3">{s.speaker}</p>}
      {s.company && <p className="text-[10px] opacity-55 pl-3 italic">{s.company}</p>}
    </div>
  );
}

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

  // Upgrade states
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

  // CV update states
  const [editingCv, setEditingCv] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvSuccess, setCvSuccess] = useState(false);
  const [cvError, setCvError] = useState("");

  // Schedule track toggle
  const [memberTrack, setMemberTrack] = useState<'training' | 'advanced'>('training');

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'info' | 'training' | 'advanced'>('info');

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

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setCvFile(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const maxBytes = 15 * 1024 * 1024;

    if (!isPdf) {
      setCvError("File must be a PDF");
      e.target.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setCvError("File is too large (max 15MB)");
      e.target.value = "";
      return;
    }

    setCvError("");
    setCvFile(file);
  };

  const handleUpdateCv = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFile) {
      setCvError("Please select a CV PDF to upload");
      return;
    }

    setCvLoading(true);
    setCvError("");
    setCvSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("email", user.email);
      formData.append("firstName", user.first_name);
      formData.append("lastName", user.last_name);

      const uploadRes = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Failed to upload CV");
      }

      const uploadData = await uploadRes.json();

      // Update database with CV URL
      const updateRes = await fetch("/api/qdw/update-student-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          cvUrl: uploadData.url,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update registration with CV");
      }

      setUser({ ...user, cv_url: uploadData.url });
      setCvSuccess(true);
      setEditingCv(false);
      setCvFile(null);
      setTimeout(() => setCvSuccess(false), 3000);
    } catch (err: any) {
      setCvError(err.message || "An error occurred. Please try again.");
    } finally {
      setCvLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeError("");
    try {
      const res = await fetch("/api/stripe/upgrade-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create upgrade session");
      window.location.assign(data.url);
    } catch (err: any) {
      setUpgradeError(err.message || "An error occurred. Please try again.");
      setUpgradeLoading(false);
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
    <div className="min-h-screen bg-[#07071a] pt-16">
      {/* Sticky top header + tab bar */}
      <div className="sticky top-16 z-30 bg-[#07071a]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase mb-1">QDW 2026 · Member Portal</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, {user?.first_name}!</h1>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("qdw_member_email");
                setIsAuthenticated(false);
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all font-medium text-sm border border-white/20"
            >
              Sign Out
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1">
            {([
              { id: 'info',     label: 'My Info',         icon: '' },
              { id: 'training', label: 'Training Track',   icon: '🟢' },
              { id: 'advanced', label: 'Advanced Track',   icon: '🟣' },
            ] as { id: 'info' | 'training' | 'advanced'; label: string; icon: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? tab.id === 'training'
                      ? 'border-green-500 text-green-300 bg-green-900/20'
                      : tab.id === 'advanced'
                      ? 'border-purple-500 text-purple-300 bg-purple-900/20'
                      : 'border-indigo-400 text-indigo-200 bg-indigo-900/20'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="max-w-6xl mx-auto">

      {/* ── MY INFO TAB ──────────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="max-w-4xl mx-auto space-y-6">

        {/* Registration Details Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4">Registration Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
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
              <span className="text-green-400 font-semibold">✓ Paid</span>
            </div>
            <div>
              <span className="text-gray-500">Registered:</span>{" "}
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade to In-Person */}
        {(user?.registration_type === "student_online" || user?.registration_type === "professional_online") && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎟️</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Upgrade to In-Person Attendance</h2>
                <p className="text-gray-400 text-sm mb-4">
                  You're currently registered for{" "}
                  <span className="font-semibold capitalize">
                    {user.registration_type?.replace(/_/g, " ")}
                  </span>
                  . Upgrade to attend QDW 2026 in person and present your poster live!
                </p>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-4 inline-block">
                  <p className="text-sm text-gray-600">
                    Upgrade fee{" "}
                    <span className="text-xs text-gray-500">
                      (difference from your current plan)
                    </span>
                  </p>
                  <p className="text-2xl font-bold text-blue-300">
                    {user.registration_type === "student_online" ? "$30" : "$150"}
                  </p>
                </div>

                {upgradeError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-sm">
                    {upgradeError}
                  </div>
                )}

                <div>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-all"
                  >
                    {upgradeLoading ? "Redirecting to payment…" : "Upgrade to In-Person →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Profile Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
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
            <div className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-300">
              ✓ Profile updated successfully!
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300">
              {profileError}
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                    className="w-full h-12 px-4 border border-white/20 rounded-full bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    required
                    className="w-full h-12 px-4 border border-white/20 rounded-full bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-full px-8 py-3 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Full Name:</span>{" "}
                <span className="font-medium text-white">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Student ID Section (for student registrations only) */}
        {(user?.registration_type === 'student_in_person' || user?.registration_type === 'student_online') && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Student ID Verification</h2>
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
              <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-500/40 rounded-xl text-yellow-300">
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
              <div className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-300">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-semibold mb-1">Student ID Approved!</p>
                    <p className="text-sm">Your student status has been verified.</p>
                  </div>
                </div>
              </div>
            )}

            {user?.approval_status === "rejected" && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300">
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
              <div className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-300">
                ✓ Student ID uploaded successfully! Your submission is now pending admin review.
              </div>
            )}

            {studentIdError && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300">
                {studentIdError}
              </div>
            )}

            {editingStudentId ? (
              <form onSubmit={handleUpdateStudentId} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
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
                    className="bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-full px-8 py-3 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="font-medium text-white capitalize">
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
                      href={`/api/qdw/view-student-id?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
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
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Project & Poster</h2>
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
                {user?.poster_url ? "Update Poster" : "Add Poster"}
              </button>
            )}
          </div>

          {posterSuccess && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-300">
              ✓ Poster information updated successfully!
            </div>
          )}

          {posterError && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300">
              {posterError}
            </div>
          )}

          {editingPoster ? (
            <form onSubmit={handleUpdatePoster} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={posterData.projectTitle}
                  onChange={(e) => setPosterData({ ...posterData, projectTitle: e.target.value })}
                  required
                  maxLength={500}
                  className="w-full h-12 px-4 border border-white/20 rounded-full bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Project Description
                </label>
                <textarea
                  value={posterData.projectDescription}
                  onChange={(e) => setPosterData({ ...posterData, projectDescription: e.target.value })}
                  required
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your project (goals, methods, results, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {posterData.projectDescription.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Update Poster PDF <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty to keep current file, or upload a new PDF to replace it. Posters should be no more than 36 × 48 inches; vertical or horizontal orientation is accepted.
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
                      href={`/api/qdw/view-poster?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
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
                  className="bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-full px-8 py-3 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Project Title:</span>{" "}
                <span className="font-medium text-white">{user?.project_title || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-500">Description:</span>{" "}
                <p className="font-medium text-white mt-1">
                  {user?.project_description || "Not set"}
                </p>
              </div>
              {user?.poster_url && (
                <div>
                  <span className="text-gray-500">Poster PDF:</span>{" "}
                  <a
                    href={`/api/qdw/view-poster?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline font-medium"
                  >
                    View poster →
                  </a>
                </div>
              )}
              {!user?.poster_url && (
                <div>
                  <span className="text-gray-500">Poster PDF:</span>{" "}
                  <span className="font-medium text-gray-400">No poster uploaded yet</span>
                </div>
              )}
              {user?.cv_url && (
                <div>
                  <span className="text-gray-500">CV PDF:</span>{" "}
                  <a
                    href={`/api/qdw/view-cv?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline font-medium"
                  >
                    View CV →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CV Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">CV</h2>
            {!editingCv && (
              <button
                onClick={() => {
                  setEditingCv(true);
                  setCvFile(null);
                  setCvError("");
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all font-medium"
              >
                {user?.cv_url ? "Update CV" : "Add CV"}
              </button>
            )}
          </div>

          {cvSuccess && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-300">
              ✓ CV updated successfully!
            </div>
          )}

          {cvError && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300">
              {cvError}
            </div>
          )}

          {editingCv ? (
            <form onSubmit={handleUpdateCv} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  CV PDF {user?.cv_url ? <span className="font-normal text-gray-500">(upload new to replace)</span> : <span className="font-normal text-gray-500">(required)</span>}
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload your CV as a PDF (max 15MB)</p>
                <input
                  key={editingCv ? 'cv-file-input' : 'cv-file-reset'}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleCvFileChange}
                  className="mt-2 block w-full text-sm text-gray-700
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-purple-100 file:text-purple-700
                             hover:file:bg-purple-200"
                />
                {cvFile && (
                  <p className="text-xs text-gray-500 mt-2">New file: {cvFile.name}</p>
                )}
                {user?.cv_url && !cvFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Current file:{" "}
                    <a
                      href={`/api/qdw/view-cv?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      View current CV
                    </a>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={cvLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cvLoading ? "Uploading..." : "Save CV"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCv(false);
                    setCvFile(null);
                    setCvError("");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-full px-8 py-3 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {user?.cv_url ? (
                <a
                  href={`/api/qdw/view-cv?email=${encodeURIComponent(user.email)}&t=${Date.now()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  View CV →
                </a>
              ) : (
                <span className="font-medium text-gray-400">No CV uploaded yet</span>
              )}
            </div>
          )}
        </div>
        </div>
      )}

      {/* ── TRAINING TRACK TAB ──────────────────────────────────────────── */}
      {activeTab === 'training' && (
        <ZoomRoomPanel
          trackName="Training Track"
          room="Cohen Room: Engineering VI, UCLA"
          accentColor="green"
          zoomMeetingUrl={null}
          schedule={TRAINING_SCHEDULE}
          scheduleDays={SCHEDULE_DAYS}
        />
      )}

      {/* ── ADVANCED TRACK TAB ──────────────────────────────────────────── */}
      {activeTab === 'advanced' && (
        <ZoomRoomPanel
          trackName="Advanced Track"
          room="Mong Auditorium: Engineering VI, UCLA"
          accentColor="purple"
          zoomMeetingUrl={null}
          schedule={ADVANCED_SCHEDULE}
          scheduleDays={SCHEDULE_DAYS}
        />
      )}

      </div>
      </div>
    </div>
  );
}

// ── Zoom Room Panel Component ─────────────────────────────────────────────────
interface ZoomRoomPanelProps {
  trackName: string;
  room: string;
  accentColor: 'green' | 'purple';
  zoomMeetingUrl: string | null;
  schedule: ScheduleSlot[];
  scheduleDays: string[];
}

function ZoomRoomPanel({ trackName, room, accentColor, zoomMeetingUrl, schedule, scheduleDays }: ZoomRoomPanelProps) {
  const isGreen = accentColor === 'green';
  const accent = isGreen
    ? { border: 'border-green-500/40', text: 'text-green-400', bg: 'bg-green-900/20', dot: 'bg-green-400', toggleBg: 'bg-green-600', badge: 'bg-green-500/20 text-green-300 border-green-500/30' }
    : { border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-900/20', dot: 'bg-purple-400', toggleBg: 'bg-purple-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };

  return (
    <div className="space-y-6">
      {/* Room header */}
      <div className={`rounded-2xl border ${accent.border} p-5 flex items-center gap-4 bg-white/[0.03]`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.bg} flex-shrink-0`}>
          <svg className={`w-6 h-6 ${accent.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.132a1 1 0 01-1.447.901L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white">{trackName}</h2>
          <p className="text-gray-400 text-sm">{room}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${accent.badge} flex-shrink-0`}>
          June 15–18, 2026
        </span>
      </div>

      {/* Zoom panel — full width */}
      <div>

        {/* Zoom Video Panel */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d1f]">
          {/* Zoom-style top bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] border-b border-white/10">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11A2.5 2.5 0 014.5 4zm11 7.5l4-2.4v5.8l-4-2.4V16h-11V8h11v3.5z"/>
              </svg>
              <span className="text-xs text-gray-400 font-medium">QDW 2026: {trackName}</span>
            </div>
          </div>

          {/* Video area — Coming Soon overlay */}
          <div className="relative aspect-video bg-gradient-to-br from-[#0d0d1f] to-[#12122a] flex items-center justify-center">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Placeholder participant tiles */}
            <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-2 opacity-20 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                </div>
              ))}
            </div>

            {/* Coming Soon badge */}
            <div className="relative z-10 text-center px-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border ${accent.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} animate-pulse`} />
                Coming June 2026
              </div>
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="text-2xl font-bold text-white mb-2">Zoom Room</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                The live Zoom session for the <span className={accent.text + ' font-semibold'}>{trackName}</span> will be available here once the event begins. A meeting link and passcode will be emailed to you.
              </p>
              {zoomMeetingUrl ? (
                <a
                  href={zoomMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block mt-6 px-6 py-3 rounded-full text-white font-semibold text-sm ${accent.toggleBg} hover:opacity-90 transition-opacity`}
                >
                  Join Meeting →
                </a>
              ) : (
                <button disabled className="mt-6 px-6 py-3 rounded-full text-gray-500 font-semibold text-sm bg-white/5 border border-white/10 cursor-not-allowed">
                  Join Meeting: Available Soon
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Schedule for this track */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className={`px-6 py-4 border-b border-white/10 flex items-center gap-3 ${accent.bg}`}>
          <span className={`text-sm font-bold ${accent.text}`}>📅 {trackName}: Full Schedule</span>
          <span className="text-xs text-gray-500 ml-auto">All times Pacific Time (PT)</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr] bg-white/5 border-b border-white/10">
              <div className="px-3 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Time</div>
              {scheduleDays.map((d, i) => (
                <div key={i} className="px-2 py-3 text-center">
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${accent.text}`}>{d}</p>
                </div>
              ))}
            </div>
            {schedule.map((slot, ri) => (
              <div
                key={ri}
                className={`grid grid-cols-[130px_1fr_1fr_1fr_1fr] border-b border-white/5 ${slot.days.every(d => d?.type === 'break' || d?.type === 'meal' || d === null) ? 'bg-white/[0.02]' : 'hover:bg-white/[0.03] transition-colors'}`}
              >
                <div className="px-3 py-2 flex items-center">
                  <span className={`text-[10px] font-medium leading-snug ${slot.time ? 'text-gray-400' : 'text-transparent'}`}>{slot.time || '—'}</span>
                </div>
                {slot.days.map((s, ci) => (
                  <div key={ci} className="px-1.5 py-1.5">
                    <MemberScheduleCell s={s} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
          <p className="text-gray-600 text-xs">Schedule subject to change. Check back for updates.</p>
        </div>
      </div>
    </div>
  );
}

