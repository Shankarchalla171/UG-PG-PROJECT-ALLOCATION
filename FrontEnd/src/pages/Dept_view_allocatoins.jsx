import React, { useState, useEffect, useContext } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from '../context/AuthContext';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const DeptViewAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {token}=useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch allocations from API
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        console.log('Starting to fetch allocations from /api/deptCoordinators/final');
        setLoading(true);
        const response = await fetch(`${API_URL}/api/deptCoordinators/final`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch allocations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully fetched allocations:', data);
        setAllocations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching allocations:', err);
        setError(err.message);
        setAllocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  // Filter allocations
  const filteredAllocations = allocations.filter(allocation => {
    const searchQuery = searchTerm.trim().toLowerCase();

    // If search term is empty, show all allocations
    if (!searchQuery) {
      return true;
    }

    const projectTitle = (allocation.project?.title || '').toLowerCase();
    const projectDomain = (allocation.project?.domain || '').toLowerCase();
    const professorName = (allocation.project?.professor?.name || '').toLowerCase();
    const teamMembers = allocation.team?.members || [];

    // Search in project title
    if (projectTitle.includes(searchQuery)) {
      console.log(`Found in project title: ${allocation.project?.title}`);
      return true;
    }

    // Search in project domain
    if (projectDomain.includes(searchQuery)) {
      console.log(`Found in project domain: ${allocation.project?.domain}`);
      return true;
    }

    // Search in professor name
    if (professorName.includes(searchQuery)) {
      console.log(`Found in professor name: ${allocation.project?.professor?.name}`);
      return true;
    }

    // Search in team members (name and roll number)
    const memberMatch = teamMembers.some(member => {
      const memberName = (member.name || '').toLowerCase();
      const rollNumber = (member.rollNumber || '').toLowerCase();
      return memberName.includes(searchQuery) || rollNumber.includes(searchQuery);
    });

    if (memberMatch) {
      console.log(`Found in team member`);
      return true;
    }

    return false;
  });

  console.log(`Total allocations: ${allocations.length}, Filtered: ${filteredAllocations.length}, Search term: "${searchTerm}"`);


  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            {loading ? (
              <div className="mb-8">
                <Skeleton height={36} width={300} />
                <Skeleton height={20} width={400} className="mt-2" />
              </div>
            ) : (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-amber-800">Department Allocations</h1>
                <p className="text-amber-600/70 mt-2">Manage and track all team project allocations across the department</p>
              </div>
            )}

            {/* Search and Filter Bar */}
            {loading ? (
              <div className="mb-8">
                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Skeleton height={16} width={150} className="mb-2" />
                      <Skeleton height={48} />
                    </div>
                    <div className="flex items-end">
                      <Skeleton height={80} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Available Projects Count */}
                    <div className="flex items-end">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-4 w-full">
                        <p className="text-sm text-amber-600/70">Total Allocations</p>
                        <h3 className="text-xl font-bold text-amber-800">{allocations.length}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State - Remove the old spinner loading */}
            {/* {loading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m-8-10h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">Loading Allocations</h3>
                <p className="text-amber-600/70">Fetching department allocations...</p>
              </div>
            )} */}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Allocations</h3>
                <p className="text-red-600/70">{error}</p>
              </div>
            )}

            {/* Allocations Grid */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-orange-200 shadow-md overflow-hidden">
                    <div className="p-5 bg-slate-100">
                      <Skeleton height={24} width={200} className="mb-1" />
                      <Skeleton height={16} width={150} />
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="space-y-2">
                        <Skeleton height={16} width={100} />
                        <Skeleton height={16} width={100} />
                        <Skeleton height={16} width={100} />
                      </div>
                      <div className="h-px bg-orange-100"></div>
                      <div>
                        <Skeleton height={14} width={120} className="mb-3" />
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg">
                              <Skeleton circle height={28} width={28} />
                              <div className="flex-1">
                                <Skeleton height={16} width={100} />
                                <Skeleton height={12} width={80} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !error && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAllocations.map((allocation) => (
                    <div key={allocation.team?.teamId} className="bg-white rounded-2xl border border-orange-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-300">
                      {/* Header with Project Title */}
                      <div className="p-5 bg-gradient-to-r from-orange-500 to-rose-500 text-white">
                        <h3 className="text-lg font-bold mb-1 line-clamp-2">{allocation.project?.title}</h3>
                        <p className="text-sm text-white/90">Prof. {allocation.project?.professor?.name}</p>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-5">
                        {/* Project Meta Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-600/70">Domain:</span>
                            <span className="font-medium text-amber-800">{allocation.project?.domain}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-600/70">Duration:</span>
                            <span className="font-medium text-amber-800">{allocation.project?.duration} weeks</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-600/70"> Slots:</span>
                            <span className="font-medium text-amber-800">{allocation.project?.slots}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-orange-100"></div>

                        {/* Team Members */}
                        <div>
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                            Team Members ({allocation.team?.members?.length || 0})
                          </p>
                          <div className="space-y-2">
                            {allocation.team?.members?.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-50/60 hover:bg-amber-50 transition-colors">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-white">
                                    {member.name?.charAt(0) || 'M'}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-amber-900 truncate">{member.name}</p>
                                  <p className="text-xs text-amber-600/70 truncate">{member.rollNumber}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Empty State */}
            {filteredAllocations.length === 0 && !loading && !error && (
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