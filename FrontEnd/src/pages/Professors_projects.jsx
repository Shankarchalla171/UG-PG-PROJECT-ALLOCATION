import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ProfessorViewProjects = () => {
    // Dummy projects data
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: "AI-Powered Learning Management System",
            description: "Develop an intelligent LMS that adapts to student learning patterns and provides personalized recommendations.",
            numberOfInterns: 3,
            domain: "Machine Learning & Web Development",
            requirements: "Python, TensorFlow, React, Node.js, MongoDB",
            duration: 16,
            status: "Active",
            applicants: 5
        },
        {
            id: 2,
            title: "Blockchain-based Academic Certificate Verification",
            description: "Create a secure system for storing and verifying academic certificates using blockchain technology.",
            numberOfInterns: 2,
            domain: "Blockchain & Cybersecurity",
            requirements: "Solidity, Ethereum, React, Smart Contracts",
            duration: 12,
            status: "Active",
            applicants: 3
        },
        {
            id: 3,
            title: "IoT Smart Campus Solution",
            description: "Develop IoT devices and dashboard to monitor campus facilities, energy usage, and security.",
            numberOfInterns: 4,
            domain: "IoT & Embedded Systems",
            requirements: "C++, Python, Raspberry Pi, AWS IoT",
            duration: 20,
            status: "Active",
            applicants: 8
        },
        {
            id: 4,
            title: "AR/VR Lab Simulations",
            description: "Create virtual reality simulations for physics and chemistry laboratory experiments.",
            numberOfInterns: 2,
            domain: "AR/VR Development",
            requirements: "Unity, C#, Blender, Oculus SDK",
            duration: 14,
            status: "Completed",
            applicants: 0
        },
        {
            id: 5,
            title: "Data Analytics Platform for Student Performance",
            description: "Build a dashboard to analyze and visualize student performance data to identify learning gaps.",
            numberOfInterns: 3,
            domain: "Data Science & Visualization",
            requirements: "Python, Pandas, D3.js, PostgreSQL",
            duration: 18,
            status: "Active",
            applicants: 6
        },
        {
            id: 6,
            title: "Mobile App for Campus Navigation",
            description: "Develop a mobile application with indoor navigation, event notifications, and campus services.",
            numberOfInterns: 2,
            domain: "Mobile Development",
            requirements: "React Native, Firebase, Google Maps API",
            duration: 10,
            status: "Pending",
            applicants: 2
        }
    ]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            setProjects(projects.filter(project => project.id !== id));
        }
    };

    const handleEdit = (id) => {
        // For now, just log which project to edit
        console.log("Edit project with id:", id);
        alert(`Editing project with ID: ${id}`);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-amber-800">Your Projects</h1>
                            <p className="text-amber-600/70 mt-2">Manage and track all your projects</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600/70">Total Projects</p>
                                        <h3 className="text-2xl font-bold text-amber-800 mt-1">{projects.length}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600/70">Active Projects</p>
                                        <h3 className="text-2xl font-bold text-amber-800 mt-1">{projects.filter(p => p.status === 'Active').length}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600/70">Total Applicants</p>
                                        <h3 className="text-2xl font-bold text-amber-800 mt-1">{projects.reduce((sum, project) => sum + project.applicants, 0)}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3.65a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-white rounded-2xl border border-orange-200/60 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300">
                                    {/* Project Header */}
                                    <div className="p-6 border-b border-orange-200/60">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(project.id)}
                                                    className="p-2 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300"
                                                    title="Edit Project"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-2 rounded-lg text-rose-700 hover:bg-rose-100 hover:text-rose-600 transition-all duration-300"
                                                    title="Delete Project"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-amber-800 line-clamp-1">{project.title}</h3>
                                        <p className="text-sm text-amber-600/70 mt-2 line-clamp-2">{project.description}</p>
                                    </div>

                                    {/* Project Details */}
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600/70">Interns Needed</p>
                                                    <p className="text-sm font-medium text-amber-800">{project.numberOfInterns} positions</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600/70">Domain</p>
                                                    <p className="text-sm font-medium text-amber-800">{project.domain}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600/70">Duration</p>
                                                    <p className="text-sm font-medium text-amber-800">{project.duration} weeks</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600/70">Applicants</p>
                                                    <p className="text-sm font-medium text-amber-800">{project.applicants} applied</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements Preview */}
                                        <div className="mt-6">
                                            <p className="text-xs text-amber-600/70 mb-2">Skills Required</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.requirements.split(', ').slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {project.requirements.split(', ').length > 3 && (
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-lg">
                                                        +{project.requirements.split(', ').length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        {/* <button className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-orange-50 to-rose-50 text-amber-800 font-medium rounded-xl border border-orange-200 hover:from-orange-100 hover:to-rose-100 transition-all duration-300 flex items-center justify-center gap-2">
                                            <span>View Details</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button> */}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State (if no projects) */}
                        {projects.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-amber-800 mb-2">No Projects Yet</h3>
                                <p className="text-amber-600/70 mb-6">Create your first project to get started</p>
                                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-orange-500/25">
                                    Create New Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorViewProjects;