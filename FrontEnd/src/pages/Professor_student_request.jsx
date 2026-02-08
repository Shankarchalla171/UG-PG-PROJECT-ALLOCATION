import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const ProfessorStudentRequest = () => {
  // Mock data for student requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      teamName: "Quantum Coders",
      projectTitle: "AI-Powered Learning Management System",
      teamDescription: "We are a team of 4 passionate developers with expertise in ML and full-stack development. We've built similar educational platforms before.",
      status: "pending", // pending, accepted, declined
      read: false,
      date: "2024-02-15",
      teamMembers: [
        { id: 1, name: "Alex Johnson", rollNo: "CS2023001", role: "Team Lead", email: "alex.j@university.edu" },
        { id: 2, name: "Sophia Williams", rollNo: "CS2023002", role: "ML Engineer", email: "sophia.w@university.edu" },
        { id: 3, name: "Ryan Chen", rollNo: "CS2023003", role: "Backend Developer", email: "ryan.c@university.edu" },
        { id: 4, name: "Maya Patel", rollNo: "CS2023004", role: "Frontend Developer", email: "maya.p@university.edu" }
      ],
      fileName: "quantum_coders_proposal.zip",
      fileSize: "4.2 MB",
      message: "Dear Professor, we are very interested in your AI-Powered LMS project. We have relevant experience in ML and full-stack development, and we've attached our detailed proposal with project plan, timelines, and previous work samples.",
      skills: ["Python", "TensorFlow", "React", "Node.js", "MongoDB", "Docker"]
    },
    {
      id: 2,
      teamName: "Blockchain Innovators",
      projectTitle: "Blockchain-based Academic Certificate Verification",
      teamDescription: "Specialized in blockchain technology with prior experience in smart contracts and cybersecurity. Won 2nd place in National Blockchain Hackathon.",
      status: "pending",
      read: true,
      date: "2024-02-14",
      teamMembers: [
        { id: 1, name: "David Kim", rollNo: "CS2023005", role: "Team Lead", email: "david.k@university.edu" },
        { id: 2, name: "Emma Rodriguez", rollNo: "CS2023006", role: "Blockchain Developer", email: "emma.r@university.edu" }
      ],
      fileName: "blockchain_proposal.zip",
      fileSize: "3.8 MB",
      message: "Respected Professor, our team has been following your work on blockchain applications in education. We have hands-on experience with Solidity and Ethereum development, and we believe we can deliver exceptional results.",
      skills: ["Solidity", "Ethereum", "React", "Web3.js", "Smart Contracts"]
    },
    {
      id: 3,
      teamName: "IoT Visionaries",
      projectTitle: "IoT Smart Campus Solution",
      teamDescription: "Combination of EE and CS students with hands-on IoT project experience. Built smart home system as part of coursework.",
      status: "accepted",
      read: true,
      date: "2024-02-10",
      teamMembers: [
        { id: 1, name: "Olivia Taylor", rollNo: "EE2023001", role: "Team Lead", email: "olivia.t@university.edu" },
        { id: 2, name: "Michael Brown", rollNo: "EE2023002", role: "Hardware Engineer", email: "michael.b@university.edu" }
      ],
      fileName: "iot_visionaries_proposal.zip",
      fileSize: "5.1 MB",
      message: "Hello Professor, we are excited about the IoT Smart Campus project. Our team includes hardware specialists and cloud engineers, making us well-rounded for this project. We've included circuit designs and code samples.",
      skills: ["C++", "Python", "Raspberry Pi", "AWS IoT", "MQTT", "Embedded C"]
    },
    {
      id: 4,
      teamName: "Data Wizards",
      projectTitle: "Data Analytics Platform for Student Performance",
      teamDescription: "Team with strong background in data science and visualization. Completed multiple data analysis projects with Python and D3.js.",
      status: "declined",
      read: true,
      date: "2024-02-08",
      teamMembers: [
        { id: 1, name: "Sarah Lee", rollNo: "CS2023008", role: "Data Scientist", email: "sarah.l@university.edu" },
        { id: 2, name: "Daniel Garcia", rollNo: "CS2023009", role: "Frontend Developer", email: "daniel.g@university.edu" }
      ],
      fileName: "data_wizards_proposal.zip",
      fileSize: "2.9 MB",
      message: "Dear Professor, we are data science enthusiasts with experience in educational data analysis. We've worked on similar dashboards and believe our skills match your project requirements perfectly.",
      skills: ["Python", "Pandas", "D3.js", "PostgreSQL", "Tableau", "Machine Learning"]
    },
    {
      id: 5,
      teamName: "AR/VR Pioneers",
      projectTitle: "AR/VR Lab Simulations",
      teamDescription: "Passionate about immersive technologies. Developed VR games and AR applications during university projects.",
      status: "pending",
      read: false,
      date: "2024-02-16",
      teamMembers: [
        { id: 1, name: "James Wilson", rollNo: "CS2023010", role: "Unity Developer", email: "james.w@university.edu" },
        { id: 2, name: "Emma Chen", rollNo: "CS2023011", role: "3D Modeler", email: "emma.c@university.edu" }
      ],
      fileName: "arvr_proposal.zip",
      fileSize: "6.3 MB",
      message: "Respected Professor, we are fascinated by your AR/VR Lab Simulations project. Our team has Unity experience and 3D modeling skills. We've attached our portfolio and a sample VR lab simulation.",
      skills: ["Unity", "C#", "Blender", "Oculus SDK", "3D Modeling", "ARCore"]
    }
  ]);

  const [filter, setFilter] = useState('all'); // all, unread, pending, accepted, declined
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or details

  // Calculate stats
  const stats = {
    total: requests.length,
    unread: requests.filter(r => !r.read).length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    declined: requests.filter(r => r.status === 'declined').length
  };

  // Filter requests based on current filter
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !request.read;
    return request.status === filter;
  });

  const handleAccept = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'accepted', read: true } : request
    ));
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: 'accepted', read: true });
    }
  };

  const handleDecline = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'declined', read: true } : request
    ));
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: 'declined', read: true });
    }
  };

  const handleMarkAsRead = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, read: true } : request
    ));
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, read: true });
    }
  };

  const handleDownloadFile = (fileName) => {
    // Simulate file download
    alert(`Downloading file: ${fileName}`);
    // In real implementation, this would trigger actual file download
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'declined': return '❌';
      default: return '📄';
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
              <h1 className="text-3xl font-bold text-amber-800">Student Requests</h1>
              <p className="text-amber-600/70 mt-2">Review and manage project requests from student teams</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Total Requests</p>
                    <h3 className="text-xl font-bold text-amber-800 mt-1">{stats.total}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Unread</p>
                    <h3 className="text-xl font-bold text-amber-800 mt-1">{stats.unread}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Pending</p>
                    <h3 className="text-xl font-bold text-amber-800 mt-1">{stats.pending}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Accepted</p>
                    <h3 className="text-xl font-bold text-amber-800 mt-1">{stats.accepted}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Declined</p>
                    <h3 className="text-xl font-bold text-amber-800 mt-1">{stats.declined}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-orange-200 hover:bg-amber-50'}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}`}
              >
                Unread ({stats.unread})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-700 border border-yellow-200 hover:bg-yellow-50'}`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('accepted')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'}`}
              >
                Accepted ({stats.accepted})
              </button>
              <button
                onClick={() => setFilter('declined')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'declined' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'}`}
              >
                Declined ({stats.declined})
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Requests List - Left Panel */}
              <div className={`${selectedRequest ? 'lg:w-2/3' : 'w-full'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`bg-white rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                        !request.read 
                          ? 'border-blue-300 border-2' 
                          : 'border-orange-200/60'
                      } ${
                        selectedRequest?.id === request.id 
                          ? 'ring-2 ring-amber-500' 
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setViewMode('details');
                        if (!request.read) handleMarkAsRead(request.id);
                      }}
                    >
                      <div className="p-5 border-b border-orange-200/60">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)} {request.status.toUpperCase()}
                            </span>
                            {!request.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <span className="text-xs text-amber-600/70">{request.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-amber-800 line-clamp-1">{request.teamName}</h3>
                        <p className="text-sm text-amber-600 font-medium mt-1 line-clamp-1">{request.projectTitle}</p>
                        <p className="text-sm text-amber-600/70 mt-2 line-clamp-2">{request.teamDescription}</p>
                      </div>

                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-xs text-amber-600/70 mb-2">Team Members ({request.teamMembers.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {request.teamMembers.slice(0, 3).map((member) => (
                              <span key={member.id} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                                {member.name.split(' ')[0]}
                              </span>
                            ))}
                            {request.teamMembers.length > 3 && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-lg">
                                +{request.teamMembers.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(request.fileName);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-rose-50 text-amber-800 text-sm font-medium rounded-xl border border-orange-200 hover:from-orange-100 hover:to-rose-100 transition-all duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {request.fileName}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setViewMode('details');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredRequests.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-amber-800 mb-2">No Requests Found</h3>
                    <p className="text-amber-600/70">No student requests match your current filter</p>
                  </div>
                )}
              </div>

              {/* Details Panel - Right Side */}
              {selectedRequest && viewMode === 'details' && (
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-2xl border border-orange-200/60 shadow-lg sticky top-6">
                    {/* Details Header */}
                    <div className="p-6 border-b border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusIcon(selectedRequest.status)} {selectedRequest.status.toUpperCase()}
                          </span>
                          {!selectedRequest.read && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="p-2 rounded-lg text-amber-700 hover:bg-orange-100 transition-all duration-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-amber-800 mb-2">{selectedRequest.teamName}</h3>
                      <p className="text-sm text-amber-600 font-medium mb-2">{selectedRequest.projectTitle}</p>
                      <p className="text-sm text-amber-600/70">{selectedRequest.teamDescription}</p>
                    </div>

                    {/* Details Content */}
                    <div className="p-6 space-y-6">
                      {/* Message */}
                      <div>
                        <h4 className="font-bold text-amber-800 mb-2">Message from Team</h4>
                        <p className="text-sm text-amber-600/70 bg-orange-50 p-4 rounded-xl border border-orange-200">
                          {selectedRequest.message}
                        </p>
                      </div>

                      {/* Team Members */}
                      <div>
                        <h4 className="font-bold text-amber-800 mb-3">Team Members</h4>
                        <div className="space-y-3">
                          {selectedRequest.teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50/30 to-transparent border border-orange-100/50">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                                <span className="font-bold text-amber-700">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-amber-800 truncate">{member.name}</h5>
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-lg font-medium">
                                    {member.role}
                                  </span>
                                </div>
                                <p className="text-sm text-amber-600/70 truncate">Roll No: {member.rollNo}</p>
                                <p className="text-xs text-amber-500 truncate">{member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="font-bold text-amber-800 mb-2">Skills & Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm rounded-lg border border-amber-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* File Attachment */}
                      <div className="pt-4 border-t border-orange-200/60">
                        <h4 className="font-bold text-amber-800 mb-3">Attached Files</h4>
                        <button
                          onClick={() => handleDownloadFile(selectedRequest.fileName)}
                          className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 hover:from-orange-100 hover:to-rose-100 transition-all duration-300 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-amber-800">{selectedRequest.fileName}</p>
                              <p className="text-xs text-amber-600/70">{selectedRequest.fileSize}</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>

                      {/* Action Buttons */}
                      {selectedRequest.status === 'pending' && (
                        <div className="pt-4 border-t border-orange-200/60">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAccept(selectedRequest.id)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleDecline(selectedRequest.id)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorStudentRequest;