import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const StudentDashboard = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/students/dashboard`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message);
            }

            const data = await response.json();
            console.log("Fetched dashboard data:", data);
            setDashboardData(data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error.message);
        }
    };

    const fetchRecentApplications = async () => {
        try {
            const response = await fetch(`${API_URL}/api/students/applications?page=0&size=3`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message);
            }

            const data = await response.json();
            console.log("Fetched recent applications:", data);
            setRecentApplications(data?.content || data || []);
        } catch (error) {
            console.error("Error fetching recent applications:", error.message);
        }
    };

    useEffect(() => {
        if (token) {
            Promise.all([fetchDashboardData(), fetchRecentApplications()])
                .finally(() => setLoading(false));
        }
    }, [token]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'CONFIRMED':
            case 'APPROVED':
                return 'bg-green-100 text-green-700';
            case 'REJECTED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading || !dashboardData) {
        return (
            <>
                <Navbar />
                <main className="flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                    <Sidebar />
                    <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-amber-600">Loading dashboard...</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                <Sidebar />
                <div className="flex-1 p-6">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-amber-900 mb-2">
                            Welcome back, {dashboardData.name?.split(" ")[0]}!
                        </h1>
                        <p className="text-amber-600">
                            Here's your project allocation dashboard. Track your applications and confirmations.
                        </p>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`${API_URL}/${dashboardData.profilePhotoLink}`}
                                    alt={dashboardData.name}
                                    className="w-16 h-16 rounded-full border-2 border-orange-200 object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dashboardData.name)}&background=f97316&color=fff`;
                                    }}
                                />
                                <div>
                                    <p className="text-sm text-amber-500 font-medium">Logged in as</p>
                                    <h2 className="text-xl font-bold text-amber-900">{dashboardData.name}</h2>
                                    <p className="text-sm text-amber-600">{dashboardData.rollNumber} • {dashboardData.departmentName}</p>
                                    <p className="text-sm text-amber-500">{dashboardData.collegeEmailId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/profile")}
                                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Application Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-500 font-medium">Total Applications</p>
                                    <p className="text-2xl font-bold text-amber-900 mt-1">{dashboardData.totalApplication || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-500 font-medium">Pending</p>
                                    <p className="text-2xl font-bold text-amber-900 mt-1">{dashboardData.pending || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-500 font-medium">Approved</p>
                                    <p className="text-2xl font-bold text-amber-900 mt-1">{dashboardData.approved || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-500 font-medium">Rejected</p>
                                    <p className="text-2xl font-bold text-amber-900 mt-1">{dashboardData.rejected || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => navigate("/student_view_projects")}
                            className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl shadow-md p-6 text-white hover:shadow-lg hover:from-orange-500 hover:to-orange-600 transition-all transform hover:scale-105 hover:cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-300/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-lg">Browse Projects</p>
                                    <p className="text-orange-100 text-sm">Explore available projects</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/student_applications")}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md p-6 text-white hover:shadow-lg hover:from-amber-500 hover:to-amber-600 transition-all transform hover:scale-105 hover:cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-300/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-lg">My Applications</p>
                                    <p className="text-amber-100 text-sm">Track your applications</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                                Recent Applications
                            </h3>
                            <button
                                onClick={() => navigate("/student_applications")}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                View All →
                            </button>
                        </div>

                        {recentApplications.length > 0 ? (
                            <div className="space-y-3">
                                {recentApplications.map((app) => (
                                    <div
                                        key={app.applicationId}
                                        className="flex items-start justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-100/50 hover:border-orange-200 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-amber-900">{app.projectTitle}</p>
                                            <p className="text-sm text-amber-600">{app.facultyName}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(app.status)}`}>
                                                    {app.status}
                                                </span>
                                                <span className="text-xs text-amber-500">Applied on {formatDate(app.appliedOn)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-amber-900">{app.competitors || 0}</p>
                                            <p className="text-xs text-amber-600">applicants</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 mx-auto mb-3 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                                <p className="text-amber-600">No applications yet. Start exploring projects!</p>
                            </div>
                        )}
                    </div>

                    {/* Important Notice */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/60 shadow-sm p-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-900 mb-1">Application Deadline</h4>
                                <p className="text-sm text-amber-700">
                                    Submit your project preferences before the deadline. Ensure your applications are properly reviewed by the faculty coordinators.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default StudentDashboard;
