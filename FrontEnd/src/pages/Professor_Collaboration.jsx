import React, { useState, useEffect, useContext, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import CollaborationCard from "../components/CollaborationCard";



/* ─── Main Component ──────────────────────────────────────────────────────── */
const Professor_Collaboration = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { token } = useContext(AuthContext);
    
    const [activeTab, setActiveTab] = useState("received");
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    
    const [toast, setToast] = useState({
        show: false,
        type: '',
        message: ''
    });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const fetchCollaborations = async () => {
        setLoading(true);
        try {
            const [sentRes, receivedRes] = await Promise.all([
                fetch(`${API_URL}/api/collaborations?sent=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/collaborations?sent=false`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (sentRes.ok) {
                const sentData = await sentRes.json();
                setSentRequests(sentData?.content || sentData || []);
            }
            if (receivedRes.ok) {
                const receivedData = await receivedRes.json();
                setReceivedRequests(receivedData?.content || receivedData || []);
            }
        } catch (error) {
            console.error("Error fetching collaborations:", error);
            showToast('error', 'Failed to load collaboration requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCollaborations();
        }
    }, [token]);

    const handleAccept = async (id) => {
        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/api/collaborations/${id}?accept=true`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                showToast('success', 'Collaboration request accepted successfully!');
                fetchCollaborations();
            } else {
                showToast('error', 'Failed to accept request');
            }
        } catch (error) {
            console.error("Error accepting collaboration:", error);
            showToast('error', 'Failed to accept request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/api/collaborations/${id}?accept=false`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                showToast('success', 'Collaboration request declined');
                fetchCollaborations();
            } else {
                showToast('error', 'Failed to decline request');
            }
        } catch (error) {
            console.error("Error rejecting collaboration:", error);
            showToast('error', 'Failed to decline request');
        } finally {
            setActionLoading(null);
        }
    };

    const currentRequests = activeTab === "sent" ? sentRequests : receivedRequests;
    
    const filteredRequests = useMemo(() => {
        if (filterStatus === "all") return currentRequests;
        return currentRequests.filter(r => r.status === filterStatus);
    }, [currentRequests, filterStatus]);

    const stats = {
        sent: sentRequests.length,
        received: receivedRequests.length,
        pending: receivedRequests.filter(r => r.status === "PENDING").length,
        accepted: [...sentRequests, ...receivedRequests].filter(r => r.status === "ACCEPTED").length,
    };

    const CollaborationCardSkeleton = () => (
        <div className="bg-white rounded-2xl border border-orange-200/60 shadow-md p-5 animate-pulse">
            <div className="flex items-start justify-between gap-4">
                
                {/* Left */}
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-64 bg-gray-100 rounded"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>

                {/* Right buttons */}
                <div className="flex gap-2">
                    <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Custom animation keyframes */}
            <style>{`
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeSlideIn {
                    animation: fadeSlideIn 0.4s ease-out forwards;
                    opacity: 0;
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out forwards;
                }
            `}</style>

            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/20 to-amber-50/30">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 p-6 max-w-6xl">
                        {/* Toast Notification */}
                        {toast.show && (
                            <div className={`
                                fixed top-20 right-6 z-50 px-5 py-4 rounded-xl shadow-xl border 
                                animate-slideInRight flex items-center gap-3
                                ${toast.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-red-50 border-red-200 text-red-800'}
                            `}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                                }`}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={toast.type === 'success' 
                                            ? "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                            : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                                        }/>
                                    </svg>
                                </div>
                                <span className="font-medium">{toast.message}</span>
                            </div>
                        )}

                        {/* Header */}
                        <div className="mb-8 animate-fadeSlideIn">
                            <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                    </svg>
                                </div>
                                Collaboration Requests
                            </h1>
                            <p className="text-sm text-amber-600 mt-2 ml-[52px]">
                                Manage collaboration requests with other professors
                            </p>
                        </div>

                        {/* Stats Cards */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-orange-200/60 shadow-md p-4 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                <div className="h-6 w-10 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* your existing stats cards */
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: "Sent", value: stats.sent, bg: "from-blue-400 to-blue-500", lightBg: "bg-blue-50", icon: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" },
                                    { label: "Received", value: stats.received, bg: "from-orange-400 to-orange-500", lightBg: "bg-orange-50", icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
                                    { label: "Pending", value: stats.pending, bg: "from-amber-400 to-amber-500", lightBg: "bg-amber-50", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", pulse: stats.pending > 0 },
                                    { label: "Accepted", value: stats.accepted, bg: "from-emerald-400 to-emerald-500", lightBg: "bg-emerald-50", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
                                ].map(({ label, value, bg, lightBg, icon, pulse }, index) => (
                                    <div 
                                        key={label} 
                                        className="animate-fadeSlideIn group cursor-default"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="bg-white rounded-2xl border border-orange-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 overflow-hidden relative">
                                            <div className={`absolute top-0 right-0 w-20 h-20 ${lightBg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                            <div className="flex items-center gap-3 relative">
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d={icon}/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-500 font-medium">{label}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-2xl font-bold text-amber-900">{value}</p>
                                                        {pulse && value > 0 && (
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tabs & Filter */}
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-orange-200/60 shadow-md p-4 mb-6 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                                    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                                    <div className="h-10 w-40 bg-gray-200 rounded-xl ml-auto"></div>
                                </div>
                            </div>
                        ) : (
                            /* existing Tabs & Filter */
                            <div className="bg-white rounded-2xl border border-orange-200/60 shadow-md p-3 mb-6 animate-fadeSlideIn" style={{ animationDelay: '200ms' }}>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Tabs */}
                                    <div className="flex gap-2 p-1 bg-amber-50/50 rounded-xl flex-1">
                                        {[
                                            { key: "received", label: "Received", icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", count: stats.received },
                                            { key: "sent", label: "Sent", icon: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z", count: stats.sent },
                                        ].map(({ key, label, icon, count }) => (
                                            <button
                                                key={key}
                                                onClick={() => { setActiveTab(key); setFilterStatus("all"); }}
                                                className={`
                                                    flex-1 px-4 py-3 rounded-xl text-sm font-medium 
                                                    transition-all duration-300 flex items-center justify-center gap-2
                                                    ${activeTab === key
                                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50 scale-[1.02]"
                                                        : "text-amber-700 hover:bg-white hover:shadow-md"
                                                    }
                                                `}
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d={icon}/>
                                                </svg>
                                                {label}
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-xs font-semibold
                                                    ${activeTab === key 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-amber-100 text-amber-600'}
                                                `}>
                                                    {count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Filter Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                                        </svg>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-4 py-2.5 bg-amber-50/50 border border-orange-200 rounded-xl text-sm text-amber-700 
                                                focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent
                                                cursor-pointer hover:bg-amber-50 transition-colors"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="ACCEPTED">Accepted</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="space-y-4">
                                {[1,2,3,4].map(i => (
                                    <CollaborationCardSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredRequests.length === 0 && (
                            <div className="bg-white rounded-2xl border border-orange-200/60 shadow-md p-16 text-center animate-scaleIn">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                    </svg>
                                </div>
                                <p className="text-xl font-semibold text-amber-800">
                                    {filterStatus !== "all" 
                                        ? `No ${filterStatus.toLowerCase()} requests`
                                        : activeTab === "sent" 
                                            ? "No sent requests yet" 
                                            : "No received requests yet"
                                    }
                                </p>
                                <p className="text-sm text-amber-500 mt-2 max-w-sm mx-auto">
                                    {filterStatus !== "all"
                                        ? "Try selecting a different status filter"
                                        : activeTab === "sent" 
                                            ? "When you invite professors to collaborate on your projects, they'll appear here" 
                                            : "When other professors invite you to collaborate, their requests will appear here"
                                    }
                                </p>
                            </div>
                        )}

                        {/* Requests List */}
                        {!loading && filteredRequests.length > 0 && (
                            <div className="space-y-4">
                                {filteredRequests.map((request, index) => (
                                    <CollaborationCard
                                        key={request.id}
                                        request={request}
                                        activeTab={activeTab}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                        actionLoading={actionLoading}
                                        index={index}
                                        apiUrl={API_URL}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Results count */}
                        {!loading && filteredRequests.length > 0 && (
                            <div className="mt-6 text-center text-sm text-amber-500 animate-fadeSlideIn" style={{ animationDelay: '400ms' }}>
                                Showing {filteredRequests.length} of {currentRequests.length} {activeTab} requests
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Professor_Collaboration;