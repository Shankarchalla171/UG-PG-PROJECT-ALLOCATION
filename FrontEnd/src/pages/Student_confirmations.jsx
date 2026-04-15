import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ConfirmationCard from "../components/ConfirmationCard";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Student_confirmations = () => {
    const [confirmations, setConfirmations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { token } = useContext(AuthContext);


     console.log('Token from context:', token);
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    
    // Fetch confirmations on component mount
    useEffect(() => {
        fetchConfirmations();
    }, []);

    const fetchConfirmations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/confirmations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch confirmations: ${response.status}`);
            }

            const data = await response.json();
            setConfirmations(data);
        } catch (err) {
            console.error('Error fetching confirmations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (confirmation) => {
    setProcessingId(confirmation.applicationId);
    setError(null);
    
    try {
        const response = await fetch(`${API_URL}/api/confirmations/${confirmation.applicationId}/confirm`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Only team lead can confirm projects');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm');
            }
        }

        // Get the finalized application from response
        const finalizedApplication = await response.json();
        
        // Update the state with the new list:
        // - Keep the finalized application (with allocated=true)
        // - Remove all other applications (they become TEAM_REJECTED)
        setConfirmations([finalizedApplication]);
        
    } catch (err) {
        console.error('Error confirming:', err);
        setError(err.message);
    } finally {
        setProcessingId(null);
    }
};

    const handleReject = async (confirmation) => {
        setProcessingId(confirmation.applicationId);
        setError(null);
        
        try {
            const response = await fetch(`${API_URL}/api/confirmations/${confirmation.applicationId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Only team lead can reject projects');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to reject');
                }
            }

            // Remove the rejected item from list
            setConfirmations(prev => prev.filter(c => c.applicationId !== confirmation.applicationId));
            
            // Show success message (you can add a toast notification here)
            console.log('Successfully rejected project');
            
        } catch (err) {
            console.error('Error rejecting:', err);
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const ConfirmationSkeleton = () => (
        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-5 animate-pulse">
            <div className="flex items-start justify-between gap-4">
                
                {/* Left content */}
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
            <Navbar />
            <main className="flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                <Sidebar />
                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-3">
                            <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                            Confirmations
                        </h1>
                        <p className="text-sm text-amber-600 mt-1 ml-10">Review and respond to your project approvals</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats Bar */}
                    {loading ? (
                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6 animate-pulse">
                            <div className="flex flex-wrap items-center gap-6">
                                
                                {/* Left section */}
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

                                {/* Right section */}
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6">
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs text-amber-500">Pending Confirmations</p>
                                        <p className="text-lg font-bold text-amber-900">{confirmations.length}</p>
                                    </div>
                                </div>

                                <div className="hidden sm:block w-px h-10 bg-orange-200"></div>

                                <div className="flex items-center gap-2 text-sm text-amber-600">
                                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                    </svg>
                                    <span>Accept or reject project invitations from faculty</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <ConfirmationSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Confirmations List */}
                    {!loading && (
                        <div className="space-y-4">
                            {confirmations.length > 0 ? (
                                confirmations.map(confirmation => (
                                    <ConfirmationCard 
                                        key={confirmation.applicationId} 
                                        confirmation={confirmation}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                        isProcessing={processingId === confirmation.applicationId}
                                    />
                                ))
                            ) : (
                                <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <p className="text-lg font-medium text-amber-700">No confirmations yet</p>
                                    <p className="text-sm text-amber-500 mt-1">You'll see project confirmations here when faculty approve your applications</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default Student_confirmations;