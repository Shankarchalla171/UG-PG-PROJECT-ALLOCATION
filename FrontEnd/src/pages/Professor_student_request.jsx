import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

const ProfessorStudentRequest = () => {
  const { token } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [reviewSaved, setReviewSaved] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/professor/applications?page=${page}&status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, filter]);

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING": return "Pending";
      case "CONFIRMED": return "Accepted";
      case "REJECTED": return "Rejected";
      case "TEAM_CONFIRMED": return "Team Confirmed";
      case "TEAM_REJECTED": return "Team Declined";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "TEAM_CONFIRMED": return "bg-emerald-100 text-emerald-700";
      case "TEAM_REJECTED": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleAccept = async (id) => {
    setActionLoading('accept');
    try {
      await fetch(`${API_URL}/api/professor/applications/${id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchApplications();
      setSelectedRequest(prev => prev ? { ...prev, status: "CONFIRMED" } : null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading('reject');
    try {
      await fetch(`${API_URL}/api/professor/applications/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchApplications();
      setSelectedRequest(prev => prev ? { ...prev, status: "REJECTED" } : null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;

    await fetch(
      `${API_URL}/api/professor/applications/${selectedRequest.applicationId}/review`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${token}`,
        },
        body: reviewText,
      }
    );

    setSelectedRequest((prev) => ({
      ...prev,
      professorReview: reviewText,
    }));

    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 2000);
    fetchApplications();
  };

  const handleViewResume = async (member) => {
    if (loadingResume) return;

    setLoadingResume(true);
    try {
      const res = await fetch(
        `${API_URL}/api/resumes/${member.studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        alert("Failed to load resume");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      setPreviewData({
        url,
        name: member.name,
        roll: member.rollNumber
      });

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
    const filename = `${safeName || "Student"}_${roll || "ID"}_Resume.pdf`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    accepted: requests.filter((r) => r.status === "CONFIRMED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePageClick = (p) => {
    setPage(p);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 1;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= page - maxVisible && i <= page + maxVisible)
      ) {
        pages.push(i);
      } else if (
        i === page - maxVisible - 1 ||
        i === page + maxVisible + 1
      ) {
        pages.push("...");
      }
    }

    return pages;
  };

  useEffect(() => {
    if (previewData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [previewData]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (previewData) {
          setPreviewData(null);
        } else if (selectedRequest) {
          setSelectedRequest(null);
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewData, selectedRequest]);

  useEffect(() => {
    return () => {
      if (previewData?.url) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, [previewData]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 p-4">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-amber-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Student Requests
              </h1>
              <p className="text-sm text-amber-600 mt-1 ml-8">
                Review and manage project applications
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-3 lg:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500">Total</p>
                    <p className="text-lg lg:text-xl font-bold text-amber-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-3 lg:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500">Pending</p>
                    <p className="text-lg lg:text-xl font-bold text-amber-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-3 lg:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500">Accepted</p>
                    <p className="text-lg lg:text-xl font-bold text-amber-900">{stats.accepted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-3 lg:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500">Rejected</p>
                    <p className="text-lg lg:text-xl font-bold text-amber-900">{stats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                  </svg>
                  <span className="text-xs font-medium text-amber-600">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "PENDING", label: "Pending" },
                    { key: "CONFIRMED", label: "Accepted" },
                    { key: "REJECTED", label: "Rejected" },
                    { key: "TEAM_CONFIRMED", label: "Team Confirmed" },
                    { key: "TEAM_REJECTED", label: "Team Declined" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setFilter(f.key);
                        setPage(0);
                        setSelectedRequest(null);
                      }}
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

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <svg className="animate-spin w-12 h-12 mb-4 text-amber-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-lg font-medium text-amber-700">Loading applications...</p>
                <p className="text-sm text-amber-500 mt-1">Please wait</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && requests.length === 0 && (
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p className="text-lg font-medium text-amber-700">No requests found</p>
                <p className="text-sm text-amber-500 mt-1">
                  {filter === "all"
                    ? "You don't have any project applications yet"
                    : `No ${formatStatus(filter).toLowerCase()} applications`}
                </p>
              </div>
            )}

            {/* Request Cards Grid */}
            {!loading && requests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {requests.map((req) => {
                  const isSelected = selectedRequest?.applicationId === req.applicationId;

                  return (
                    <div
                      key={req.applicationId}
                      onClick={() => {
                        setSelectedRequest(req);
                        setReviewText(req.professorReview || "");
                      }}
                      className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-orange-400 ring-2 ring-orange-100"
                          : "border-orange-200/60 hover:border-orange-300"
                      }`}
                    >
                      {/* Status & Date */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          {formatStatus(req.status)}
                        </span>
                        <span className="text-xs text-amber-500">{req.appliedOn || "N/A"}</span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-sm lg:text-base font-semibold text-amber-900 mb-2 line-clamp-2 leading-tight">
                        {req.projectTitle}
                      </h3>

                      {/* Team Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-amber-600">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                          </svg>
                          <span>{req.team?.members?.length || 0} members</span>
                        </div>

                        {/* Member Avatars */}
                        <div className="flex -space-x-2">
                          {req.team?.members?.slice(0, 3).map((m) => (
                            <div
                              key={m.studentId}
                              className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
                              title={m.name}
                            >
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {req.team?.members?.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-medium text-amber-700 border-2 border-white">
                              +{req.team.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col items-center mt-8 gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={handlePrev}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((item, index) =>
                    item === "..." ? (
                      <span key={index} className="px-2">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageClick(item)}
                        className={`px-3 py-1 border rounded ${
                          page === item ? "bg-orange-500 text-white" : ""
                        }`}
                      >
                        {item + 1}
                      </button>
                    )
                  )}

                  <button
                    onClick={handleNext}
                    disabled={page === totalPages - 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Responsive */}
        <div className={`${
          selectedRequest
            ? "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
            : "hidden lg:block"
        } lg:w-80 xl:w-96 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start`}>

          <div className="h-full lg:h-full p-4 lg:p-4 border-l border-orange-200/60 bg-white/95 lg:bg-gradient-to-b lg:from-amber-50/50 lg:to-orange-50/30 overflow-y-auto ml-auto max-w-md lg:max-w-none">

            {selectedRequest ? (
              <div className="w-full max-w-md mx-auto lg:max-w-none">

                {/* Mobile Close Button */}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="lg:hidden mb-4 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                  Back to requests
                </button>

                <h2 className="text-base lg:text-lg font-bold text-amber-900 mb-3 lg:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  Application Details
                </h2>

                <div className="bg-white rounded-xl border border-orange-200 shadow-md p-4 lg:p-5">

                  {/* Title */}
                  <h3 className="text-base lg:text-lg font-semibold text-amber-900 mb-2 lg:mb-3 leading-tight">
                    {selectedRequest.projectTitle}
                  </h3>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {formatStatus(selectedRequest.status)}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-1.5 uppercase tracking-wide">
                      Application Message
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed bg-amber-50 p-3 rounded-lg border border-orange-100">
                      {selectedRequest.message || "No message provided"}
                    </p>
                  </div>

                  {/* Professor Review */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                        Your Review
                      </p>
                      {reviewSaved ? (
                        <span className="text-xs text-green-600 font-medium">Saved</span>
                      ) : reviewText !== (selectedRequest.professorReview || "") ? (
                        <span className="text-xs text-orange-500 font-medium">Unsaved</span>
                      ) : null}
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Add your review or feedback..."
                      className="w-full p-3 rounded-lg border border-orange-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm text-amber-800 resize-none transition-all"
                      rows={3}
                    />

                    <button
                      onClick={handleReviewSubmit}
                      disabled={!reviewText.trim()}
                      className={`mt-2 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        reviewText.trim()
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Save Review
                    </button>
                  </div>

                  {/* Team Members */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-2 uppercase tracking-wide">
                      Team Members ({selectedRequest.team?.members?.length || 0})
                    </p>

                    <div className="space-y-2">
                      {selectedRequest.team?.members?.map((m) => (
                        <div
                          key={m.studentId}
                          className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-amber-50 border border-orange-100 hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-xs font-bold text-white">
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800">{m.name}</p>
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
                  </div>

                  {/* Action Buttons */}
                  {selectedRequest.status === "PENDING" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAccept(selectedRequest.applicationId)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {actionLoading === 'accept' ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.applicationId)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {actionLoading === 'reject' ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Status Message for Non-Pending */}
                  {selectedRequest.status !== "PENDING" && (
                    <div className={`p-3 rounded-lg border ${
                      selectedRequest.status === "CONFIRMED" ? "bg-green-50 border-green-200" :
                      selectedRequest.status === "REJECTED" ? "bg-red-50 border-red-200" :
                      selectedRequest.status === "TEAM_CONFIRMED" ? "bg-emerald-50 border-emerald-200" :
                      "bg-gray-50 border-gray-200"
                    }`}>
                      <p className={`text-sm font-medium ${
                        selectedRequest.status === "CONFIRMED" ? "text-green-700" :
                        selectedRequest.status === "REJECTED" ? "text-red-700" :
                        selectedRequest.status === "TEAM_CONFIRMED" ? "text-emerald-700" :
                        "text-gray-600"
                      }`}>
                        {selectedRequest.status === "CONFIRMED" && "You have accepted this application"}
                        {selectedRequest.status === "REJECTED" && "You have rejected this application"}
                        {selectedRequest.status === "TEAM_CONFIRMED" && "The team has confirmed this project"}
                        {selectedRequest.status === "TEAM_REJECTED" && "The team chose a different project"}
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
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex flex-col"
          onClick={() => setPreviewData(null)}
        >
          <div
            className="flex flex-col flex-1 m-2 sm:m-4 md:m-8 bg-white rounded-xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewData(null);
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <iframe
              src={previewData?.url}
              className="flex-1 w-full bg-gray-100"
              title="Resume Preview"
            />

            {/* Keyboard Hint */}
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
