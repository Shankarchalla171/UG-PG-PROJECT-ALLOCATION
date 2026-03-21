import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

const ProfessorStudentRequest = () => {
  const { token } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 🔥 Fetch data
  const fetchApplications = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/professor/applications?page=${page}&status=${filter}`,
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

  // 🔥 Status formatting
  const formatStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "CONFIRMED":
        return "Accepted by Professor";
      case "REJECTED":
        return "Rejected by Professor";
      case "TEAM_CONFIRMED":
        return "Accepted by Team";
      case "TEAM_REJECTED":
        return "Rejected by Team";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-rose-100 text-rose-800";
      case "TEAM_CONFIRMED":
        return "bg-green-100 text-green-800";
      case "TEAM_REJECTED":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100";
    }
  };

  // 🔥 Actions
  const handleAccept = async (id) => {
    await fetch(`http://localhost:8080/api/professor/applications/${id}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchApplications();
  };

  const handleReject = async (id) => {
    await fetch(`http://localhost:8080/api/professor/applications/${id}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchApplications();
  };

  // 🔥 Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    accepted: requests.filter((r) => r.status === "CONFIRMED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

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

            {/* 🔥 Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total },
                { label: "Pending", value: stats.pending },
                { label: "Accepted", value: stats.accepted },
                { label: "Rejected", value: stats.rejected },
              ].map((s) => (
                <div key={s.label} className="bg-white p-4 rounded-xl shadow border">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <h3 className="text-xl font-bold">{s.value}</h3>
                </div>
              ))}
            </div>

            {/* 🔍 Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", "PENDING", "CONFIRMED", "REJECTED", "TEAM_CONFIRMED", "TEAM_REJECTED"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-xl ${
                    filter === f
                      ? "bg-amber-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {f === "all" ? "All" : formatStatus(f)}
                </button>
              ))}
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left - Cards */}
              <div className={`${selectedRequest ? "lg:w-2/3" : "w-full"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((req) => (
                    <div
                      key={req.applicationId}
                      className="bg-white rounded-xl shadow border p-5 cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className="flex justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(req.status)}`}>
                          {formatStatus(req.status)}
                        </span>
                        <span className="text-xs">{req.appliedOn || "N/A"}</span>
                      </div>

                      <h3 className="font-bold">{req.projectTitle}</h3>

                      <p className="text-sm text-gray-600 mt-2">
                        {req.team?.members?.length} members
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel */}
              {selectedRequest && (
                <div className="lg:w-1/3">
                  <div className="bg-white p-6 rounded-xl shadow border sticky top-6">

                    <h3 className="text-lg font-bold mb-2">
                      {selectedRequest.projectTitle}
                    </h3>

                    <span className={`px-3 py-1 rounded text-xs ${getStatusColor(selectedRequest.status)}`}>
                      {formatStatus(selectedRequest.status)}
                    </span>

                    {/* Message */}
                    <p className="mt-4 text-sm text-gray-600">
                      {selectedRequest.message}
                    </p>

                    {/* Members */}
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Team Members</h4>
                      {selectedRequest.team?.members?.map((m) => (
                        <div key={m.studentId} className="flex justify-between text-sm mb-2">
                          <span>{m.name}</span>
                          <a
                            href={`http://localhost:8080/api/resumes/${m.studentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Resume
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {(selectedRequest.status !== "CONFIRMED" &&
                      selectedRequest.status !== "TEAM_CONFIRMED") && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleAccept(selectedRequest.applicationId)}
                          className="flex-1 bg-green-500 text-white py-2 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(selectedRequest.applicationId)}
                          className="flex-1 bg-red-500 text-white py-2 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded ${
                    page === i ? "bg-amber-600 text-white" : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorStudentRequest;