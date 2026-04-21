import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const API_BASE_URL = import.meta.env.VITE_API_URL;

const department = {
  name: "CSE",
  totalStudents: 120,
  allocatedStudents: 105,
  totalProjects: 40,
};

const recentActivities = [
  { id: 1, text: "Project allocations finalized for final year batch", time: "2h" },
  { id: 2, text: "Application deadline extended for 3 students", time: "1d" },
  { id: 3, text: "5 allocation requests pending review", time: "3d" },
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [facultyIntakeLimit, setFacultyIntakeLimit] = useState("");
  const [teamSizeLimit, setTeamSizeLimit] = useState("");
  const [isSettingIntake, setIsSettingIntake] = useState(false);
  const [isSettingTeamSize, setIsSettingTeamSize] = useState(false);
  const [currentLimits, setCurrentLimits] = useState({ facultyIntakeLimit: null, StudentTeamSizeLimit: null });
  const [isEditingIntake, setIsEditingIntake] = useState(false);
  const [isEditingTeamSize, setIsEditingTeamSize] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLimits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deptCoordinators/limits`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        console.error("Error fetching limits");
        return;
      }

      const data = await response.json();
      setCurrentLimits(data);
    } catch (error) {
      console.error("Error fetching limits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLimits();
    }
  }, [token]);

  const handleSetFacultyIntakeLimit = async () => {
    if (!facultyIntakeLimit || isNaN(facultyIntakeLimit) || parseInt(facultyIntakeLimit) <= 0) {
      alert("Please enter a valid positive number for faculty intake limit");
      return;
    }

    setIsSettingIntake(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/deptCoordinators/faculty-intake-limit`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ limit: parseInt(facultyIntakeLimit) })
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`Error setting faculty intake limit: ${message}`);
        return;
      }

      alert("Faculty intake limit updated successfully!");
      setFacultyIntakeLimit("");
      setIsEditingIntake(false);
      fetchLimits();
    } catch (error) {
      console.error("Error setting faculty intake limit:", error);
      alert("Error setting faculty intake limit. Please try again.");
    } finally {
      setIsSettingIntake(false);
    }
  };

  const handleSetTeamSizeLimit = async () => {
    if (!teamSizeLimit || isNaN(teamSizeLimit) || parseInt(teamSizeLimit) <= 0) {
      alert("Please enter a valid positive number for team size limit");
      return;
    }

    setIsSettingTeamSize(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/deptCoordinators/student-teamsize-limit`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ limit: parseInt(teamSizeLimit) })
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`Error setting team size limit: ${message}`);
        return;
      }

      alert("Team size limit updated successfully!");
      setTeamSizeLimit("");
      setIsEditingTeamSize(false);
      fetchLimits();
    } catch (error) {
      console.error("Error setting team size limit:", error);
      alert("Error setting team size limit. Please try again.");
    } finally {
      setIsSettingTeamSize(false);
    }
  };

  const startEditingIntake = () => {
    setFacultyIntakeLimit(currentLimits.facultyIntakeLimit?.toString() || "");
    setIsEditingIntake(true);
  };

  const startEditingTeamSize = () => {
    setTeamSizeLimit(currentLimits.StudentTeamSizeLimit?.toString() || "");
    setIsEditingTeamSize(true);
  };

  const cancelEditingIntake = () => {
    setFacultyIntakeLimit("");
    setIsEditingIntake(false);
  };

  const cancelEditingTeamSize = () => {
    setTeamSizeLimit("");
    setIsEditingTeamSize(false);
  };

  const pendingAllocations =
    department.totalStudents - department.allocatedStudents;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 mt-16">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              {isLoading ? (
                <>
                  <Skeleton height={36} width={400} />
                  <Skeleton height={20} width={300} className="mt-2" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-amber-800">
                    Department Coordinator Dashboard
                  </h1>
                  <p className="text-amber-600/70 mt-2">
                    Overview of project allocations and department activity
                  </p>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                    <Skeleton height={16} width={100} />
                    <Skeleton height={32} width={50} className="mt-1" />
                  </div>
                ))
              ) : (
                <>
                  <StatCard title="Total Students" value={department.totalStudents} />
                  <StatCard title="Allocated Students" value={department.allocatedStudents} />
                  <StatCard title="Available Projects" value={department.totalProjects} />
                  <StatCard title="Pending Allocations" value={pendingAllocations} />
                </>
              )}
            </div>

            {/* Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {isLoading ? (
                <>
                  <div className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton circle height={40} width={40} />
                      <div>
                        <Skeleton height={20} width={150} />
                        <Skeleton height={12} width={120} />
                      </div>
                    </div>
                    <Skeleton height={80} />
                  </div>
                  <div className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton circle height={40} width={40} />
                      <div>
                        <Skeleton height={20} width={120} />
                        <Skeleton height={12} width={110} />
                      </div>
                    </div>
                    <Skeleton height={80} />
                  </div>
                </>
              ) : (
                <>
                  {/* Faculty Intake Limit */}
                  <div className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-800">Faculty Intake Limit</h3>
                          <p className="text-xs text-amber-600/70">Maximum students per faculty</p>
                        </div>
                      </div>
                    </div>

                    {currentLimits.facultyIntakeLimit !== null && !isEditingIntake ? (
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                        <div>
                          <p className="text-xs text-blue-600 mb-1">Current Limit</p>
                          <p className="text-2xl font-bold text-blue-800">{currentLimits.facultyIntakeLimit}</p>
                        </div>
                        <button
                          onClick={startEditingIntake}
                          className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="number"
                            min="1"
                            value={facultyIntakeLimit}
                            onChange={(e) => setFacultyIntakeLimit(e.target.value)}
                            placeholder="Enter limit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSetFacultyIntakeLimit}
                            disabled={isSettingIntake}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSettingIntake ? "Saving..." : (currentLimits.facultyIntakeLimit !== null ? "Update" : "Set Limit")}
                          </button>
                          {isEditingIntake && (
                            <button
                              onClick={cancelEditingIntake}
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Size Limit */}
                  <div className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-800">Max Team Size</h3>
                          <p className="text-xs text-amber-600/70">Maximum students per team</p>
                        </div>
                      </div>
                    </div>

                    {currentLimits.StudentTeamSizeLimit !== null && !isEditingTeamSize ? (
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                        <div>
                          <p className="text-xs text-purple-600 mb-1">Current Limit</p>
                          <p className="text-2xl font-bold text-purple-800">{currentLimits.StudentTeamSizeLimit}</p>
                        </div>
                        <button
                          onClick={startEditingTeamSize}
                          className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg border border-purple-200 hover:bg-purple-50 transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="number"
                            min="1"
                            value={teamSizeLimit}
                            onChange={(e) => setTeamSizeLimit(e.target.value)}
                            placeholder="Enter limit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSetTeamSizeLimit}
                            disabled={isSettingTeamSize}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSettingTeamSize ? "Saving..." : (currentLimits.StudentTeamSizeLimit !== null ? "Update" : "Set Limit")}
                          </button>
                          {isEditingTeamSize && (
                            <button
                              onClick={cancelEditingTeamSize}
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activities */}
              {/* <div className="lg:col-span-2 bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                {isLoading ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <Skeleton height={24} width={150} />
                      <Skeleton height={20} width={80} />
                    </div>
                    <div className="relative border-l-2 border-orange-200 pl-6 space-y-6">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="relative">
                          <Skeleton circle height={16} width={16} className="absolute -left-[13px] top-1" />
                          <Skeleton height={60} className="ml-4" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-amber-800">
                        Recent Activities
                      </h2>
                      <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-full">
                        {recentActivities.length} updates
                      </span>
                    </div>

                    <div className="relative border-l-2 border-orange-200 pl-6 space-y-6">
                      {recentActivities.map((a) => (
                        <div key={a.id} className="relative">
                          <span className="absolute -left-[13px] top-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-4 border-white shadow-md"></span>

                          <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-amber-800">
                                {a.text}
                              </p>
                              <span className="text-xs text-amber-600/70 bg-white px-2 py-1 rounded-md">
                                {a.time} ago
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div> */}

              {/* Actions */}
              <aside className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6 flex flex-col">
                {isLoading ? (
                  <>
                    <Skeleton height={20} width={100} className="mb-4" />
                    <div className="flex flex-col gap-4 flex-1">
                      <Skeleton height={48} />
                      <Skeleton height={48} />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-amber-800 mb-4">
                      Quick Actions
                    </h3>

                    <div className="flex flex-col gap-4 flex-1">
                      <button
                        onClick={() => navigate("/dept_view_allocations")}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center"
                      >
                        View Allocations
                      </button>

                      <button
                        onClick={() => navigate("/dept_enforce_deadlines")}
                        className="flex-1 bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium rounded-xl shadow-md hover:from-orange-500 hover:to-rose-500 transition-all flex items-center justify-center"
                      >
                        Manage Events
                      </button>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
      <p className="text-sm text-amber-600/70">{title}</p>
      <h3 className="text-2xl font-bold text-amber-800 mt-1">{value}</h3>
    </div>
  );
}