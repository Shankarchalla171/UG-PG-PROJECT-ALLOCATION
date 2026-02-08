import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import student_confirmations from "../../public/dummyData/studentConfirmations";
import ConfirmationCard from "../components/ConfirmationCard";

const Student_confirmations = () => {
    const [confirmations, setConfirmations] = useState([]);

    useEffect(() => {
        //fetch the confirmations of the logged in student and set it to confirmations state
        setConfirmations(student_confirmations);
    }, []);

    const handleAccept = (confirmation) => {
        // TODO: Handle accept logic
        console.log('Accepted:', confirmation);
    };

    const handleReject = (confirmation) => {
        // TODO: Handle reject logic
        console.log('Rejected:', confirmation);
    };

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
                        <p className="text-sm text-amber-600 mt-1 ml-10">Review and respond to your project confirmations</p>
                    </div>

                    {/* Stats Bar */}
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

                    {/* Confirmations List */}
                    <div className="space-y-4">
                        {confirmations.length > 0 ? (
                            confirmations.map(confirmation =>
                                confirmation?.confirmationId ? (
                                    <ConfirmationCard 
                                        key={confirmation.confirmationId} 
                                        confirmation={confirmation}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                    />
                                ) : null
                            )
                        ) : (
                            <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                                <p className="text-lg font-medium text-amber-700">No confirmations yet</p>
                                <p className="text-sm text-amber-500 mt-1">You'll see project confirmations here when faculty approves your applications</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Student_confirmations;