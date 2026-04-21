import React from 'react';

const ProjectCard = ({ project, activeProjectId, setActiveProjectId }) => {
    const {
        id,
        projectTitle,
        facultyName,
        domains,
        availableSlots,
        description,
        duration,
        preRequisites,
        applied,
        appliedOn,
    } = project;

    const isActive = activeProjectId === id;

    // Parse prerequisites string into individual chips (split by comma or semicolon)
    const prereqList = preRequisites
        ? preRequisites.split(/[,;]/).map(s => s.trim()).filter(Boolean)
        : [];

    return (
        <div
            onClick={() => setActiveProjectId(id)}
            className={`group bg-white rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer
                ${isActive
                    ? 'border-orange-400 ring-2 ring-orange-300'
                    : 'border-orange-200/60 hover:border-orange-300'
                }`}
        >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="p-6 border-b border-orange-200/60">
                <div className="flex justify-between items-start mb-3">
                    {/* Applied / Slots badge */}
                    {applied ? (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            Applied
                        </span>
                    ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            availableSlots > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {availableSlots > 0 ? `${availableSlots} slots open` : 'Full'}
                        </span>
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-amber-800 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 mb-2">
                    {projectTitle}
                </h3>

                {/* Description */}
                <p className="text-sm text-amber-600/70 line-clamp-2">
                    {description || 'No description provided'}
                </p>
            </div>

            {/* ── Details ──────────────────────────────────────────────────── */}
            <div className="p-6 space-y-3">

                {/* Faculty */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-amber-600/70">Faculty</p>
                        <p className="text-sm font-medium text-amber-800">{facultyName || 'Unknown'}</p>
                    </div>
                </div>

                {/* Domains */}
                {domains?.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-amber-600/70 mb-1">Domains</p>
                            <div className="flex flex-wrap gap-1.5">
                                {domains.slice(0, 3).map((d, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg text-xs font-medium text-amber-800">
                                        {d}
                                    </span>
                                ))}
                                {domains.length > 3 && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-lg border border-amber-200">
                                        +{domains.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Slots + Duration row
                <div className="flex gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-amber-600/70">Slots</p>
                            <p className={`text-sm font-medium ${availableSlots > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {availableSlots > 0 ? `${availableSlots} open` : 'Full'}
                            </p>
                        </div>
                    </div>

                    {duration && (
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-amber-600/70">Duration</p>
                                <p className="text-sm font-medium text-amber-800">{duration} sem</p>
                            </div>
                        </div>
                    )}
                </div> */}

                {/* Prerequisites */}
                {prereqList.length > 0 && (
                    <div className="mt-1">
                        <p className="text-xs text-amber-600/70 mb-1.5">Prerequisites</p>
                        <div className="flex flex-wrap gap-1.5">
                            {prereqList.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                                    {skill}
                                </span>
                            ))}
                            {prereqList.length > 3 && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-lg border border-amber-200">
                                    +{prereqList.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-orange-100">
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveProjectId(id); }}
                    className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;