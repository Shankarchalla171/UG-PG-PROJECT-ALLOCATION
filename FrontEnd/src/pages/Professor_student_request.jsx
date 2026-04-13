import React, { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

/* ─── Helper: format team display name ──────────────────────────────────── */
const getTeamName = (req) => {
  return req.teamName || "Unknown Team";
};

/* ─── Expandable Horizontal Application Card ─────────────────────────────── */
const ApplicationCard = ({
  req,
  isSelected,
  onClick,
  onQuickReviewSave,
  formatStatus,
  token,
  API_URL,
}) => {
  const [hovered, setHovered] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [localReview, setLocalReview] = useState(req.professorReview || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const leaveTimer = useRef(null);

  useEffect(() => {
    setLocalReview(req.professorReview || "");
  }, [req.professorReview]);

  const statusStyles = {
    PENDING:        { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-300",   cardBorder: "border-l-amber-400"   },
    CONFIRMED:      { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", cardBorder: "border-l-emerald-500" },
    REJECTED:       { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-300",     cardBorder: "border-l-red-500"     },
    TEAM_CONFIRMED: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", cardBorder: "border-l-emerald-400" },
    TEAM_REJECTED:  { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-300",    cardBorder: "border-l-gray-400"    },
  };

  const s = statusStyles[req.status] || statusStyles.PENDING;
  // ← Use teamSize from DTO directly, no more req.team?.members
  const memberCount = req.teamSize || 0;
  const teamName = getTeamName(req);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      if (!editingReview) setHovered(false);
    }, 120);
  };

  const handleSaveReview = async (e) => {
    e.stopPropagation();
    if (!localReview.trim()) return;
    setSaving(true);
    try {
      await fetch(
        `${API_URL}/api/professors/applications/${req.applicationId}/review`,
        {
          method: "PUT",
          headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` },
          body: localReview,
        }
      );
      onQuickReviewSave(req.applicationId, localReview);
      setSaved(true);
      setEditingReview(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setLocalReview(req.professorReview || "");
    setEditingReview(false);
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-orange-200/60 border-l-4 ${s.cardBorder}
        shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer
        ${isSelected
          ? "ring-2 ring-orange-300 shadow-md shadow-orange-100 border-orange-300"
          : "hover:shadow-lg hover:border-orange-300 hover:bg-gradient-to-r hover:from-white hover:to-amber-50/30"
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        maxHeight: hovered ? "360px" : "76px",
        transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease",
      }}
    >
      {/* ── Collapsed Row (always visible) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center p-4 gap-3 lg:gap-0 h-[76px]">

        {/* Team name + project subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <svg className="w-4 h-4 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <h2 className="text-base font-semibold text-amber-900 truncate leading-tight">
              {teamName}
            </h2>
          </div>
          <p className="text-sm font-medium text-amber-700 truncate ml-6">{req.projectTitle}</p>
        </div>

        {/* Desktop: dividers + meta columns */}
        <div className="hidden lg:flex items-center">

          <div className="w-px h-12 bg-orange-200 mx-5" />

          {/* Applied Date */}
          <div className="flex items-center gap-2 mx-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
            <div>
              <p className="text-xs text-amber-500">Applied on</p>
              <p className="text-sm font-medium text-amber-800">
                {req.appliedOn
                  ? new Date(req.appliedOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="w-px h-12 bg-orange-200 mx-5" />

          {/* Members */}
          <div className="flex items-center gap-2 mx-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <div>
              <p className="text-xs text-amber-500">Members</p>
              <p className="text-sm font-medium text-amber-800">{memberCount}</p>
            </div>
          </div>

          <div className="w-px h-12 bg-orange-200 mx-5" />

          {/* Status block */}
          <div className="flex items-center ml-3">
            <div className={`px-4 py-2 rounded-lg ${s.bg} ${s.border} border`}>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <p className={`text-sm font-bold ${s.text}`}>{formatStatus(req.status)}</p>
            </div>
          </div>
        </div>

        {/* Mobile: compact status */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
            {formatStatus(req.status)}
          </span>
          <span className="text-xs text-amber-500">{memberCount}m</span>
        </div>
      </div>

      {/* ── Expanded Review Section ── */}
      <div
        className="px-5 pb-4"
        style={{
          opacity: hovered ? 1 : 0,
          transition: `opacity ${hovered ? "0.22s" : "0.08s"} ease`,
          transitionDelay: hovered ? "0.18s" : "0s",
          pointerEvents: hovered ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-t border-orange-100 pt-3">

          {/* Row: review label + edit button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Professor Review
              </span>
              {saved && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  ✓ Saved
                </span>
              )}
            </div>

            {!editingReview && (
              <button
                onClick={(e) => { e.stopPropagation(); setEditingReview(true); }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors font-medium"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit
              </button>
            )}
          </div>

          {/* Review content / textarea */}
          {editingReview ? (
            <div className="space-y-2">
              <textarea
                value={localReview}
                onChange={(e) => setLocalReview(e.target.value.slice(0, 500))}
                onClick={(e) => e.stopPropagation()}
                placeholder="Add your review or feedback for this team..."
                className="w-full p-2.5 rounded-lg border border-orange-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm text-amber-800 resize-none transition-all"
                rows={3}
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-end">
                <span className={`text-xs font-medium tabular-nums ${
                  localReview.length >= 500 ? "text-red-500" :
                  localReview.length >= 450 ? "text-orange-500" :
                  "text-amber-400"
                }`}>
                  {localReview.length}/500 Characters
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveReview}
                  disabled={saving || !localReview.trim()}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Review"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5 border border-orange-100 leading-relaxed min-h-[40px] cursor-text overflow-y-auto break-words"
              style={{ maxHeight: "6.5rem" }}
              onClick={(e) => { e.stopPropagation(); setEditingReview(true); }}
              title="Click to edit review"
            >
              {localReview
                ? <span>{localReview}</span>
                : <span className="text-amber-400 italic text-xs">No review added yet. Click to write one...</span>
              }
            </div>
          )}

          {/* View Details button */}
          <div className="flex justify-end mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              View Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Team Members Skeleton Loader ───────────────────────────────────────── */
const TeamMembersSkeleton = ({ count = 2 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-amber-50 border border-orange-100 animate-pulse"
      >
        <div className="w-8 h-8 rounded-full bg-orange-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-orange-200 rounded w-2/3" />
          <div className="h-2.5 bg-orange-100 rounded w-1/3" />
        </div>
        <div className="w-14 h-6 bg-orange-100 rounded-lg" />
      </div>
    ))}
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ProfessorStudentRequest = () => {
  const { token } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [editingPanelReview, setEditingPanelReview] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [projects, setProjects] = useState([]);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // lazy team fetch state
  const [teamDetails, setTeamDetails] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const teamCache = useRef({});

  // Single loading state: "initial" | "filter" | false
  // "initial" = very first load (show stats+filter skeletons too)
  // "filter"  = subsequent filter/page changes (keep stats+filter visible)
  // false     = done loading
  const [loadingState, setLoadingState] = useState("initial");
  const hasFetchedOnce = useRef(false);
  const skeletonCount = useRef(5);

  const params = new URLSearchParams(window.location.search);
  const projectIdFromURL = params.get("projectId") ? String(params.get("projectId")) : null;
  const [projectFilter, setProjectFilter] = useState(projectIdFromURL ?? "all");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchApplications = async () => {
    setLoadingState(hasFetchedOnce.current ? "filter" : "initial");
    try {
      const res = await fetch(
        `${API_URL}/api/professors/applications?page=${page}&status=${filter}&projectId=${projectFilter === "all" ? "" : projectFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
      const count = (data.content || []).length;
      skeletonCount.current = count > 0 ? Math.min(count, 5) : 3;
    } catch (err) {
      console.error(err);
    } finally {
      hasFetchedOnce.current = true;
      setLoadingState(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [page, filter, projectFilter]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects/professor/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (projectIdFromURL) {
      setProjectFilter(projectIdFromURL);
      setFilter("all");
      setPage(0);
    }
  }, []);

  // ← NEW: fetch team details lazily, with cache
  const fetchTeamDetails = async (teamId) => {
    if (!teamId) return;

    // Return cached result immediately
    if (teamCache.current[teamId]) {
      setTeamDetails(teamCache.current[teamId]);
      return;
    }

    setLoadingTeam(true);
    setTeamDetails(null);
    try {
      const res = await fetch(`${API_URL}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch team");
      const data = await res.json();
      teamCache.current[teamId] = data;
      setTeamDetails(data);
    } catch (err) {
      console.error("Error fetching team details", err);
      setTeamDetails(null);
    } finally {
      setLoadingTeam(false);
    }
  };

  // ← NEW: unified handler for selecting a request (card click OR view details)
  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setReviewText(req.professorReview || "");
    setEditingPanelReview(false);
    fetchTeamDetails(req.teamId);
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING":        return "Pending";
      case "CONFIRMED":      return "Accepted";
      case "REJECTED":       return "Rejected";
      case "TEAM_CONFIRMED": return "Team Confirmed";
      case "TEAM_REJECTED":  return "Team Declined";
      default:               return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":      return "bg-green-100 text-green-700";
      case "REJECTED":       return "bg-red-100 text-red-700";
      case "TEAM_CONFIRMED": return "bg-emerald-100 text-emerald-700";
      case "TEAM_REJECTED":  return "bg-gray-100 text-gray-600";
      default:               return "bg-gray-100 text-gray-600";
    }
  };

  const handleAccept = async (id) => {
    setActionLoading("accept");
    try {
      const res = await fetch(`${API_URL}/api/professors/applications/${id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if(!res.ok){
        const text = await res.text();
        alert(text);
        return;
      }
      await fetchApplications();
      setSelectedRequest((prev) => prev ? { ...prev, status: "CONFIRMED" } : null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading("reject");
    try {
      await fetch(`${API_URL}/api/professors/applications/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchApplications();
      setSelectedRequest((prev) => prev ? { ...prev, status: "REJECTED" } : null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    await fetch(
      `${API_URL}/api/professors/applications/${selectedRequest.applicationId}/review`,
      {
        method: "PUT",
        headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` },
        body: reviewText,
      }
    );
    setSelectedRequest((prev) => ({ ...prev, professorReview: reviewText }));
    setRequests((prev) =>
      prev.map((r) =>
        r.applicationId === selectedRequest.applicationId ? { ...r, professorReview: reviewText } : r
      )
    );
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 2000);
  };

  const handleQuickReviewSave = (applicationId, newReview) => {
    setRequests((prev) =>
      prev.map((r) => r.applicationId === applicationId ? { ...r, professorReview: newReview } : r)
    );
    if (selectedRequest?.applicationId === applicationId) {
      setSelectedRequest((prev) => ({ ...prev, professorReview: newReview }));
      setReviewText(newReview);
    }
  };

  const handleViewResume = async (member) => {
    if (loadingResume) return;
    setLoadingResume(true);
    try {
      const res = await fetch(`${API_URL}/api/resumes/${member.studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("Failed to load resume"); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewData({ url, name: member.name, roll: member.rollNumber });
    } catch (err) {
      console.error("Error opening resume", err);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleDownload = () => {
    if (!previewData) return;
    const { url, name, roll } = previewData;
    const safeName = name?.replace(/\s+/g, "_");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName || "Student"}_${roll || "ID"}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total:    requests.length,
    pending:  requests.filter((r) => r.status === "PENDING").length,
    accepted: requests.filter((r) => r.status === "CONFIRMED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  const handlePrev = () => { if (page > 0) setPage(page - 1); };
  const handleNext = () => { if (page < totalPages - 1) setPage(page + 1); };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 1;
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= page - maxVisible && i <= page + maxVisible)) {
        pages.push(i);
      } else if (i === page - maxVisible - 1 || i === page + maxVisible + 1) {
        pages.push("...");
      }
    }
    return pages;
  };

  useEffect(() => {
    document.body.style.overflow = previewData ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [previewData]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (previewData) setPreviewData(null);
        else if (selectedRequest) {
          setSelectedRequest(null);
          setTeamDetails(null); // ← clear team on close
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewData, selectedRequest]);

  useEffect(() => {
    return () => { if (previewData?.url) URL.revokeObjectURL(previewData.url); };
  }, [previewData]);

  const ApplicationCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-orange-200/60 border-l-4 border-orange-200 shadow-sm p-4 animate-pulse">
      
      {/* Row */}
      <div className="flex items-center justify-between">
        
        {/* Left */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
          <div className="h-3 w-56 bg-gray-100 rounded"></div>
        </div>

        {/* Right meta */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-16 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 flex-col lg:flex-row">
          {/* ── Main Content ── */}
          <div className="flex-1 p-4">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-amber-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Student Requests
              </h1>
              <p className="text-sm text-amber-600 mt-1 ml-8">Review and manage project applications</p>
            </div>

            {/* Stats */}
            {loadingState === "initial" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="h-5 w-10 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total",    value: stats.total,    bg: "bg-orange-100", color: "text-orange-600", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" },
                  { label: "Pending",  value: stats.pending,  bg: "bg-yellow-100", color: "text-yellow-600", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" },
                  { label: "Accepted", value: stats.accepted, bg: "bg-green-100",  color: "text-green-600",  icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
                  { label: "Rejected", value: stats.rejected, bg: "bg-red-100",    color: "text-red-600",    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" },
                ].map(({ label, value, bg, color, icon }) => (
                  <div key={label} className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-3 lg:p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 lg:w-10 lg:h-10 ${bg} rounded-lg flex items-center justify-center`}>
                        <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${color}`} viewBox="0 0 24 24" fill="currentColor">
                          <path d={icon}/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-amber-500">{label}</p>
                        <p className="text-lg lg:text-xl font-bold text-amber-900">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Bar */}
            {loadingState === "initial" ? (
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              /* existing filter bar */
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                    </svg>
                    <span className="text-xs font-medium text-amber-600">Filter:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-amber-600">Project:</span>
                    <select
                      value={projectFilter}
                      onChange={(e) => { setProjectFilter(e.target.value); setPage(0); setSelectedRequest(null); setTeamDetails(null); }}
                      className="px-3 py-1.5 rounded-lg text-xs border border-orange-200 bg-white text-amber-700"
                    >
                      <option value="all">All Projects</option>
                      {projects.map((p) => (
                        <option key={p.projectId} value={String(p.projectId)}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all",           label: "All" },
                      { key: "PENDING",       label: "Pending" },
                      { key: "CONFIRMED",     label: "Accepted" },
                      { key: "REJECTED",      label: "Rejected" },
                      { key: "TEAM_CONFIRMED",label: "Team Confirmed" },
                      { key: "TEAM_REJECTED", label: "Team Declined" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => { setFilter(f.key); setPage(0); setSelectedRequest(null); setTeamDetails(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filter === f.key
                            ? "bg-orange-500 text-white"
                            : "bg-amber-50/50 text-amber-700 border border-orange-200 hover:bg-orange-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading skeletons for card list */}
            {loadingState !== false && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: skeletonCount.current }).map((_, i) => (
                  <ApplicationCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty */}
            {loadingState === false && requests.length === 0 && (
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p className="text-lg font-medium text-amber-700">No requests found</p>
                <p className="text-sm text-amber-500 mt-1">
                  {filter === "all" ? "You don't have any project applications yet" : `No ${formatStatus(filter).toLowerCase()} applications`}
                </p>
              </div>
            )}

            {/* ── Horizontal Card List ── */}
            {loadingState === false && requests.length > 0 && (
              <div className="flex flex-col gap-3">
                {requests.map((req) => (
                  <ApplicationCard
                    key={req.applicationId}
                    req={req}
                    isSelected={selectedRequest?.applicationId === req.applicationId}
                    onClick={() => handleSelectRequest(req)}      // ← updated
                    onQuickReviewSave={handleQuickReviewSave}
                    formatStatus={formatStatus}
                    token={token}
                    API_URL={API_URL}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {loadingState === false && totalPages > 1 && (
              <div className="flex items-center gap-2 flex-wrap justify-center mt-8">
                <button onClick={handlePrev} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                {getPageNumbers().map((item, index) =>
                  item === "..." ? (
                    <span key={index} className="px-2">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`px-3 py-1 border rounded ${page === item ? "bg-orange-500 text-white" : ""}`}
                    >
                      {item + 1}
                    </button>
                  )
                )}
                <button onClick={handleNext} disabled={page === totalPages - 1} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Detail Panel ── */}
        <div className={`${
          selectedRequest
            ? "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
            : "hidden lg:block"
        } lg:w-80 xl:w-96 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start`}>

          <div className="h-full p-4 border-l border-orange-200/60 bg-white/95 lg:bg-gradient-to-b lg:from-amber-50/50 lg:to-orange-50/30 overflow-y-auto ml-auto max-w-md lg:max-w-none">

            {selectedRequest ? (
              <div className="w-full max-w-md mx-auto lg:max-w-none">

                <button
                  onClick={() => { setSelectedRequest(null); setTeamDetails(null); }}
                  className="lg:hidden mb-4 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                  Back to requests
                </button>

                <h2 className="text-base lg:text-lg font-bold text-amber-900 mb-3 lg:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Application Details
                </h2>

                <div className="bg-white rounded-xl border border-orange-200 shadow-md p-4 lg:p-5">

                  <h3 className="text-base lg:text-lg font-semibold text-amber-900 mb-0.5 leading-tight">
                    {getTeamName(selectedRequest)}
                  </h3>
                  <p className="text-xs text-amber-500 mb-3">{selectedRequest.projectTitle}</p>

                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {formatStatus(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-1.5 uppercase tracking-wide">Application Message</p>
                    <p
                      className="text-sm text-amber-800 leading-relaxed bg-amber-50 p-3 rounded-lg border border-orange-100 overflow-y-auto break-words"
                      style={{ maxHeight: "6.5rem" }}
                    >
                      {selectedRequest.message || "No message provided"}
                    </p>
                  </div>

                  {/* ── Your Review ── */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Your Review</p>
                        {reviewSaved && (
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            ✓ Saved
                          </span>
                        )}
                      </div>
                      {!editingPanelReview && (
                        <button
                          onClick={() => setEditingPanelReview(true)}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors font-medium"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                          Edit
                        </button>
                      )}
                    </div>

                    {editingPanelReview ? (
                      <div className="space-y-2">
                        {reviewText !== (selectedRequest.professorReview || "") && !reviewSaved && (
                          <p className="text-xs text-orange-500 font-medium">Unsaved changes</p>
                        )}
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                          placeholder="Add your review or feedback..."
                          className="w-full p-3 rounded-lg border border-orange-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm text-amber-800 resize-none"
                          rows={3}
                          maxLength={500}
                          autoFocus
                        />
                        <div className="flex justify-end">
                          <span className={`text-xs font-medium tabular-nums ${
                            reviewText.length >= 500 ? "text-red-500" :
                            reviewText.length >= 450 ? "text-orange-500" :
                            "text-amber-400"
                          }`}>
                            {reviewText.length}/500 Characters
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              await handleReviewSubmit();
                              setEditingPanelReview(false);
                            }}
                            disabled={!reviewText.trim()}
                            className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Save Review
                          </button>
                          <button
                            onClick={() => {
                              setReviewText(selectedRequest.professorReview || "");
                              setEditingPanelReview(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5 border border-orange-100 leading-relaxed min-h-[40px] cursor-text overflow-y-auto break-words"
                        style={{ maxHeight: "6.5rem" }}
                        onClick={() => setEditingPanelReview(true)}
                        title="Click to edit review"
                      >
                        {reviewText
                          ? <span>{reviewText}</span>
                          : <span className="text-amber-400 italic text-xs">No review added yet. Click to write one...</span>
                        }
                      </div>
                    )}
                  </div>

                  {/* ── Team Members (lazy loaded) ── */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-2 uppercase tracking-wide">
                      Team Members ({selectedRequest.teamSize || 0})
                    </p>

                    {loadingTeam ? (
                      // Skeleton: use teamSize from DTO so skeleton has the right count
                      <TeamMembersSkeleton count={selectedRequest.teamSize || 2} />
                    ) : teamDetails?.members?.length > 0 ? (
                      <div className="space-y-2">
                        {teamDetails.members.map((m) => (
                          <div
                            key={m.studentId}
                            className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-amber-50 border border-orange-100 hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex items-center gap-2 lg:gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-xs font-bold text-white">
                                {m.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
                                  {m.name}
                                  {m.teamRole === "TEAMlEAD" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold border border-orange-200">
                                      Lead
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-amber-500">{m.rollNumber}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewResume(m)}
                              disabled={loadingResume}
                              className={`text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg font-medium transition-colors ${
                                loadingResume
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                              }`}
                            >
                              {loadingResume ? "..." : "Resume"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-400 italic px-1">
                        No member details available.
                      </p>
                    )}
                  </div>

                  {selectedRequest.status === "PENDING" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAccept(selectedRequest.applicationId)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {actionLoading === "accept" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.applicationId)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {actionLoading === "reject" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {selectedRequest.status !== "PENDING" && (
                    <div className={`p-3 rounded-lg border ${
                      selectedRequest.status === "CONFIRMED"      ? "bg-green-50 border-green-200" :
                      selectedRequest.status === "REJECTED"       ? "bg-red-50 border-red-200" :
                      selectedRequest.status === "TEAM_CONFIRMED" ? "bg-emerald-50 border-emerald-200" :
                      "bg-gray-50 border-gray-200"
                    }`}>
                      <p className={`text-sm font-medium ${
                        selectedRequest.status === "CONFIRMED"      ? "text-green-700" :
                        selectedRequest.status === "REJECTED"       ? "text-red-700" :
                        selectedRequest.status === "TEAM_CONFIRMED" ? "text-emerald-700" :
                        "text-gray-600"
                      }`}>
                        {selectedRequest.status === "CONFIRMED"      && "You have accepted this application"}
                        {selectedRequest.status === "REJECTED"       && "You have rejected this application"}
                        {selectedRequest.status === "TEAM_CONFIRMED" && "The team has confirmed this project"}
                        {selectedRequest.status === "TEAM_REJECTED"  && "The team chose a different project"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center py-16 text-amber-500">
                <svg className="w-12 h-12 xl:w-16 xl:h-16 mb-3 xl:mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p className="text-xs xl:text-sm font-medium text-amber-600">Select a request</p>
                <p className="text-xs text-amber-400 mt-1 text-center">Click on a card to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col" onClick={() => setPreviewData(null)}>
          <div className="flex flex-col flex-1 m-2 sm:m-4 md:m-8 bg-white rounded-xl overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 bg-amber-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-sm font-bold text-white">
                  {previewData?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-amber-800 text-sm lg:text-base">{previewData?.name}</h2>
                  <p className="text-xs text-amber-500">{previewData?.roll}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewData(null); }}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe src={previewData?.url} className="flex-1 w-full bg-gray-100" title="Resume Preview"/>
            <div className="px-4 py-2 bg-amber-50 border-t border-orange-200 text-center text-xs text-amber-500">
              Press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfessorStudentRequest;