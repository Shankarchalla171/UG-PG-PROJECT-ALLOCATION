import React, { useState } from "react";
/* ─── Animated Card Component ─────────────────────────────────────────────── */
const CollaborationCard = ({ request, activeTab, onAccept, onReject, actionLoading, index, apiUrl }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imgError, setImgError] = useState(false);
    const isPending = request.status === "PENDING";
    const isActionLoading = actionLoading === request.id;

    // Get the appropriate profile photo based on tab
    const profilePhotoPath = activeTab === "sent" 
        ? request.receiverProfilePhotoPath 
        : request.senderProfilePhotoPath;
    
    const profileName = activeTab === "sent" ? request.receiverName : request.senderName;
    const initials = profileName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { 
                bg: "bg-amber-50", 
                text: "text-amber-700", 
                border: "border-amber-200",
                icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
                label: "Pending",
                pulse: true
            },
            ACCEPTED: { 
                bg: "bg-emerald-50", 
                text: "text-emerald-700", 
                border: "border-emerald-200",
                icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
                label: "Accepted",
                pulse: false
            },
            REJECTED: { 
                bg: "bg-red-50", 
                text: "text-red-700", 
                border: "border-red-200",
                icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
                label: "Rejected",
                pulse: false
            },
        };
        return configs[status] || configs.PENDING;
    };

    const statusConfig = getStatusConfig(request.status);

    return (
        <div
            className="animate-fadeSlideIn"
            style={{ animationDelay: `${index * 50}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`
                relative bg-white rounded-2xl border-l-4 overflow-hidden
                transition-all duration-300 ease-out
                ${isPending ? 'border-l-amber-400' : request.status === 'ACCEPTED' ? 'border-l-emerald-400' : 'border-l-red-400'}
                ${isHovered 
                    ? 'shadow-xl shadow-orange-100/50 border-orange-300 -translate-y-1 scale-[1.01]' 
                    : 'shadow-md border-orange-200/60'}
            `}>
                {/* Subtle gradient overlay on hover */}
                <div className={`
                    absolute inset-0 bg-gradient-to-r from-orange-50/0 via-amber-50/0 to-orange-50/0
                    transition-all duration-300 pointer-events-none
                    ${isHovered ? 'from-orange-50/40 via-amber-50/20 to-orange-50/40' : ''}
                `} />

                <div className="relative p-5">
                    <div className="flex items-center gap-4">
                        {/* Left: Profile Photo */}
                        <div className={`
                            w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden
                            transition-all duration-300 ring-2 ring-offset-2
                            ${isPending ? 'ring-amber-200' : request.status === 'ACCEPTED' ? 'ring-emerald-200' : 'ring-red-200'}
                            ${isHovered ? 'ring-orange-200' : ''}
                        `}>
                            {profilePhotoPath && !imgError ? (
                                <img 
                                    src={`${apiUrl}/${profilePhotoPath}`}
                                    alt={profileName}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center text-sm font-semibold
                                    bg-gradient-to-br from-orange-400 to-amber-500 text-white`}>
                                    {initials}
                                </div>
                            )}
                        </div>

                        {/* Middle: Project Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className={`
                                text-lg font-semibold text-amber-900 truncate
                                transition-colors duration-200
                                ${isHovered ? 'text-orange-700' : ''}
                            `}>
                                {request.projectTitle}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5 text-amber-600">
                                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={activeTab === "sent" 
                                            ? "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
                                            : "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                                        }/>
                                    </svg>
                                    <span className="font-medium">
                                        {activeTab === "sent" ? `To: ` : `From: `}
                                    </span>
                                    <span className="text-amber-800">
                                        {activeTab === "sent" ? request.receiverName : request.senderName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Status Badge & Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Status Badge */}
                            <div className={`
                                relative px-3 py-1.5 rounded-full text-xs font-semibold
                                border transition-all duration-200
                                ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}
                                ${isHovered ? 'scale-105' : ''}
                            `}>
                                <div className="flex items-center gap-1.5">
                                    {statusConfig.pulse && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                    )}
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={statusConfig.icon}/>
                                    </svg>
                                    {statusConfig.label}
                                </div>
                            </div>

                            {/* Action Buttons for Received Pending */}
                            {activeTab === "received" && isPending && (
                                <div className={`
                                    flex items-center gap-2 transition-all duration-300
                                    ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-80'}
                                `}>
                                    <button
                                        onClick={() => onAccept(request.id)}
                                        disabled={isActionLoading}
                                        className="group relative px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                            hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium 
                                            rounded-xl transition-all duration-200 flex items-center gap-2
                                            shadow-md shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-300/50
                                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md
                                            active:scale-95"
                                    >
                                        {isActionLoading ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        )}
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => onReject(request.id)}
                                        disabled={isActionLoading}
                                        className="group relative px-4 py-2.5 bg-white border-2 border-red-200
                                            hover:bg-red-50 hover:border-red-300 text-red-600 text-sm font-medium 
                                            rounded-xl transition-all duration-200 flex items-center gap-2
                                            shadow-sm hover:shadow-md
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            active:scale-95"
                                    >
                                        {isActionLoading ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                            </svg>
                                        )}
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationCard;