// components/ConfirmationCard.jsx
import React from "react";

const ConfirmationCard = ({ confirmation, onAccept, onReject, isProcessing }) => {
    return (
        <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Left Section - Project Details */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                        {confirmation.projectTitle}
                    </h3>
                    
                    <p className="text-sm text-amber-600 mb-3">
                        {confirmation.projectDescription}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full">
                            Duration: {confirmation.duration}
                        </span>
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full">
                            Faculty: {confirmation.facultyName}
                        </span>
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full">
                            Available Slots: {confirmation.projectAvailableSlots}
                        </span>
                    </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex flex-row md:flex-col items-center gap-2">
                    {confirmation.canConfirm ? (
                        <>
                            <button
                                onClick={() => onAccept(confirmation)}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                                onClick={() => onReject(confirmation)}
                                disabled={isProcessing}
                                className="px-6 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        <div className="text-sm text-amber-500 bg-amber-50 px-4 py-2 rounded-lg">
                            {confirmation.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Message */}
            {confirmation.message && confirmation.canConfirm && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
                    ℹ️ {confirmation.message}
                </div>
            )}
        </div>
    );
};

export default ConfirmationCard;