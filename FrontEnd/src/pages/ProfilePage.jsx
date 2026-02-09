import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

// Import dummy data
import studentData from '../../public/dummyData/student.js';
import facultyData from '../../public/dummyData/faculty.js';

const ProfilePage = () => {
    const { role } = useContext(AuthContext);

    // Initialize profile based on role
    const [profile, setProfile] = useState({});

    useEffect(() => {
        const data = role === 'student' ? studentData : facultyData;
        setProfile({ ...data });
    }, [role]);

    // Field configuration
    const fieldConfig = {
        name: {
            label: 'Full Name',
            icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        },
        rollNo: {
            label: 'Roll Number',
            icon: <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z" />
        },
        email: {
            label: 'Email Address',
            icon: <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        },
        department: {
            label: 'Department',
            icon: <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
        },
        areaOfExpertise: {
            label: 'Area of Expertise',
            icon: <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        },
        gScholarLink: {
            label: 'Google Scholar Link',
            icon: <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
        },
        experience: {
            label: 'Years of Experience',
            icon: <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        }
    };

    // Get fields to display based on role
    const getDisplayFields = () => {
        if (role === 'student') {
            return ['name', 'rollNo', 'email', 'department'];
        }
        return ['name', 'email', 'department', 'areaOfExpertise'];
    };

    const renderFieldValue = (field) => {
        const value = profile[field] || '-';

        if (field === 'gScholarLink' && value !== '-') {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-orange-600 hover:text-orange-700 hover:underline break-all'
                >
                    {value}
                </a>
            );
        }

        if (field === 'experience') {
            return `${value} Years`;
        }

        return value;
    };

    return (
        <>
            <Navbar />
            <div className='flex min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100'>
                <Sidebar />

                {/* Main Content */}
                <main className='flex-1 w-full p-4  '>
                    <div className='p-4 sm:p-6 lg:p-8 w-full flex justify-center'>
                        <div className='w-full  '>
                            {/* Page Header */}
                            <div className='mb-8'>
                                <div className='flex items-center gap-4 mb-2'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200'>
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className='text-2xl sm:text-3xl font-bold text-amber-900'>
                                            My Profile
                                        </h1>
                                        <p className='text-amber-600 mt-0.5'>
                                            {role === 'student' ? 'Your student information' : 'Your faculty information'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Card */}
                            <div className='bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-100/50 overflow-hidden'>
                                {/* Profile Header Banner */}


                                {/* Profile Info Section */}
                                <div className='relative p-6 sm:px-8 pb-8'>
                                    {/* Profile Photo - Positioned to overlap banner */}
                                    <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4  mb-6'>
                                        <div className='relative'>
                                            <div className='w-28 h-28 p-2 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100'>
                                                <img
                                                    src={profile.profilePhoto || 'https://via.placeholder.com/150?text=User'}
                                                    alt="Profile"
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                        </div>

                                        {/* Name and Info */}
                                        <div className='flex-1 text-center sm:text-left sm:pb-2'>
                                            <h2 className='text-2xl sm:text-3xl font-bold text-amber-900'>
                                                {profile.name || 'User Name'}
                                            </h2>
                                            <div className='flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2'>
                                                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-amber-700 rounded-lg text-sm font-medium'>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z" />
                                                    </svg>
                                                    {profile.department || 'Department'}
                                                </span>
                                                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg text-sm font-medium capitalize'>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                    {role}
                                                </span>
                                                {role === 'student' && profile.rollNo && (
                                                    <span className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg text-sm font-medium'>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                                                        </svg>
                                                        {profile.rollNo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className='h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent mb-8'></div>

                                    {/* Info Fields */}
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                        {getDisplayFields().map((field) => (
                                            <div
                                                key={field}
                                                className={`${field === 'areaOfExpertise' || field === 'gScholarLink' ? 'lg:col-span-2' : ''}`}
                                            >
                                                <div className='flex items-center gap-2.5 text-sm font-semibold text-amber-800 mb-2'>
                                                    <span className='w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center text-orange-500'>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            {fieldConfig[field].icon}
                                                        </svg>
                                                    </span>
                                                    {fieldConfig[field].label}
                                                </div>
                                                <div className='px-4 py-3.5 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-orange-100 rounded-xl text-amber-900'>
                                                    {renderFieldValue(field)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Quick Links Card for Faculty */}
                                    {role === 'faculty' && profile.gScholarLink && (
                                        <div className='mt-6 bg-white rounded-2xl shadow-lg shadow-orange-100/30 border border-orange-100/50 p-6'>
                                            <h3 className='text-lg font-bold text-amber-900 flex items-center gap-3 mb-4'>
                                                <div className='w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center'>
                                                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                                                    </svg>
                                                </div>
                                                Quick Links
                                            </h3>
                                            <a
                                                href={profile.gScholarLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className='inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200/50 rounded-xl text-orange-600 hover:text-orange-700 hover:border-orange-300 hover:shadow-md transition-all group'
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
                                                </svg>
                                                <span className='font-medium'>View Google Scholar Profile</span>
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}

                                    {/* Stats Cards for Faculty */}
                                    {role === 'faculty' && (
                                        <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div className='bg-white rounded-2xl shadow-lg shadow-orange-100/30 border border-orange-100/50 p-6'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200'>
                                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className='text-sm text-amber-600 font-medium'>Experience</p>
                                                        <p className='text-2xl font-bold text-amber-900'>{profile.experience || 0} Years</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='bg-white rounded-2xl shadow-lg shadow-orange-100/30 border border-orange-100/50 p-6'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200'>
                                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className='text-sm text-amber-600 font-medium'>Expertise Areas</p>
                                                        <p className='text-lg font-bold text-amber-900 line-clamp-1'>
                                                            {profile.areaOfExpertise?.split(',').length || 0} Fields
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ProfilePage;
