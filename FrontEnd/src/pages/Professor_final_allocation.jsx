import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ProfessorFinalAllocation = () => {
  // Mock data for allocated teams
  const [teams] = useState([
    {
      id: 1,
      teamName: "Quantum Coders",
      projectTitle: "AI-Powered Learning Management System",
      teamDescription: "A team of passionate developers focused on creating innovative educational technology solutions. We specialize in machine learning and full-stack development.",
      status: "Active",
      allocationDate: "2024-02-15",
      members: [
        { id: 1, name: "Alex Johnson", rollNo: "CS2023001", role: "Team Lead", email: "alex.j@university.edu" },
        { id: 2, name: "Sophia Williams", rollNo: "CS2023002", role: "ML Engineer", email: "sophia.w@university.edu" },
        { id: 3, name: "Ryan Chen", rollNo: "CS2023003", role: "Backend Developer", email: "ryan.c@university.edu" },
        { id: 4, name: "Maya Patel", rollNo: "CS2023004", role: "Frontend Developer", email: "maya.p@university.edu" }
      ]
    },
    {
      id: 2,
      teamName: "Blockchain Innovators",
      projectTitle: "Blockchain-based Academic Certificate Verification",
      teamDescription: "A cybersecurity-focused team with expertise in blockchain technology and smart contracts. Dedicated to building secure academic systems.",
      status: "Active",
      allocationDate: "2024-02-10",
      members: [
        { id: 1, name: "David Kim", rollNo: "CS2023005", role: "Team Lead", email: "david.k@university.edu" },
        { id: 2, name: "Emma Rodriguez", rollNo: "CS2023006", role: "Blockchain Developer", email: "emma.r@university.edu" },
        { id: 3, name: "James Wilson", rollNo: "CS2023007", role: "Smart Contract Developer", email: "james.w@university.edu" }
      ]
    },
    {
      id: 3,
      teamName: "IoT Visionaries",
      projectTitle: "IoT Smart Campus Solution",
      teamDescription: "Hardware and software enthusiasts specializing in IoT solutions. We combine embedded systems with cloud computing for smart campus applications.",
      status: "In Progress",
      allocationDate: "2024-02-05",
      members: [
        { id: 1, name: "Olivia Taylor", rollNo: "EE2023001", role: "Team Lead", email: "olivia.t@university.edu" },
        { id: 2, name: "Michael Brown", rollNo: "EE2023002", role: "Hardware Engineer", email: "michael.b@university.edu" },
        { id: 3, name: "Sarah Lee", rollNo: "CS2023008", role: "Cloud Engineer", email: "sarah.l@university.edu" },
        { id: 4, name: "Daniel Garcia", rollNo: "EE2023003", role: "Embedded Developer", email: "daniel.g@university.edu" }
      ]
    }
  ]);

  // Stats for the dashboard
  const stats = {
    totalTeams: teams.length,
    totalStudents: teams.reduce((total, team) => total + team.members.length, 0),
    activeProjects: teams.filter(team => team.status === 'Active').length
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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
              <h1 className="text-3xl font-bold text-amber-800">Final Team Allocations</h1>
              <p className="text-amber-600/70 mt-2">View and manage all allocated student teams for your projects</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <p className="text-sm text-amber-600/70">Total Students</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.totalStudents}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3.65a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Active Projects</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.activeProjects}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-2xl border border-orange-200/60 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300">
                  {/* Team Header */}
                  <div className="p-6 border-b border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                          {team.status}
                        </span>
                      </div>
                      <div className="text-sm text-amber-600/70">
                        Allocated: {team.allocationDate}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-800 mb-2">{team.teamName}</h3>
                    <p className="text-sm text-amber-600 font-medium mb-2">{team.projectTitle}</p>
                    <p className="text-sm text-amber-600/70 line-clamp-2">{team.teamDescription}</p>
                  </div>

                  {/* Team Members Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-amber-800">Team Members</h4>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                        {team.members.length} members
                      </span>
                    </div>

                    <div className="space-y-4">
                      {team.members.map((member) => (
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

                    {/* Team Actions */}
                    <div className="mt-6 pt-4 border-t border-orange-200/60 flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-50 to-rose-50 text-amber-800 font-medium rounded-xl border border-orange-200 hover:from-orange-100 hover:to-rose-100 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-medium rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {teams.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">No Teams Allocated Yet</h3>
                <p className="text-amber-600/70 mb-6">Teams will appear here once you finalize allocations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorFinalAllocation;