import React from 'react';

const ProjectCard = ({ project, activeProjectId, setActiveProjectId }) => {
    const { id,projectTitle, facultyName, domains, availableSlots } = project;
    return (
        <div className='group bg-white rounded-xl border border-orange-200/60 shadow-sm hover:shadow-xl hover:border-orange-300 hover:scale-[1.02] transition-all duration-200 ease-out overflow-hidden hover:cursor-pointer'
          onClick={()=>setActiveProjectId(id)}
        >
            {/* Header */}
            <div className='p-5 pb-4'>
                <div className='flex items-start justify-between gap-3 mb-3'>
                    <h3 className='text-lg font-semibold text-amber-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2'>
                        {projectTitle}
                    </h3>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                        availableSlots > 0 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {availableSlots > 0 ? `${availableSlots} slots` : 'Full'}
                    </span>
                </div>

                <div className='flex items-center gap-2 text-sm text-amber-700'>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span>{facultyName}</span>
                </div>
            </div>

            {/* Domains */}
            <div className='px-5 pb-4'>
                <div className='flex flex-wrap gap-2'>
                    {domains.map((domain, index) => (
                        <span 
                            key={index}
                            className='px-3 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg text-xs font-medium text-amber-800'
                        >
                            {domain}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className='px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-orange-100 '>
                <button className='w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:cursor-pointer'
                    onClick={() => setActiveProjectId(id)}
                >
                    View Details
                </button>
            </div>
        </div>
    )
}

export default ProjectCard;