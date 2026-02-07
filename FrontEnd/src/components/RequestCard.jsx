import React from 'react';

const RequestCard = ({ request }) => {
    const { applicationId, appliedOn, totalApplications, project, status } = request;

    // Status color mapping
    const statusStyles = {
        PENDING: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            border: 'border-amber-300',
            cardBorder: 'border-l-amber-400'
        },
        APPROVED: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-300',
            cardBorder: 'border-l-emerald-500'
        },
        REJECTED: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-300',
            cardBorder: 'border-l-red-500'
        }
    };

    const currentStatus = statusStyles[status] || statusStyles.PENDING;
    
    return (
        <div className={`bg-white rounded-xl border border-orange-200/60 border-l-4 ${currentStatus.cardBorder} shadow-sm hover:shadow-lg hover:scale-[1.01] hover:border-orange-300 hover:bg-gradient-to-r hover:from-white hover:to-amber-50/30 transition-all duration-300 overflow-hidden cursor-pointer`}>
            {/* Mobile/Medium: Stacked Layout | Desktop: Long Horizontal Layout */}
            <div className='flex flex-col lg:flex-row lg:items-center p-4 gap-4 lg:gap-6'>
                {/* Project Info */}
                <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-start lg:items-center gap-3 mb-2 flex-wrap'>
                        <h2 className='text-lg font-semibold text-amber-900 leading-tight'>
                            {project.projectTitle}
                        </h2>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                            project.availableSlots > 0 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {project.availableSlots > 0 ? `${project.availableSlots} slots` : 'Full'}
                        </span>
                    </div>
                    
                    {/* Faculty */}
                    <div className='flex items-center gap-2'>
                        <svg className="w-4 h-4 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className='text-sm text-amber-700'>{project.facultyName}</span>
                    </div>
                </div>

                {/* Mobile: Horizontal row for meta info | Desktop: Continue in row */}
                <div className='flex justify-between flex-wrap items-center gap-4 lg:gap-0'>
                    {/* Desktop Divider */}
                    <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                    {/* Applied Date */}
                    <div className='flex items-center gap-2 lg:mx-6'>
                        <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                        </svg>
                        <div>
                            <p className='text-xs text-amber-500'>Applied on</p>
                            <p className='text-sm font-medium text-amber-800'>{appliedOn}</p>
                        </div>
                    </div>

                    {/* Desktop Divider */}
                    <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                    {/* Competitors */}
                    <div className='flex items-center gap-2 lg:mx-6'>
                        <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        <div>
                            <p className='text-xs text-amber-500'>Competitors</p>
                            <p className='text-sm font-medium text-amber-800'>{totalApplications}</p>
                        </div>
                    </div>

                    {/* Desktop Divider */}
                    <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                    {/* Status */}
                    <div className='flex items-center gap-2 lg:ml-6'>
                        <div className={`px-4 py-2 rounded-lg ${currentStatus.bg} ${currentStatus.border} border`}>
                            <p className='text-xs text-gray-500 mb-0.5'>Status</p>
                            <p className={`text-sm font-bold ${currentStatus.text}`}>
                                {status || 'PENDING'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;