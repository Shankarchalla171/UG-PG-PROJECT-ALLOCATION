import React, { useState } from "react";

const ConfirmationCard = ({ confirmation, onAccept, onReject }) => {
    const { confirmedOn, application } = confirmation;
    const { project } = application;
    const [isHovered, setIsHovered] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Auto-hide toast after 3 seconds
    React.useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleAccept = () => {
        setToast({ show: true, type: 'success', message: 'Project accepted successfully!' });
        onAccept?.(confirmation);
    };

    const handleReject = () => {
        setToast({ show: true, type: 'error', message: 'Project rejected.' });
        onReject?.(confirmation);
    };

    return (
        <div 
            className="relative bg-white rounded-xl border border-orange-200/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >


            <div className="p-5">
                {/* Main Content */}
                <div className="flex flex-col sm:flex-row lg:items-center gap-4">
                    {/* Left: Project Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-amber-900 mb-2 leading-tight">
                            {project?.projectTitle}
                        </h3>
                        
                        {/* Faculty */}
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span className="text-sm text-amber-700">{project?.facultyName}</span>
                        </div>

                        {/* Meta Info Row */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Slots */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                project?.availableSlots > 0 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                                {project?.availableSlots > 0 ? `${project.availableSlots} slots` : 'Full'}
                            </span>

                            {/* Date */}
                            <div className="flex items-center gap-1.5 text-xs text-amber-600">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                                </svg>
                                <span>Approved on: {confirmedOn}</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider - visible on sm and above */}
                    <div className="hidden sm:block w-px h-16 bg-orange-200 shrink-0"></div>

                    {/* Right: Action Buttons */}
                    <div className="flex justify-between items-center gap-3 shrink-0">
                        <button
                            onClick={handleAccept}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                            Accept
                        </button>
                        <button
                            onClick={handleReject}
                            className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                            </svg>
                            Reject
                        </button>
                    </div>
                </div>

                {/* Hover Description Panel */}
                <div className={`overflow-hidden transition-all duration-300 ease-out ${
                    isHovered ? 'max-h-32 opacity-100 mt-4 pt-4 border-t border-orange-100' : 'max-h-0 opacity-0 mt-0 pt-0'
                }`}>
                    <p className="text-sm text-amber-700 leading-relaxed">
                        <span className="font-medium text-amber-800">Description: </span>
                        {project?.description || 'No description available.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationCard;