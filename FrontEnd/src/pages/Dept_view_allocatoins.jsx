import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DeptViewAllocations = () => {
  // Mock data for allocated teams
  const [allocations, setAllocations] = useState([
    {
      id: 1,
      teamName: "Quantum Coders",
      currentProject: {
        id: 101,
        title: "AI-Powered Learning Management System",
        professor: "Dr. Smith",
        domain: "Machine Learning & Web Development"
      },
      proposedProject: null,
      status: "active",
      teamMembers: [
        { id: 1, name: "Alex Johnson", rollNo: "CS2023001", department: "CSE" },
        { id: 2, name: "Sophia Williams", rollNo: "CS2023002", department: "CSE" },
        { id: 3, name: "Ryan Chen", rollNo: "CS2023003", department: "CSE" },
        { id: 4, name: "Maya Patel", rollNo: "CS2023004", department: "CSE" }
      ],
      allocationDate: "2024-02-15",
      lastUpdated: "2024-02-15"
    },
    {
      id: 2,
      teamName: "Blockchain Innovators",
      currentProject: {
        id: 102,
        title: "Blockchain-based Academic Certificate Verification",
        professor: "Dr. Johnson",
        domain: "Blockchain & Cybersecurity"
      },
      proposedProject: null,
      status: "pending",
      teamMembers: [
        { id: 1, name: "David Kim", rollNo: "CS2023005", department: "CSE" },
        { id: 2, name: "Emma Rodriguez", rollNo: "CS2023006", department: "CSE" }
      ],
      allocationDate: "2024-02-10",
      lastUpdated: "2024-02-10"
    },
    {
      id: 3,
      teamName: "IoT Visionaries",
      currentProject: {
        id: 103,
        title: "IoT Smart Campus Solution",
        professor: "Dr. Williams",
        domain: "IoT & Embedded Systems"
      },
      proposedProject: {
        id: 104,
        title: "Smart Energy Management System",
        professor: "Dr. Brown",
        domain: "IoT & Energy Systems"
      },
      status: "transfer_requested",
      teamMembers: [
        { id: 1, name: "Olivia Taylor", rollNo: "EE2023001", department: "EEE" },
        { id: 2, name: "Michael Brown", rollNo: "EE2023002", department: "EEE" }
      ],
      allocationDate: "2024-02-05",
      lastUpdated: "2024-02-18"
    },
    {
      id: 4,
      teamName: "Data Wizards",
      currentProject: {
        id: 105,
        title: "Data Analytics Platform for Student Performance",
        professor: "Dr. Davis",
        domain: "Data Science & Visualization"
      },
      proposedProject: null,
      status: "completed",
      teamMembers: [
        { id: 1, name: "Sarah Lee", rollNo: "CS2023008", department: "CSE" },
        { id: 2, name: "Daniel Garcia", rollNo: "CS2023009", department: "CSE" }
      ],
      allocationDate: "2024-01-20",
      lastUpdated: "2024-02-10"
    },
    {
      id: 5,
      teamName: "AR/VR Pioneers",
      currentProject: {
        id: 106,
        title: "AR/VR Lab Simulations",
        professor: "Dr. Miller",
        domain: "AR/VR Development"
      },
      proposedProject: {
        id: 101,
        title: "AI-Powered Learning Management System",
        professor: "Dr. Smith",
        domain: "Machine Learning & Web Development"
      },
      status: "pending",
      teamMembers: [
        { id: 1, name: "James Wilson", rollNo: "CS2023010", department: "CSE" },
        { id: 2, name: "Emma Chen", rollNo: "CS2023011", department: "CSE" }
      ],
      allocationDate: "2024-02-12",
      lastUpdated: "2024-02-16"
    },
    {
      id: 6,
      teamName: "Mobile Mavericks",
      currentProject: {
        id: 107,
        title: "Mobile App for Campus Navigation",
        professor: "Dr. Wilson",
        domain: "Mobile Development"
      },
      proposedProject: null,
      status: "active",
      teamMembers: [
        { id: 1, name: "Robert Taylor", rollNo: "CS2023012", department: "CSE" },
        { id: 2, name: "Sophia Martinez", rollNo: "CS2023013", department: "CSE" },
        { id: 3, name: "Liam Brown", rollNo: "CS2023014", department: "CSE" }
      ],
      allocationDate: "2024-02-08",
      lastUpdated: "2024-02-08"
    }
  ]);

  // Mock data for available projects
  const [availableProjects] = useState([
    { id: 101, title: "AI-Powered Learning Management System", professor: "Dr. Smith", domain: "Machine Learning & Web Development", slots: 2 },
    { id: 102, title: "Blockchain-based Academic Certificate Verification", professor: "Dr. Johnson", domain: "Blockchain & Cybersecurity", slots: 1 },
    { id: 103, title: "IoT Smart Campus Solution", professor: "Dr. Williams", domain: "IoT & Embedded Systems", slots: 0 },
    { id: 104, title: "Smart Energy Management System", professor: "Dr. Brown", domain: "IoT & Energy Systems", slots: 3 },
    { id: 105, title: "Data Analytics Platform for Student Performance", professor: "Dr. Davis", domain: "Data Science & Visualization", slots: 1 },
    { id: 106, title: "AR/VR Lab Simulations", professor: "Dr. Miller", domain: "AR/VR Development", slots: 0 },
    { id: 107, title: "Mobile App for Campus Navigation", professor: "Dr. Wilson", domain: "Mobile Development", slots: 2 },
    { id: 108, title: "E-commerce Platform with AI Recommendations", professor: "Dr. Taylor", domain: "Web Development & AI", slots: 4 },
    { id: 109, title: "Cybersecurity Threat Detection System", professor: "Dr. Anderson", domain: "Cybersecurity & ML", slots: 2 },
    { id: 110, title: "Smart Attendance System using Face Recognition", professor: "Dr. Thomas", domain: "Computer Vision & IoT", slots: 3 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');

  // Filter allocations
  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.currentProject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.teamMembers.some(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    totalTeams: allocations.length,
    activeTeams: allocations.filter(a => a.status === 'active').length,
    pendingTransfers: allocations.filter(a => a.status === 'transfer_requested' || a.status === 'pending').length,
    completedProjects: allocations.filter(a => a.status === 'completed').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'transfer_requested': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'transfer_requested': return 'Transfer Requested';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleEditAllocation = (allocation) => {
    setEditingAllocation(allocation.id);
    setSelectedProject(allocation.currentProject.id.toString());
  };

  const handleSaveAllocation = (id) => {
    if (!selectedProject) return;
    
    const selectedProjectData = availableProjects.find(p => p.id === parseInt(selectedProject));
    
    setAllocations(allocations.map(allocation => 
      allocation.id === id 
        ? { 
            ...allocation, 
            proposedProject: selectedProjectData,
            status: 'transfer_requested',
            lastUpdated: new Date().toISOString().split('T')[0]
          } 
        : allocation
    ));
    
    setEditingAllocation(null);
    setSelectedProject('');
  };

  const handleCancelEdit = () => {
    setEditingAllocation(null);
    setSelectedProject('');
  };

  const handleApproveTransfer = (id) => {
    setAllocations(allocations.map(allocation => 
      allocation.id === id 
        ? { 
            ...allocation, 
            currentProject: allocation.proposedProject,
            proposedProject: null,
            status: 'active',
            lastUpdated: new Date().toISOString().split('T')[0]
          } 
        : allocation
    ));
  };

  const handleRejectTransfer = (id) => {
    setAllocations(allocations.map(allocation => 
      allocation.id === id 
        ? { 
            ...allocation, 
            proposedProject: null,
            status: 'active',
            lastUpdated: new Date().toISOString().split('T')[0]
          } 
        : allocation
    ));
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
              <h1 className="text-3xl font-bold text-amber-800">Department Allocations</h1>
              <p className="text-amber-600/70 mt-2">Manage and track all team project allocations across the department</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Total Teams</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.totalTeams}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Active Teams</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.activeTeams}</h3>
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
                    <p className="text-sm text-amber-600/70">Pending Transfers</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.pendingTransfers}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Completed</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.completedProjects}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-amber-600/70 mb-2">
                      Search Teams or Projects
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by team name, project, or member..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 placeholder-amber-400"
                      />
                      <svg className="w-5 h-5 text-amber-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-amber-600/70 mb-2">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="transfer_requested">Transfer Requested</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Available Projects Count */}
                  <div className="flex items-end">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-4 w-full">
                      <p className="text-sm text-amber-600/70">Available Projects</p>
                      <h3 className="text-xl font-bold text-amber-800">{availableProjects.length}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAllocations.map((allocation) => (
                <div key={allocation.id} className="bg-white rounded-2xl border border-orange-200/60 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300">
                  {/* Header */}
                  <div className="p-6 border-b border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}>
                          {getStatusText(allocation.status)}
                        </span>
                      </div>
                      <div className="text-sm text-amber-600/70">
                        Updated: {allocation.lastUpdated}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-800 mb-2">{allocation.teamName}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-amber-600">{allocation.currentProject.title}</p>
                    </div>
                    <p className="text-xs text-amber-600/70">Professor: {allocation.currentProject.professor}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Team Members */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-amber-800 mb-3">Team Members ({allocation.teamMembers.length})</p>
                      <div className="space-y-2">
                        {allocation.teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-700">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-amber-800">{member.name}</p>
                                <p className="text-xs text-amber-600/70">{member.rollNo} • {member.department}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Project Info */}
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-2">Current Project</p>
                      <p className="text-sm text-amber-600">{allocation.currentProject.title}</p>
                      <p className="text-xs text-amber-600/70 mt-1">Domain: {allocation.currentProject.domain}</p>
                    </div>

                    {/* Project Transfer Section */}
                    {allocation.proposedProject ? (
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-blue-800">Proposed Transfer</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTransfer(allocation.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-all duration-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTransfer(allocation.id)}
                              className="px-3 py-1 bg-rose-100 text-rose-700 text-xs rounded-lg hover:bg-rose-200 transition-all duration-300"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-blue-600">{allocation.proposedProject.title}</p>
                        <p className="text-xs text-blue-600/70 mt-1">Professor: {allocation.proposedProject.professor}</p>
                      </div>
                    ) : editingAllocation === allocation.id ? (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-amber-800 mb-2">
                          Select New Project
                        </label>
                        <select
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 text-sm"
                        >
                          <option value="">Select a project...</option>
                          {availableProjects
                            .filter(p => p.id !== allocation.currentProject.id)
                            .map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.title} - {project.professor} ({project.slots} slots)
                              </option>
                            ))
                          }
                        </select>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleSaveAllocation(allocation.id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                            disabled={!selectedProject}
                          >
                            Request Transfer
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium rounded-lg border border-orange-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditAllocation(allocation)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 font-medium rounded-xl border border-orange-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Transfer to Another Project
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAllocations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">No Allocations Found</h3>
                <p className="text-amber-600/70">No team allocations match your current search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptViewAllocations;