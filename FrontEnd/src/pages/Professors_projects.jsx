import React, { useState, useEffect, useContext, captureOwnerStack } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProfessorViewProjects = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    // Collaborate feature states
    const [showCollaborateModal, setShowCollaborateModal] = useState(false);
    const [collaborateStep, setCollaborateStep] = useState('select'); // 'select' or 'results'
    const [selectedProject, setSelectedProject] = useState(null);
    const [collaborateProfessors, setCollaborateProfessors] = useState([]);
    const [collaborateLoading, setCollaborateLoading] = useState(false);

    // State for editing (includes domain)
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        domain: '',               // added domain
        slots: '',
        prerequisites: '',
        duration: '',
        status: 'Active'
    });

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/projects/professor/my-projects`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            console.log(data);

            // Map backend response to frontend structure
            const mappedProjects = data.map(project => ({
                ...project,
                applicants: 0, // Placeholder; adjust if your backend returns applicants
                slots: Number(project.slots),
                duration: Number(project.duration)
                // domain is directly taken from project.domain (if present)
            }));
            setProjects(mappedProjects);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            setProjects(projects.filter(project => project.projectId !== id));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleEdit = (project) => {
        setEditingId(project.projectId);
        setEditFormData({
            title: project.title,
            description: project.description,
            domain: project.domain || '',           // include domain
            slots: project.slots.toString(),
            prerequisites: project.prerequisites,
            duration: project.duration.toString(),
            status: project.status || 'Active'
        });
        console.log('Editing project:', editFormData);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({
            title: '',
            description: '',
            domain: '',
            slots: '',
            prerequisites: '',
            duration: '',
            status: 'Active'
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            const payload = {
                ...(editFormData.title && { title: editFormData.title }),
                ...(editFormData.description && { description: editFormData.description }),
                ...(editFormData.domain && { domain: editFormData.domain }),   // domain added
                ...(editFormData.slots && { slots: parseInt(editFormData.slots) }),
                ...(editFormData.prerequisites && { prerequisites: editFormData.prerequisites }),
                ...(editFormData.duration && { duration: parseInt(editFormData.duration) }),
                ...(editFormData.status && { status: editFormData.status })
            };

            console.log('Saving edits with payload:', payload);

            const response = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const updatedProject = await response.json();
            console.log('Updated project:', updatedProject);

            setProjects(projects.map(proj =>
                proj.projectId === id
                    ? {
                        ...proj,
                        ...updatedProject,
                        slots: Number(updatedProject.slots),
                        duration: Number(updatedProject.duration),
                        applicants: proj.applicants
                    }
                    : proj
            ));

            setEditingId(null);
            setEditFormData({
                title: '',
                description: '',
                domain: '',
                slots: '',
                prerequisites: '',
                duration: '',
                status: 'Active'
            });
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
        // console.log('Input changed:', name, value);
        console.log(editFormData);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Collaborate feature functions
    const handleCollaborateClick = () => {
        setShowCollaborateModal(true);
        setCollaborateStep('select');
        setSelectedProject(null);
        setCollaborateProfessors([]);
    };

    const handleProjectSelect = async (project) => {
        setSelectedProject(project);
        setCollaborateLoading(true);
        
        const requiredSlots = Math.floor(project.slots / 2);
        
        try {
            const url=`${API_URL}/api/professors/${project.projectId}/available-professors`
            console.log(`Fetching collaborating professors from: ${url} with for project: ${project.title} requiring ${requiredSlots} slots`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to send collaboration request: ${errorData}`);
            }

            const professors = await response.json();
            console.log('Collaborating professors:', professors);
            setCollaborateProfessors(professors);
            setCollaborateStep('results');
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setCollaborateLoading(false);
        }
    };

    const handleSendCollaborationRequest = async (professor) => {
       console.log(`Sending collaboration request to Professor ${professor.name} for project ${selectedProject.title}`);
       const url=`${API_URL}/api/collaborations`;
       
       try{
           const response = await fetch(url,{
               method: "POST",
               headers:{
                 "Authorization": `Bearer ${token}`,
                 "Content-Type": "application/json"
               },
               body: JSON.stringify({
                   receiverId: professor.professorId,
                   projectId: selectedProject.projectId,
               }),
            });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(`Failed to send collaboration request: ${errorData}`);
            }

            alert(`Collaboration request sent to Professor ${professor.name}`);
            handleProjectSelect(selectedProject); // Refresh the list 
           
       }catch(err){
           alert(`Error: ${err.message}`);
       }
    };

    const closeCollaborateModal = () => {
        setShowCollaborateModal(false);
        setCollaborateStep('select');
        setSelectedProject(null);
        setCollaborateProfessors([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
                        <div className="max-w-7xl mx-auto text-center py-16">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                            <p className="mt-4 text-amber-600">Loading projects...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
                        <div className="max-w-7xl mx-auto text-center py-16">
                            <div className="text-red-600 mb-4">Error: {error}</div>
                            <button
                                onClick={fetchProjects}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-amber-800">Your Projects</h1>
                                <p className="text-amber-600/70 mt-2">Manage and track all your projects</p>
                            </div>
                            <button
                                onClick={handleCollaborateClick}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Collaborate
                            </button>
                        </div>

                        {/* Stats Cards (unchanged) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* ... same as before ... */}
                        </div>

                        {/* Projects Grid */}
                        {projects.length === 0 ? (
                            <div className="text-center py-16">
                                {/* ... empty state unchanged ... */}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div key={project.projectId} className="bg-white rounded-2xl border border-orange-200/60 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300">
                                        {/* Project Header (status and edit buttons unchanged) */}
                                        <div className="p-6 border-b border-orange-200/60">
                                            <div className="flex justify-between items-start mb-3">
                                                {editingId === project.projectId ? (
                                                    <select
                                                        name="status"
                                                        value={editFormData.status}
                                                        onChange={handleInputChange}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(editFormData.status)} border-0 focus:ring-0 focus:outline-none`}
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Pending">Pending</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                        {project.status || 'Active'}
                                                    </span>
                                                )}
                                                <div className="flex gap-2">
                                                    {editingId === project.projectId ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveEdit(project.projectId)}
                                                                className="p-2 rounded-lg text-green-700 hover:bg-green-100 hover:text-green-600 transition-all duration-300"
                                                                title="Save Changes"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 hover:text-amber-600 transition-all duration-300"
                                                                title="Cancel"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(project)}
                                                                className="p-2 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300"
                                                                title="Edit Project"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(project.projectId)}
                                                                className="p-2 rounded-lg text-rose-700 hover:bg-rose-100 hover:text-rose-600 transition-all duration-300"
                                                                title="Delete Project"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {editingId === project.projectId ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={editFormData.title}
                                                        onChange={handleInputChange}
                                                        className="text-lg font-bold text-amber-800 w-full p-2 border border-amber-200 rounded-lg mb-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                    <textarea
                                                        name="description"
                                                        value={editFormData.description}
                                                        onChange={handleInputChange}
                                                        className="text-sm text-amber-600/70 w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                        rows="2"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold text-amber-800 line-clamp-1">{project.title}</h3>
                                                    <p className="text-sm text-amber-600/70 mt-2 line-clamp-2">{project.description}</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Project Details (includes domain) */}
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {/* Domain Field */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-amber-600/70">Domain</p>
                                                        {editingId === project.projectId ? (
                                                            <input
                                                                type="text"
                                                                name="domain"
                                                                value={editFormData.domain}
                                                                onChange={handleInputChange}
                                                                className="text-sm font-medium text-amber-800 w-full p-1 border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                                                placeholder="e.g., Web Development"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium text-amber-800">{project.domain || 'Not specified'}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Slots */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-amber-600/70">Total Slots</p>
                                                        {editingId === project.projectId ? (
                                                            <input
                                                                type="number"
                                                                name="slots"
                                                                value={editFormData.slots}
                                                                onChange={handleInputChange}
                                                                className="text-sm font-medium text-amber-800 w-full p-1 border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                                                min="1"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium text-amber-800">{project.slots} positions</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Duration */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-amber-600/70">Duration</p>
                                                        {editingId === project.projectId ? (
                                                            <input
                                                                type="number"
                                                                name="duration"
                                                                value={editFormData.duration}
                                                                onChange={handleInputChange}
                                                                className="text-sm font-medium text-amber-800 w-full p-1 border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                                                min="1"
                                                                step="1"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium text-amber-800">{project.duration} weeks</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Applicants (placeholder) */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-amber-600/70">Applicants</p>
                                                        <p className="text-sm font-medium text-amber-800">{project.applicants || 0} applied</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prerequisites / Skills */}
                                            <div className="mt-6">
                                                <p className="text-xs text-amber-600/70 mb-2">Skills Required</p>
                                                {editingId === project.projectId ? (
                                                    <textarea
                                                        name="prerequisites"
                                                        value={editFormData.prerequisites}
                                                        onChange={handleInputChange}
                                                        className="w-full p-2 border border-amber-200 rounded-lg text-sm text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                        rows="2"
                                                        placeholder="Enter skills separated by commas"
                                                    />
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.prerequisites && project.prerequisites.split(', ').slice(0, 3).map((skill, index) => (
                                                            <span key={index} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {project.prerequisites && project.prerequisites.split(', ').length > 3 && (
                                                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-lg">
                                                                +{project.prerequisites.split(', ').length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Collaborate Modal */}
            {showCollaborateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-orange-200 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                            <h2 className="text-xl font-bold text-amber-800">
                                {collaborateStep === 'select' ? 'Select a Project to Collaborate' : 'Available Professors'}
                            </h2>
                            <button
                                onClick={closeCollaborateModal}
                                className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {collaborateLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                                    <p className="mt-4 text-amber-600">Finding professors...</p>
                                </div>
                            ) : collaborateStep === 'select' ? (
                                // Project Selection Step
                                <div className="space-y-3">
                                    {projects.length === 0 ? (
                                        <p className="text-center text-amber-600/70 py-8">No projects available</p>
                                    ) : (
                                        projects.map((project) => (
                                            <div
                                                key={project.projectId}
                                                onClick={() => handleProjectSelect(project)}
                                                className="p-4 border border-orange-200 rounded-xl cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-amber-800">{project.title}</h3>
                                                        <p className="text-sm text-amber-600/70 mt-1">{project.description}</p>
                                                        <div className="flex gap-4 mt-2 text-xs text-amber-600">
                                                            <span>Slots: {project.slots}</span>
                                                            <span>Required: {Math.floor(project.slots / 2)}</span>
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                // Results Step - Professor Cards
                                <div className="space-y-4">
                                    {selectedProject && (
                                        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="text-sm text-amber-700">
                                                <span className="font-medium">Selected Project:</span> {selectedProject.title}
                                            </p>
                                            <p className="text-xs text-amber-600 mt-1">
                                                Looking for professors with {Math.floor(selectedProject.slots / 2)} available slots
                                            </p>
                                        </div>
                                    )}
                                    
                                    {collaborateProfessors.length === 0 ? (
                                        <p className="text-center text-amber-600/70 py-8">No professors found matching your requirements</p>
                                    ) : (
                                        collaborateProfessors.map((professor, index) => (
                                            <div
                                                key={professor.professorId || index}
                                                className="p-4 border border-orange-200 rounded-xl bg-white hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Profile Photo */}
                                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-amber-100 flex-shrink-0">
                                                        {professor.profilePhotoPath ? (
                                                            <img
                                                                src={`${API_URL}/${professor.profilePhotoPath}`}
                                                                alt={professor.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-amber-600 text-xl font-bold">
                                                                {professor.name?.charAt(0)?.toUpperCase() || 'P'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Professor Details */}
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-amber-800 text-lg">{professor.name}</h3>
                                                        
                                                        {/* Domains */}
                                                        {professor.domains && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-amber-600/70 mb-1">Domains</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(Array.isArray(professor.domains) 
                                                                        ? professor.domains 
                                                                        : professor.domains.split(',')
                                                                    ).slice(0, 4).map((domain, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                                                        >
                                                                            {domain.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Send Button */}
                                                    <button
                                                        onClick={() => handleSendCollaborationRequest(professor)}
                                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* Back Button */}
                                    <button
                                        onClick={() => {
                                            setCollaborateStep('select');
                                            setSelectedProject(null);
                                            setCollaborateProfessors([]);
                                        }}
                                        className="mt-4 px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to Projects
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessorViewProjects;