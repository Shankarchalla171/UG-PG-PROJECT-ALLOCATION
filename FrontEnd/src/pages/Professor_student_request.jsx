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

  const [reviewSaved, setReviewSaved] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔥 Fetch Applications
  const fetchApplications = async () => {
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
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, filter]);

  // 🔥 Status helpers
  const formatStatus = (status) => {
    switch (status) {
      case "PENDING": return "Pending";
      case "CONFIRMED": return "Accepted by Professor";
      case "REJECTED": return "Rejected by Professor";
      case "TEAM_CONFIRMED": return "Accepted by Team";
      case "TEAM_REJECTED": return "Team chose another Project";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "REJECTED": return "bg-rose-100 text-rose-800";
      case "TEAM_CONFIRMED": return "bg-green-100 text-green-800";
      case "TEAM_REJECTED": return "bg-gray-200 text-gray-800";
      default: return "bg-gray-100";
    }
  };

  // 🔥 Actions
  const handleAccept = async (id) => {
    await fetch(`${API_URL}/api/professor/applications/${id}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchApplications();
  };

  const handleReject = async (id) => {
    await fetch(`${API_URL}/api/professor/applications/${id}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchApplications();
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

    // hide after 2 seconds
    setTimeout(() => setReviewSaved(false), 2000);

    fetchApplications();
  };

  // Viewing Resume
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

    const safeName = name?.replace(/\s+/g, "_"); // remove spaces
    const filename = `${safeName || "Student"}_${roll || "ID"}_Resume.pdf`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
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
    const maxVisible = 5;

    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    // First page
    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push("...");
    }

    // Middle
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    // Last page
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages - 1);
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
        setPreviewData(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    return () => {
      if (previewData?.url) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, [previewData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6 mt-16">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-800">Student Requests</h1>
              <p className="text-amber-600/70 mt-2">
                Review and manage project requests
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total },
                { label: "Pending", value: stats.pending },
                { label: "Accepted", value: stats.accepted },
                { label: "Rejected", value: stats.rejected },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
                  <p className="text-sm text-amber-600/70">{s.label}</p>
                  <h3 className="text-xl font-bold text-amber-800 mt-1">{s.value}</h3>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", "PENDING", "CONFIRMED", "REJECTED", "TEAM_CONFIRMED", "TEAM_REJECTED"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    filter === f
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-orange-200 text-amber-700"
                  }`}
                >
                  {f === "all" ? "All" : formatStatus(f)}
                </button>
              ))}
            </div>

            {/* Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left Cards */}
              <div className={`${selectedRequest ? "lg:w-2/3" : "w-full"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((req) => (
                    <div
                      key={req.applicationId}
                      className="bg-white rounded-2xl border border-orange-200 shadow-lg p-5 cursor-pointer hover:shadow-xl transition"
                      onClick={() => {
                        setSelectedRequest(req);
                        setReviewText(req.professorReview || "");
                      }}
                    >
                      <div className="flex justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(req.status)}`}>
                          {formatStatus(req.status)}
                        </span>
                        <span className="text-xs text-amber-600/70">{req.appliedOn || "N/A"}</span>
                      </div>

                      <h3 className="text-lg font-bold text-amber-800">{req.projectTitle}</h3>

                      <p className="text-sm text-amber-600/70 mt-2">
                        {req.team?.members?.length} members
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel */}
              {selectedRequest && (
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-2xl border border-orange-200 shadow-lg sticky top-6 overflow-hidden">

                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                      <h3 className="text-xl font-bold text-amber-800">
                        {selectedRequest.projectTitle}
                      </h3>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                        {formatStatus(selectedRequest.status)}
                      </span>
                    </div>

                    <div className="p-6 space-y-6">

                      {/* Message */}
                      <div>
                        <h4 className="font-bold text-amber-800 mb-2">Message</h4>
                        <p className="bg-orange-50 p-4 rounded-xl text-sm text-amber-700 border">
                          {selectedRequest.message}
                        </p>
                      </div>

                      {/* Review */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-amber-800">Professor Review</h4>

                          {/* 🔥 Status Indicator */}
                          {reviewSaved ? (
                            <span className="text-xs text-green-600 font-medium">
                              ✓ Saved
                            </span>
                          ) : reviewText !== (selectedRequest.professorReview || "") ? (
                            <span className="text-xs text-orange-500 font-medium">
                              Unsaved changes
                            </span>
                          ) : null}
                        </div>

                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          onBlur={() => {
                            // If empty, restore original review
                            if (!reviewText.trim()) {
                              setReviewText(selectedRequest.professorReview || "");
                            }
                          }}

                          className="w-full p-4 rounded-xl border bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          rows={3}
                        />

                        <button
                          onClick={handleReviewSubmit}
                          disabled={!reviewText.trim()}
                          className={`mt-2 w-full py-2 rounded-xl font-medium transition ${
                            reviewText.trim()
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Save Review
                        </button>
                      </div>

                      {/* Members */}
                      <div>
                        <h4 className="font-bold text-amber-800 mb-2">Team Members</h4>

                        {selectedRequest.team?.members?.map((m) => (
                          <div
                            key={m.studentId}
                            className="flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-orange-50 transition"
                          >
                            <span className="text-amber-800 font-medium">{m.name}</span>

                            <button
                              onClick={() => handleViewResume(m)}
                              disabled={loadingResume}
                              className={`text-sm px-3 py-1 rounded-lg border transition ${
                                loadingResume
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              }`}
                            >
                              {loadingResume ? "Loading..." : "View Resume"}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {(selectedRequest.status !== "CONFIRMED" &&
                        selectedRequest.status !== "TEAMCONFIRMED") && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(selectedRequest.applicationId)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-xl"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(selectedRequest.applicationId)}
                            className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-2 items-center flex-wrap">

              {/* Prev */}
              <button
                onClick={handlePrev}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-amber-50"
              >
                Prev
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((item, index) =>
                item === "..." ? (
                  <span key={index} className="px-2 text-amber-500">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => handlePageClick(item)}
                    className={`px-3 py-1 border rounded transition ${
                      page === item
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white hover:bg-amber-50"
                    }`}
                  >
                    {item + 1}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={page === totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-amber-50"
              >
                Next
              </button>

            </div>

          </div>
        </div>
      </div>
      {/* Resume Preview Modal */}
      {previewData && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex flex-col"
          onClick={() => setPreviewData(null)}   // click outside closes
        >

          {/* Inner container (prevents close when clicking inside) */}
          <div
            className="flex flex-col flex-1"
            onClick={(e) => e.stopPropagation()} // prevents accidental close
          >

          {/* Top bar */}
          <div className="flex justify-between items-center px-4 py-3 bg-white shadow">

            <h2 className="font-semibold text-amber-800">
            Resume - {previewData?.name}
            </h2>

            <div className="flex gap-2">

              {/* Download */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewData(null);
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>

            </div>
          </div>

          {/* Full screen iframe */}
          <iframe
              src={previewData?.url}
              className="flex-1 w-full bg-white"
              title="Resume"
          />

          </div>

        </div>
      )}
    </div>
  );
};

export default ProfessorStudentRequest;