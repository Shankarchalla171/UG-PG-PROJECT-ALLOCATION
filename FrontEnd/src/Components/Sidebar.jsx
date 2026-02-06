import React from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { useContext } from 'react';


const Sidebar = () => {
    const { role } = useContext(AuthContext);

    const handleSize = () => {
        const sidebar = document.querySelector('.side');
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');
        const links = document.querySelectorAll('.links');
        links.forEach(link => {
            link.classList.toggle('opacity-100');
            link.classList.toggle('opacity-0');
            link.classList.toggle('w-0');
            link.classList.toggle('w-auto');
        })
    }

    const navLinkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25'
            : 'text-amber-800 hover:bg-orange-100/80 hover:text-orange-600'
        }`;

    return (
        <aside className='side w-64 min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 border-r border-orange-200/60 flex flex-col transition-all duration-300 shadow-lg'>
            {/* Toggle Button */}
            <div className='flex justify-end p-4'>
                <button
                    onClick={handleSize}
                    className='p-2 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300'
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Navigation Links */}
            <nav className='flex flex-col gap-4 px-4 flex-1'>
                <NavLink to="/projects" className={navLinkClasses}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className='links opacity-100 w-auto whitespace-nowrap overflow-hidden transition-all duration-300 font-medium'>{role === "student" ? "Projects Available" : "Your Projects"}</span>
                </NavLink>

                {role === "student" && (
                    <>
                        <NavLink to="/applications" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            <span className='links opacity-100 w-auto whitespace-nowrap overflow-hidden transition-all duration-300 font-medium'>Your Applications</span>
                        </NavLink>

                        

                        <NavLink to="/team" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className='links opacity-100 w-auto whitespace-nowrap overflow-hidden transition-all duration-300 font-medium'>Team</span>
                        </NavLink>
                    </>
                )}

                {role === "faculty" && (
                    <>
                        <NavLink to="/request" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" />
                            </svg>
                            <span className='links opacity-100 w-auto whitespace-nowrap overflow-hidden transition-all duration-300 font-medium'>Student Requests</span>
                        </NavLink>
                    </>
                )}
                <NavLink to="/confromations" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className='links opacity-100 w-auto whitespace-nowrap overflow-hidden transition-all duration-300 font-medium'>Confirmations</span>
                </NavLink>
            </nav>

            {/* Footer */}
            <div className='p-4 border-t border-orange-200/60'>
                <div className='links text-xs text-amber-600/70 text-center'>
                    EduProject v1.0
                </div>
            </div>
        </aside>
    )
}

export default Sidebar;