import React, { useEffect, useState, useMemo, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useRef } from 'react';

const ProjectListing = () => {
  const { token } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const domainRef = useRef(null);
  const facultyRef = useRef(null);
  
  const [projectlist, setProjectlist] = useState([]);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(0);
  
  const [isFilterLoading, setIsFilterLoading] = useState(true);
  const [allDomains, setAllDomains] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);

  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  const [domainSearch, setDomainSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');

  const filteredDomains = allDomains.filter(d =>
    d.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const filteredFaculty = allFaculty.filter(f =>
    f.toLowerCase().includes(facultySearch.toLowerCase())
  );

  const handlePrev = () => {
    if (page > 0) setPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(prev => prev + 1);
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

  const [pageInput, setPageInput] = useState('');

  const handlePageInput = () => {
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum - 1); // backend is 0-based
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 1; // pages around current

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || // first
        i === totalPages - 1 || // last
        (i >= page - maxVisible && i <= page + maxVisible)
      ) {
        pages.push(i);
      } else if (
        i === page - maxVisible - 1 ||
        i === page + maxVisible + 1
      ) {
        pages.push("...");
      }
    }

    return pages;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        if (!token) {
          setLoadError('Authentication required. Please log in.');
          setIsLoading(false);
          return;
        }
        
        const url = `${API_URL}/api/student/projects?page=${page}&size=6`
          + `&search=${searchQuery || ''}`
          + `&domain=${selectedDomain || ''}`
          + `&faculty=${selectedFaculty || ''}`
          + `&slots=${slotFilter}`;
        console.log('Fetching from:', url);
        console.log('Token available:', !!token);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = `Server error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('Error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // Handle null/undefined response
        if (!data) {
          console.error('Response is null or undefined');
          setLoadError('No projects returned from server.');
          setIsLoading(false);
          return;
        }
        
        // Validate response is an array
        if (!data.content) {
          setLoadError('Invalid response format');
          setIsLoading(false);
          return;
        }

        const newProjects = data.content;
        
        console.log('Number of projects received:', newProjects.length);
        
        // Log first project structure for debugging
        if (newProjects.length > 0) {
          console.log('First project structure:', newProjects[0]);
        }
        
        // Validate and clean data
        const validatedProjects = newProjects.filter(project => {
          const hasRequiredFields = project && 
            project.id !== undefined && 
            project.id !== null;
          
          if (!hasRequiredFields) {
            console.warn('Project missing required fields:', project);
          }
          
          return hasRequiredFields;
        }).map(project => ({
          ...project,
          projectTitle: project.projectTitle || 'Untitled Project',
          domains: Array.isArray(project.domains) ? project.domains : [],
          facultyName: project.facultyName || 'Unknown',
          description: project.description || '',
          availableSlots: typeof project.availableSlots === 'number' ? project.availableSlots : 0,
          preRequisites: project.preRequisites || ''
        }));

        
        console.log('Validated projects:', validatedProjects.length);
        setProjectlist(validatedProjects);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching projects:', error.message, error);
        setLoadError(`Failed to load projects: ${error.message || 'Unknown error. Please check that the backend is running.'}`);
      } finally {
          setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [token, API_URL, page, searchQuery, selectedDomain, selectedFaculty, slotFilter])

  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedDomain, selectedFaculty, slotFilter]);

  useEffect(() => {
    setProjectlist([]);
    setPage(0);
  }, [token]);

  useEffect(() => {
    if (activeProjectId === null) {
      setActiveProject(null);
    } else {
      const selected = projectlist.find(project => project.id === activeProjectId);
      setActiveProject(selected || null);
    }
  }, [activeProjectId, projectlist])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setIsFilterLoading(true);

        const response = await fetch(`${API_URL}/api/student/projects/filters`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        setAllDomains((data.domains || []).sort());
        setAllFaculty((data.faculty || []).sort());
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
      finally {
        setIsFilterLoading(false);
      }
    };

    if (token) fetchFilters();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domainRef.current && !domainRef.current.contains(event.target)) {
        setShowDomainDropdown(false);
      }

      if (facultyRef.current && !facultyRef.current.contains(event.target)) {
        setShowFacultyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('');
    setSelectedFaculty('');
    setSlotFilter('all');
  };

  const hasActiveFilters = searchQuery || selectedDomain || selectedFaculty || slotFilter !== 'all';

  return (
    <>
      <Navbar />
      <div className='flex min-h-screen'>
        <Sidebar />
        <div className='projects flex flex-1 flex-col lg:flex-row'>
          <div className='flex-1 p-4'>
            {/* Filter Section */}
            <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-5 mb-6 transition-all duration-300'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-amber-900 flex items-center gap-2'>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                  </svg>
                  Filters
                  {hasActiveFilters && (
                    <span className='ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full'>
                      Active
                    </span>
                  )}
                </h2>
                <div className='flex items-center gap-3'>
                  {hasActiveFilters && isFilterExpanded && (
                    <button
                      onClick={clearFilters}
                      className='text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors'
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className='p-1.5 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300'
                    aria-label={isFilterExpanded ? 'Collapse filters' : 'Expand filters'}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              <div className={`overflow-hidden transition-all duration-300 ease-out ${isFilterExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Search */}
                  <div className='relative'>
                    <label className='block text-xs font-medium text-amber-700 mb-1.5'>Search</label>
                    <div className='relative'>
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-9 pr-4 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all'
                      />
                    </div>
                  </div>

                  {/* Domain Filter */}
                  <div className="relative" ref={domainRef}>
                    <label className='block text-xs font-medium text-amber-700 mb-1.5'>Domain</label>

                    {/* Trigger */}
                    <div
                      onClick={() => {
                        if(isFilterLoading) return;
                        setShowDomainDropdown(prev => !prev);
                        setShowFacultyDropdown(false);
                      }}
                      className={`w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 cursor-pointer
                        ${isFilterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isFilterLoading ? "Loading..." : (selectedDomain || "All Domains")}
                    </div>

                    {/* Dropdown */}
                    {showDomainDropdown && !isFilterLoading && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-orange-200 rounded-lg shadow max-h-60 overflow-y-auto">

                        {/* 🔍 Search inside dropdown */}
                        <input
                          type="text"
                          placeholder="Search domain..."
                          value={domainSearch}
                          onChange={(e) => setDomainSearch(e.target.value)}
                          className="w-full px-3 py-2 border-b border-orange-200 text-sm outline-none"
                        />

                        {/* All option */}
                        <div
                          className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                          onClick={() => {
                            setSelectedDomain('');
                            setShowDomainDropdown(false);
                            setDomainSearch('');
                          }}
                        >
                          All Domains
                        </div>

                        {/* Filtered list */}
                        {filteredDomains
                          .map(domain => (
                            <div
                              key={domain}
                              onClick={() => {
                                setSelectedDomain(domain);
                                setShowDomainDropdown(false);
                                setDomainSearch('');
                              }}
                              className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                            >
                              {domain}
                            </div>
                          ))
                        }

                        {/* No results */}
                        {filteredDomains.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No results
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Faculty Filter */}
                  <div className="relative" ref={facultyRef}>
                    <label className='block text-xs font-medium text-amber-700 mb-1.5'>Faculty</label>

                    {/* Trigger */}
                    <div
                      onClick={() => {
                        if(isFilterLoading) return;
                        setShowFacultyDropdown(prev => !prev);
                        setShowDomainDropdown(false);
                      }}   
                      className={`w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 cursor-pointer
                        ${isFilterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isFilterLoading ? "Loading..." : (selectedFaculty || "All Faculty")}
                    </div>

                    {/* Dropdown */}
                    {showFacultyDropdown && !isFilterLoading && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-orange-200 rounded-lg shadow max-h-60 overflow-y-auto">

                        {/* 🔍 Search inside dropdown */}
                        <input
                          type="text"
                          placeholder="Search faculty..."
                          value={facultySearch}
                          onChange={(e) => setFacultySearch(e.target.value)}
                          className="w-full px-3 py-2 border-b border-orange-200 text-sm outline-none"
                        />

                        {/* All option */}
                        <div
                          className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                          onClick={() => {
                            setSelectedFaculty('');
                            setShowFacultyDropdown(false);
                            setFacultySearch('');
                          }}
                        >
                          All Faculty
                        </div>

                        {/* Filtered list */}
                        {filteredFaculty
                          .map(faculty => (
                            <div
                              key={faculty}
                              onClick={() => {
                                setSelectedFaculty(faculty);
                                setShowFacultyDropdown(false);
                                setFacultySearch('');
                              }}
                              className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                            >
                              {faculty}
                            </div>
                          ))
                        }

                        {/* No results */}
                        {filteredFaculty.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No results
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slots Filter */}
                  <div>
                    <label className='block text-xs font-medium text-amber-700 mb-1.5'>Availability</label>
                    <select
                      value={slotFilter}
                      onChange={(e) => setSlotFilter(e.target.value)}
                      className='w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all cursor-pointer'
                    >
                      <option value="all">All Projects</option>
                      <option value="available">Available Slots</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>

                {/* Results count */}
                <div className='mt-4 pt-3 border-t border-orange-100'>
                  <p className='text-sm text-amber-600'>
                    Showing <span className='font-semibold text-amber-800'>{projectlist.length}</span> projects
                  </p>
                </div>
              </div>
            </div>

            {/* Project Cards Grid */}
            {isLoading && (
              <div className='col-span-full flex flex-col items-center justify-center py-16'>
                <svg className="animate-spin w-12 h-12 mb-4 text-amber-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className='text-lg font-medium text-amber-700'>Loading projects...</p>
                <p className='text-sm text-amber-500 mt-1'>Please wait</p>
              </div>
            )}

            {!isLoading && !loadError && totalPages > 1 && (
              <div className="flex flex-col items-center mt-8 gap-4">

                {/* Page buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-center">

                  {/* Prev */}
                  <button
                    onClick={handlePrev}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((item, index) =>
                    item === "..." ? (
                      <span key={index} className="px-2">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageClick(item)}
                        className={`px-3 py-1 border rounded ${
                          page === item ? 'bg-orange-500 text-white' : ''
                        }`}
                      >
                        {item + 1}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    disabled={page === totalPages - 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                {/* Manual input */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700">Go to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={handlePageInput}
                    className="px-2 py-1 bg-orange-500 text-white rounded text-sm"
                  >
                    Go
                  </button>
                </div>

              </div>
            )}

            {loadError && !isLoading && (
              <div className='col-span-full flex flex-col items-center justify-center py-16 text-red-600'>
                <svg className="w-16 h-16 mb-4 text-red-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className='text-lg font-medium'>{loadError}</p>
                <p className='text-sm text-red-500 mt-2'>
                  Endpoint: <code className='bg-red-100 px-2 py-1 rounded'>{API_URL}/api/student/projects</code>
                </p>
                <p className='text-sm text-red-500 mt-1'>Please check the browser console for more details</p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {projectlist && projectlist.length > 0 ? (
                  projectlist.map(project =>
                    project && project.id ? (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        activeProjectId={activeProjectId}
                        setActiveProjectId={setActiveProjectId}
                      />
                    ) : null
                  )
                ) : (
                  <div className='col-span-full text-center text-amber-600 py-10'>
                    No projects found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Details Panel - Responsive */}
        <div className={`${activeProject && activeProject.projectTitle
            ? 'fixed  inset-0 z-50 lg:relative lg:inset-auto  lg:z-0 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none'
            : 'hidden lg:block'
          } lg:w-80 xl:w-96 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start`}>
          <div className='h-full lg:h-full p-4 lg:p-4 border-l border-orange-200/60 bg-white/95 lg:bg-gradient-to-b lg:from-amber-50/50 lg:to-orange-50/30 overflow-y-auto ml-auto max-w-md lg:max-w-none'>
            {activeProject && activeProject.projectTitle ? (
              <div className='w-full max-w-md mx-auto lg:max-w-none'>
                {/* Mobile Close Button */}
                <button
                  onClick={() => setActiveProjectId(null)}
                  className='lg:hidden mb-4 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors hover:cursor-pointer'
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                  Back to projects
                </button>
                <h2 className='text-base lg:text-lg font-bold text-amber-900 mb-3 lg:mb-4 flex items-center gap-2'>
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  Project Details
                </h2>
                <div className='bg-white rounded-xl border border-orange-200 shadow-md p-4 lg:p-5 transition-all duration-300'>
                  {/* Title */}
                  <h3 className='text-base lg:text-lg font-semibold text-amber-900 mb-2 lg:mb-3 leading-tight'>{activeProject.projectTitle}</h3>

                  {/* Description */}
                  <p className='text-sm text-amber-700 mb-3 lg:mb-4 leading-relaxed'>{activeProject.description}</p>

                  {/* Faculty */}
                  <div className='flex items-center gap-2 text-sm text-amber-700 mb-3 lg:mb-4 p-2 lg:p-3 bg-amber-50 rounded-lg'>
                    <svg className="w-5 h-5 flex-shrink-0 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <div>
                      <p className='text-xs text-amber-500'>Faculty</p>
                      <p className='font-medium text-amber-800'>{activeProject.facultyName}</p>
                    </div>
                  </div>

                  {/* Domains */}
                  {activeProject.domains && activeProject.domains.length > 0 && (
                    <div className='mb-3 lg:mb-4'>
                      <p className='text-xs font-medium text-amber-600 mb-1.5 lg:mb-2 uppercase tracking-wide'>Domains</p>
                      <div className='flex flex-wrap gap-1.5 lg:gap-2'>
                        {activeProject.domains.map((domain, idx) => (
                          <span key={idx} className='px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg text-xs font-medium text-amber-800'>
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slots Available */}
                  <div className='flex items-center justify-between p-2 lg:p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-100 mb-3 lg:mb-4'>
                    <div className='flex items-center gap-2'>
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <span className='text-sm text-amber-700'>Available Slots</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${activeProject.availableSlots > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {activeProject.availableSlots > 0 ? activeProject.availableSlots : 'Full'}
                    </span>
                  </div>

                  {/* Apply Button */}
                  {activeProject.availableSlots > 0 && (
                    <button className='w-full py-2.5 lg:py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 text-sm lg:text-base
                    hover:cursor-pointer'
                      onClick={() => { navigate(`/applicationform/${activeProject.id}`) }}>
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className='hidden lg:flex flex-col items-center justify-center py-16 text-amber-500'>
                <svg className="w-12 h-12 xl:w-16 xl:h-16 mb-3 xl:mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                </svg>
                <p className='text-xs xl:text-sm font-medium text-amber-600'>Select a project</p>
                <p className='text-xs text-amber-400 mt-1 text-center'>Click on a project card to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectListing;