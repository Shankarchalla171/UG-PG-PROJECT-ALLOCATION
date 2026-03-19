import React, { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const SubmitApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    const [project, setProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Fetch available projects and find the matching one
    const fetchProject = async () => {
        try {
            const response = await fetch(`${API_URL}/api/student/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch projects');
            const projects = await response.json();
            
            // Find project matching the ID from URL
            const projectId = parseInt(id, 10);
            const foundProject = projects.find(p => p.id === projectId);
            
            if (!foundProject) {
                throw new Error('Project not found');
            }
            
            setProject(foundProject);
        } catch (error) {
            console.error('Error fetching project:', error);
            setLoadError('Failed to load project details. Please try again.');
            setToast({ show: true, type: 'error', message: 'Failed to load project details' });
        }
    };

    // Fetch team details
    const fetchTeam = async () => {
        try {
            const response = await fetch(`${API_URL}/api/students/team-details`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch team');

            const data = await response.json();

            // IMPORTANT: data.members from TeamDto
            setTeamMembers(data.members || []);

        } catch (error) {
            console.error('Error fetching team:', error);
            setLoadError('Failed to load team details. Please try again.');
            setToast({ show: true, type: 'error', message: 'Failed to load team details' });
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        if (!token) {
            setLoadError('Authentication required. Please log in.');
            setIsLoading(false);
            return;
        }
        
        const loadData = async () => {
            setIsLoading(true);
            setLoadError(null);
            await Promise.all([fetchProject(), fetchTeam()]);
            setIsLoading(false);
        };
        
        loadData();
    }, [id, token]);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleOpenFile = (filePath) => {
        const fullUrl = `${API_URL}/${filePath}`;
        window.open(fullUrl, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/student/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: project.id,
                    message: message
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to submit application');
            }

            // setToast({ show: true, type: 'success', message: 'Application submitted successfully!' });
            // setMessage('');
            
            // // Redirect to your applications page after 2 seconds
            // setTimeout(() => {
            //     navigate('/student_applications');
            // }, 2000);

            navigate('/student_applications', {
                state: {
                    toast: {
                        type: 'success',
                        message: 'Application submitted successfully!'
                    }
                }
            });
        } catch (error) {
            console.error('Error submitting application:', error);
            setToast({ show: true, type: 'error', message: error.message || 'Failed to submit application. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className='flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30'>
                <Sidebar />
                <main className='flex-1 p-6'>
                    {/* Toast Notification */}
                    {toast.show && (
                        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border transition-all duration-300 ${toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                {toast.type === 'success' ? (
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                ) : (
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                )}
                            </svg>
                            <span className='font-medium'>{toast.message}</span>
                            <button
                                onClick={() => setToast({ show: false, type: '', message: '' })}
                                className='ml-2 p-1 hover:bg-black/10 rounded-lg transition-colors'
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-amber-900 flex items-center gap-3'>
                            <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                            Submit Application
                        </h1>
                        <p className='text-sm text-amber-600 mt-1 ml-10'>Fill out the form to apply for this project</p>
                    </div>

                    {isLoading && (
                        <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center'>
                            <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-amber-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className='text-lg font-medium text-amber-700'>Loading...</p>
                            <p className='text-sm text-amber-500 mt-1'>Please wait while we fetch your project and team details</p>
                        </div>
                    )}

                    {loadError && !isLoading && (
                        <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center'>
                            <svg className="w-16 h-16 mx-auto mb-4 text-red-300" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <p className='text-lg font-medium text-red-700'>{loadError}</p>
                            <p className='text-sm text-red-500 mt-1'>Please go back and try again</p>
                        </div>
                    )}

                    {!isLoading && !loadError && project && (
                        <form onSubmit={handleSubmit} className='w-full'>
                            {/* Project Details Card */}
                            <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-6 mb-6'>
                                <h2 className='text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                    </svg>
                                    Project Information
                                </h2>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* Project Title */}
                                    <div>
                                        <label className='block text-xs font-medium text-amber-700 mb-1.5'>Project Title</label>
                                        <div className='px-4 py-3 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900'>
                                            {project.projectTitle}
                                        </div>
                                    </div>

                                    {/* Faculty Name */}
                                    <div>
                                        <label className='block text-xs font-medium text-amber-700 mb-1.5'>Faculty Name</label>
                                        <div className='px-4 py-3 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 flex items-center gap-2'>
                                            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            {project.facultyName}
                                        </div>
                                    </div>
                                </div>

                                {/* Available Slots */}
                                <div className='mt-4'>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${project.availableSlots > 0
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                        </svg>
                                        {project.availableSlots > 0 ? `${project.availableSlots} slots available` : 'No slots available'}
                                    </span>
                                </div>
                            </div>

                            {/* Team Details Card */}
                            <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-6 mb-6'>
                                <h2 className='text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                    </svg>
                                    Team Details
                                </h2>

                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                                    {teamMembers.length > 0 ? (
                                        teamMembers.map((member, index) => (
                                            <div key={index} className='flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-orange-100'>
                                                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm'>
                                                    {member.name?.charAt(0) || 'M'}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium text-amber-900'>{member.name}</p>
                                                    <p className='text-xs text-amber-600'>{member.rollNumber} • {member.collegeEmailId}</p>
                                                </div>
                                                {member.teamRole && member.teamRole.toUpperCase() === 'TEAMLEAD' && (
                                                    <span className='px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full'>
                                                        Leader
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className='text-sm text-amber-600 col-span-full'>No team members found</p>
                                    )}
                                </div>
                            </div>

                            {/* Resume & Message Section */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                                {/* Team Resumes Card */}
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2'>
                                        <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z" />
                                        </svg>
                                        Team Resumes
                                    </h2>

                                    <div className='space-y-3'>
                                        {teamMembers.length > 0 ? (
                                            teamMembers.map((member, index) => (
                                                member.resumePath ? (
                                                    <div key={index} className='flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-orange-100'>
                                                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                                                            <svg className="w-5 h-5 text-orange-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
                                                            </svg>
                                                            <div className='min-w-0 flex-1'>
                                                                <p className='text-sm font-medium text-amber-900 truncate'>{member.name}</p>
                                                                <p className='text-xs text-amber-600'>{member.rollNumber}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenFile(member.resumePath)}
                                                            className='p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0'
                                                            title="View resume"
                                                        >
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M19 4h-3.5l-5.4-5.4c-.3-.3-.8-.3-1.1 0l-5.4 5.4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 12l-4-5h3V5h2v6h3l-4 5z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : null
                                            ))
                                        ) : (
                                            <p className='text-sm text-amber-600 py-3'>No team members yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Message Card */}
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2'>
                                        <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                                        </svg>
                                        Message to Faculty (Optional)
                                    </h2>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Share any additional information, your motivation, or questions for the faculty..."
                                        rows={4}
                                        className='w-full px-4 py-3 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none'
                                    />
                                    <p className='text-xs text-amber-500 mt-2'>{message.length}/500 characters</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className='flex flex-col items-center gap-4  '>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || project.availableSlots === 0}
                                    className={`flex-1 py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting || project.availableSlots === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                            </svg>
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {!isLoading && !loadError && !project && (
                        <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center'>
                            <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <p className='text-lg font-medium text-amber-700'>Project not found</p>
                            <p className='text-sm text-amber-500 mt-1'>The project you're looking for doesn't exist</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default SubmitApplication;