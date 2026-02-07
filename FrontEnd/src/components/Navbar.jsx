import { React } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
            isActive
                ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-amber-800 hover:bg-orange-100 hover:text-orange-600'
        }`;

    return (
        <header className="sticky top-0 z-50 flex w-full justify-between items-center px-6 py-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 text-amber-900 border-b border-orange-200/60 shadow-sm hover:cursor-pointer">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                {/* Hamburger Menu */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-500/25">
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent tracking-tight">
                        EduProject
                    </h1>
                    <p className="text-xs text-amber-600 -mt-0.5">Project Allocation</p>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex items-center">
                {/* Profile */}
                <NavLink to="/profile" className={navLinkClasses} title="Profile">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </NavLink>
            </nav>
        </header>
    );
};

export default Navbar;