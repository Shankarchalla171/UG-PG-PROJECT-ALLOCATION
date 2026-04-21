import React, { useEffect, useState, useMemo, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useRef } from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ─── Reusable inline alert for non-critical errors ───────────────────────────
const InlineAlert = ({ message, onRetry }) => (
  <div className='flex items-center justify-between gap-3 px-4 py-2.5 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
    <div className='flex items-center gap-2'>
      <svg className="w-4 h-4 flex-shrink-0 text-red-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className='text-xs font-semibold text-red-600 hover:text-red-800 underline whitespace-nowrap'
      >
        Retry
      </button>
    )}
  </div>
);

const ProjectListing = () => {
  const { token } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL;

  const domainRef = useRef(null);
  const facultyRef = useRef(null);

  // ── Projects ────────────────────────────────────────────────────────────────
  const [projectlist, setProjectlist] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = React.useRef(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  // NEW: application status filter — '' means show all
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('NOT_APPLIED');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(true);
  const [filterError, setFilterError] = useState(null);
  const [allDomains, setAllDomains] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');

  // ── Active project (detail panel) ───────────────────────────────────────────
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);

  // ── Student profile ─────────────────────────────────────────────────────────
  const [student, setStudent] = useState(null);
  const [studentError, setStudentError] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  // ── Allocation deadline ─────────────────────────────────────────────────────
  const [allocationDeadline, setAllocationDeadline] = useState(null);
  const [deadlineLoading, setDeadlineLoading] = useState(true);
  const [deadlineError, setDeadlineError] = useState(null); // null | 'network' | 'not_set'

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [pageInput, setPageInput] = useState('');

  const navigate = useNavigate();

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const filteredDomains = (allDomains || []).filter(d =>
    d.toLowerCase().includes((domainSearch || '').toLowerCase())
  );
  const filteredFaculty = (allFaculty || []).filter(f =>
    f.toLowerCase().includes((facultySearch || '').toLowerCase())
  );
  const hasActiveFilters = searchQuery || selectedDomain || selectedFaculty || slotFilter !== 'all' || applicationStatusFilter !== 'NOT_APPLIED';

  // status comes directly from the DTO: 'Active' | 'Upcoming' | 'Passed'
  // null when no entry exists or a network error occurred
  const allocationStatus   = allocationDeadline?.status ?? null;
  const isAllocationActive = allocationStatus === 'Active';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // Priority-ordered reason why Apply is disabled; null = button enabled
  const applyDisabledReason = useMemo(() => {
    if (studentLoading)                                           return 'Loading your profile…';
    if (studentError)                                             return 'Could not load your profile. Please refresh.';
    if (deadlineLoading)                                          return 'Checking allocation window…';
    if (deadlineError === 'network')                              return 'Could not check allocation dates. Please refresh.';
    if (deadlineError === 'not_set')                              return 'Project allocation has not been announced yet.';
    if (allocationStatus === 'Upcoming')                          return `Applications open on ${formatDate(allocationDeadline?.startDate || allocationDeadline?.endDate)}`;
    if (allocationStatus === 'Passed')                            return `Application window closed on ${formatDate(allocationDeadline?.endDate)}`;
    if (!isAllocationActive)                                      return 'Project allocation window is not open.';
    if (activeProject?.teamConfirmed)                             return 'Your team has already confirmed a project.';
    if (activeProject?.applied)                                   return 'Your team has already applied to this project.';
    if (student?.teamRole?.toUpperCase() !== 'TEAMLEAD')          return 'Only the team lead can apply.';
    if (activeProject?.availableSlots < activeProject?.teamSize)  return 'Not enough slots for your team size.';
    return null;
  }, [studentLoading, studentError, deadlineLoading, deadlineError, allocationStatus, isAllocationActive, allocationDeadline, activeProject, student]);

  const isApplyDisabled = !!applyDisabledReason;

  // ─── Pagination helpers ──────────────────────────────────────────────────────
  const handlePrev = () => { if (page > 0) setPage(p => p - 1); };
  const handleNext = () => { if (page < totalPages - 1) setPage(p => p + 1); };
  const handlePageClick = (n) => setPage(n);
  const handlePageInput = () => {
    const n = parseInt(pageInput);
    if (isNaN(n)) return;
    setPage(Math.min(Math.max(n - 1, 0), totalPages - 1));
    setPageInput('');
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 1;
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= page - maxVisible && i <= page + maxVisible)) {
        pages.push(i);
      } else if (i === page - maxVisible - 1 || i === page + maxVisible + 1) {
        pages.push('...');
      }
    }
    return pages;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // ─── Fetch: Projects ─────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    if (!token) {
      setLoadError('Authentication required. Please log in.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setLoadError(null);

      // Include applicationStatus param — empty string means backend returns all projects
      const url = `${API_URL}/api/students/projects?page=${page}&size=6`
        + `&search=${encodeURIComponent(searchQuery || '')}`
        + `&domain=${encodeURIComponent(selectedDomain || '')}`
        + `&faculty=${encodeURIComponent(selectedFaculty || '')}`
        + `&slots=${slotFilter}`
        + (applicationStatusFilter ? `&applicationStatus=${applicationStatusFilter}` : '');

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) throw new Error('Session expired. Please log in again.');
      if (response.status === 403) throw new Error('You do not have permission to view projects.');

      if (!response.ok) {
        let msg = `Server error (${response.status})`;
        try { const e = await response.json(); msg = e.message || e.error || msg; } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      if (!data?.content) throw new Error('Unexpected response format from server.');

      const validated = data.content
        .filter(p => p?.id != null)
        .map(p => ({
          ...p,
          projectTitle:   p.projectTitle   || 'Untitled Project',
          domains:        Array.isArray(p.domains) ? p.domains : [],
          facultyName:    p.facultyName    || 'Unknown',
          description:    p.description    || '',
          duration:       p.duration       || '',
          availableSlots: typeof p.availableSlots === 'number' ? p.availableSlots : 0,
          preRequisites:  p.preRequisites  || '',
          teamConfirmed:  p.teamConfirmed  ?? false,
          teamSize:       p.teamSize       ?? 1,
          // `applied` comes from backend — true when this team has applied to this project
          applied:        p.applied        ?? false,
          appliedOn:      p.appliedOn      ?? null,
        }));

      setProjectlist(validated);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setLoadError('Cannot reach the server. Please check your connection.');
      } else {
        setLoadError(err.message || 'Failed to load projects.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token, API_URL, page, searchQuery, selectedDomain, selectedFaculty, slotFilter, applicationStatusFilter]);

  // ─── Fetch: Student profile ──────────────────────────────────────────────────
  const fetchStudent = async () => {
    if (!token) return;
    try {
      setStudentLoading(true);
      setStudentError(null);

      const response = await fetch(`${API_URL}/api/students/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) throw new Error('Session expired. Please log in again.');
      if (response.status === 404) throw new Error('Student profile not found. Contact your administrator.');

      if (!response.ok) {
        let msg = `Failed to load profile (${response.status})`;
        try { const e = await response.json(); msg = e.message || msg; } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      if (!data) throw new Error('Empty profile response from server.');
      setStudent(data);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setStudentError('Cannot reach the server. Profile unavailable.');
      } else {
        setStudentError(err.message || 'Could not load your profile.');
      }
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => { fetchStudent(); }, [token]);

  // ─── Fetch: Allocation deadline ──────────────────────────────────────────────
  const fetchAllocationDeadline = async () => {
    if (!token) return;
    try {
      setDeadlineLoading(true);
      setDeadlineError(null);

      const response = await fetch(`${API_URL}/api/events/PROJECT_ALLOCATION`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Treat 404 AND 400 (in case ResourceNotFoundException maps there) as 'not_set'
      if (response.status === 404 || response.status === 400) {
        setAllocationDeadline(null);
        setDeadlineError('not_set');
        return;
      }

      if (response.status === 401) {
        setDeadlineError('network');
        return;
      }

      if (!response.ok) {
        // Try to parse the error body — if it looks like a "not announced" message, treat as not_set
        try {
          const e = await response.json();
          const msg = (e.message || e.error || '').toLowerCase();
          if (msg.includes('not') || msg.includes('announced') || msg.includes('found')) {
            setAllocationDeadline(null);
            setDeadlineError('not_set');
            return;
          }
        } catch (_) {}
        setDeadlineError('network');
        return;
      }

      const data = await response.json();
      if (!data?.endDate || !data?.status) {
        setDeadlineError('not_set');  // incomplete data = treat as not configured
        return;
      }
      setAllocationDeadline(data);
    } catch (err) {
      // Only true network failures (TypeError: Failed to fetch) land here
      setDeadlineError('network');
      setAllocationDeadline(null);
    } finally {
      setDeadlineLoading(false);
    }
  };

  useEffect(() => { fetchAllocationDeadline(); }, [token, API_URL]);

  // ─── Fetch: Filters ──────────────────────────────────────────────────────────
  const fetchFilters = async () => {
    if (!token) return;
    try {
      setIsFilterLoading(true);
      setFilterError(null);

      const response = await fetch(`${API_URL}/api/students/projects/filters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) throw new Error('Session expired. Please log in again.');

      if (!response.ok) {
        let msg = `Could not load filters (${response.status})`;
        try { const e = await response.json(); msg = e.message || msg; } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      setAllDomains((data.domains || []).sort());
      setAllFaculty((data.faculty || []).sort());
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setFilterError('Cannot reach server. Filters unavailable.');
      } else {
        setFilterError(err.message || 'Could not load filters.');
      }
    } finally {
      setIsFilterLoading(false);
    }
  };

  useEffect(() => { fetchFilters(); }, [token]);

  // ─── Resets ──────────────────────────────────────────────────────────────────
  useEffect(() => { setPage(0); }, [searchQuery, selectedDomain, selectedFaculty, slotFilter, applicationStatusFilter]);

  // Debounce search input — fires API call 500ms after the user stops typing
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchInput]);
  useEffect(() => { setProjectlist([]); setPage(0); }, [token]);

  useEffect(() => {
    if (activeProjectId === null) {
      setActiveProject(null);
    } else {
      setActiveProject(projectlist.find(p => p.id === activeProjectId) || null);
    }
  }, [activeProjectId, projectlist]);

  useEffect(() => {
    const handler = (e) => {
      if (domainRef.current && !domainRef.current.contains(e.target)) setShowDomainDropdown(false);
      if (facultyRef.current && !facultyRef.current.contains(e.target)) setShowFacultyDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSearchInput('');
    setSelectedDomain('');
    setSelectedFaculty('');
    setSlotFilter('all');
    setApplicationStatusFilter('NOT_APPLIED');
  };

  // ─── Banner config ────────────────────────────────────────────────────────────
  const bannerConfig = useMemo(() => {
    // ── Error / not configured ────────────────────────────────────────────────
    if (deadlineError === 'network') return {
      color: 'bg-red-50 border-red-200 text-red-700',
      icon: <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      message: 'Could not load allocation dates. Please refresh the page.',
      showRetry: true,
    };
    if (deadlineError === 'not_set' || !allocationDeadline) return {
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      icon: <svg className="w-4 h-4 text-orange-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      message: 'Project allocation has not been announced yet.',
      showRetry: false,
    };
    // ── Status from DTO ───────────────────────────────────────────────────────
    if (allocationStatus === 'Active') return {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>,
      message: 'Project allocation is open — apply now!',
      showRetry: false,
    };
    if (allocationStatus === 'Upcoming') return {
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <svg className="w-4 h-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>,
      message: 'Project allocation is upcoming — applications not open yet.',
      showRetry: false,
    };
    if (allocationStatus === 'Passed') return {
      color: 'bg-gray-50 border-gray-200 text-gray-600',
      icon: <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      message: 'Project allocation window has closed.',
      showRetry: false,
    };
    // Fallback (unknown status string)
    return {
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <svg className="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      message: 'Project allocation status unknown.',
      showRetry: false,
    };
  }, [deadlineError, allocationDeadline, allocationStatus]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <div className='flex min-h-screen'>
        <Sidebar />
        <div className='projects flex flex-1 flex-col lg:flex-row'>
          <div className='flex-1 p-4'>

            {/* ── Allocation Banner ─────────────────────────────────────────── */}
            {deadlineLoading ? (
              <div className="mb-5 px-4 py-3 rounded-xl border border-orange-200/60 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Skeleton height={16} width={220} />
                  <Skeleton height={16} width={140} />
                </div>
              </div>
            ) : (
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5 px-4 py-3 rounded-xl border text-sm font-medium ${bannerConfig.color}`}>
                
                <div className='flex items-center gap-2'>
                  {bannerConfig.icon}
                  <span>{bannerConfig.message}</span>

                  {bannerConfig.showRetry && (
                    <button
                      onClick={fetchAllocationDeadline}
                      className='ml-1 text-xs font-semibold underline opacity-80 hover:opacity-100'
                    >
                      Retry
                    </button>
                  )}
                </div>

                {allocationDeadline && (
                  <div className='flex items-center gap-1.5 text-xs font-semibold bg-white/70 border border-current/20 px-3 py-1.5 rounded-lg whitespace-nowrap'>
                    {allocationDeadline.startDate
                      ? `${formatDate(allocationDeadline.startDate)} – ${formatDate(allocationDeadline.endDate)}`
                      : `Till ${formatDate(allocationDeadline.endDate)}`
                    }
                  </div>
                )}
              </div>
            )}

            {/* ── Student profile error (inline, non-blocking) ──────────────── */}
            {!studentLoading && studentError && (
              <InlineAlert message={studentError} onRetry={fetchStudent} />
            )}

            {/* ── Filter Section ────────────────────────────────────────────── */}
            <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-5 mb-6 transition-all duration-300'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-amber-900 flex items-center gap-2'>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                  </svg>
                  Filters
                  {hasActiveFilters && (
                    <span className='ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full'>Active</span>
                  )}
                </h2>
                <div className='flex items-center gap-3'>
                  {hasActiveFilters && isFilterExpanded && (
                    <button onClick={clearFilters} className='text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors'>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setIsFilterExpanded(p => !p)} className='p-1.5 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300'>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={`overflow-visible transition-all duration-300 ease-out ${isFilterExpanded ? 'max-h-[32rem] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>

                {/* Filter error */}
                {filterError && !isFilterLoading && (
                  <InlineAlert message={filterError} onRetry={fetchFilters} />
                )}

                {isFilterLoading ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className='space-y-2'>
                        <Skeleton height={14} width={60} />
                        <Skeleton height={40} width="100%" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>

                    {/* Search */}
                    <div className='relative'>
                      <label className='block text-xs font-medium text-amber-700 mb-1.5'>Search</label>
                      <div className='relative'>
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                          type="text" placeholder="Search projects..." value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className='w-full pl-9 pr-4 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all'
                        />
                      </div>
                    </div>

                    {/* Domain */}
                    <div className="relative" ref={domainRef}>
                      <label className='block text-xs font-medium text-amber-700 mb-1.5'>Domain</label>
                      <div
                        onClick={() => { setShowDomainDropdown(p => !p); setShowFacultyDropdown(false); }}
                        className='w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 cursor-pointer'
                      >
                        {selectedDomain || 'All Domains'}
                      </div>
                      {showDomainDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-orange-200 rounded-lg shadow max-h-60 overflow-y-auto">
                          <input type="text" placeholder="Search domain..." value={domainSearch}
                            onChange={(e) => setDomainSearch(e.target.value)}
                            className="w-full px-3 py-2 border-b border-orange-200 text-sm outline-none"
                          />
                          <div className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                            onClick={() => { setSelectedDomain(''); setShowDomainDropdown(false); setDomainSearch(''); }}>
                            All Domains
                          </div>
                          {filteredDomains.length > 0 ? filteredDomains.map(d => (
                            <div key={d} onClick={() => { setSelectedDomain(d); setShowDomainDropdown(false); setDomainSearch(''); }}
                              className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm">{d}</div>
                          )) : <div className="px-3 py-2 text-sm text-gray-500">No results</div>}
                        </div>
                      )}
                    </div>

                    {/* Faculty */}
                    <div className="relative" ref={facultyRef}>
                      <label className='block text-xs font-medium text-amber-700 mb-1.5'>Faculty</label>
                      <div
                        onClick={() => { setShowFacultyDropdown(p => !p); setShowDomainDropdown(false); }}
                        className='w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 cursor-pointer'
                      >
                        {selectedFaculty || 'All Faculty'}
                      </div>
                      {showFacultyDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-orange-200 rounded-lg shadow max-h-60 overflow-y-auto">
                          <input type="text" placeholder="Search faculty..." value={facultySearch}
                            onChange={(e) => setFacultySearch(e.target.value)}
                            className="w-full px-3 py-2 border-b border-orange-200 text-sm outline-none"
                          />
                          <div className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                            onClick={() => { setSelectedFaculty(''); setShowFacultyDropdown(false); setFacultySearch(''); }}>
                            All Faculty
                          </div>
                          {filteredFaculty.length > 0 ? filteredFaculty.map(f => (
                            <div key={f} onClick={() => { setSelectedFaculty(f); setShowFacultyDropdown(false); setFacultySearch(''); }}
                              className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm">{f}</div>
                          )) : <div className="px-3 py-2 text-sm text-gray-500">No results</div>}
                        </div>
                      )}
                    </div>

                    {/* Slots */}
                    <div>
                      <label className='block text-xs font-medium text-amber-700 mb-1.5'>Availability</label>
                      <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}
                        className='w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all cursor-pointer'>
                        <option value="all">Vacant (&gt;0)</option>
                        <option value="1">1 Slot</option>
                        <option value="2">2 Slots</option>
                        <option value="3">3 Slots</option>
                      </select>
                    </div>

                    {/* ── NEW: Application Status filter ──────────────────────── */}
                    <div>
                      <label className='block text-xs font-medium text-amber-700 mb-1.5'>Application Status</label>
                      <select
                        value={applicationStatusFilter}
                        onChange={(e) => setApplicationStatusFilter(e.target.value)}
                        className='w-full px-3 py-2 bg-amber-50/50 border border-orange-200 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all cursor-pointer'
                      >
                        <option value="">All</option>
                        <option value="APPLIED">Applied</option>
                        <option value="NOT_APPLIED">Not Applied</option>
                      </select>
                    </div>

                  </div>
                )}

                <div className='mt-4 pt-3 border-t border-orange-100'>
                  {isFilterLoading ? <Skeleton height={16} width={120} /> : (
                    <p className='text-sm text-amber-600'>
                      Showing <span className='font-semibold text-amber-800'>{projectlist.length}</span> projects
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Project Cards skeleton ────────────────────────────────────── */}
            {isLoading && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-5'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-slate-100' />
                          <div className='space-y-2'><Skeleton height={16} width={120} /><Skeleton height={12} width={80} /></div>
                        </div>
                        <div className='w-16 h-6 rounded-full bg-slate-100' />
                      </div>
                      <div className='space-y-2'><Skeleton height={20} width="85%" /><Skeleton height={16} width="60%" /></div>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-slate-100' />
                        <div className='space-y-1'><Skeleton height={12} width={60} /><Skeleton height={14} width={100} /></div>
                      </div>
                      <div className='space-y-2'>
                        <Skeleton height={12} width={70} />
                        <div className='flex gap-2'><div className='w-20 h-6 rounded-lg bg-slate-100' /><div className='w-16 h-6 rounded-lg bg-slate-100' /></div>
                      </div>
                      <div className='w-full h-10 rounded-lg bg-slate-100' />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Full-page project error ───────────────────────────────────── */}
            {loadError && !isLoading && (
              <div className='flex flex-col items-center justify-center py-16 text-red-600'>
                <svg className="w-16 h-16 mb-4 text-red-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className='text-lg font-medium text-center'>{loadError}</p>
                <button onClick={fetchProjects} className='mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'>
                  Retry
                </button>
              </div>
            )}

            {/* ── Pagination ────────────────────────────────────────────────── */}
            {!isLoading && !loadError && totalPages > 1 && (
              <div className="flex flex-col items-center mt-8 gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button onClick={handlePrev} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                  {getPageNumbers().map((item, idx) =>
                    item === '...' ? <span key={idx} className="px-2">...</span> : (
                      <button key={item} onClick={() => handlePageClick(item)}
                        className={`px-3 py-1 border rounded ${page === item ? 'bg-orange-500 text-white' : ''}`}>
                        {item + 1}
                      </button>
                    )
                  )}
                  <button onClick={handleNext} disabled={page === totalPages - 1} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700">Go to page:</span>
                  <input type="number" min="1" max={totalPages} value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="w-16 px-2 py-1 border rounded text-sm" />
                  <button onClick={handlePageInput} className="px-2 py-1 bg-orange-500 text-white rounded text-sm">Go</button>
                </div>
              </div>
            )}

            {/* ── Project grid ──────────────────────────────────────────────── */}
            {!isLoading && !loadError && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {projectlist.length > 0 ? (
                  projectlist.map(project => project?.id ? (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      activeProjectId={activeProjectId}
                      setActiveProjectId={setActiveProjectId}
                    />
                  ) : null)
                ) : (
                  <div className='col-span-full text-center text-amber-600 py-10'>No projects found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Project Detail Panel ──────────────────────────────────────────── */}
        <div className={`${activeProject?.projectTitle
            ? 'fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none'
            : 'hidden lg:block'
          } lg:w-80 xl:w-96 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start`}>
          <div className='h-full p-4 border-l border-orange-200/60 bg-white/95 lg:bg-gradient-to-b lg:from-amber-50/50 lg:to-orange-50/30 overflow-y-auto ml-auto max-w-md lg:max-w-none'>
            {activeProject?.projectTitle ? (
              <div className='w-full max-w-md mx-auto lg:max-w-none'>
                <button onClick={() => setActiveProjectId(null)} className='lg:hidden mb-4 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors'>
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

                  <h3 className='text-base lg:text-lg font-semibold text-amber-900 mb-2 lg:mb-3 leading-tight'>{activeProject.projectTitle}</h3>

                  <div className="mb-3 lg:mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-1 uppercase tracking-wide">Description</p>
                    <p className="text-sm text-amber-800 leading-relaxed bg-amber-50 p-3 rounded-lg border border-orange-100
                      break-words overflow-y-auto max-h-[7.5rem] [line-clamp:5]"
                      style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'auto' }}>
                      {activeProject.description || 'No description available'}
                    </p>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-amber-700 mb-3 lg:mb-4 p-2 lg:p-3 bg-amber-50 rounded-lg'>
                    <svg className="w-5 h-5 flex-shrink-0 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <div>
                      <p className='text-xs text-amber-500'>Faculty</p>
                      <p className='font-medium text-amber-800'>{activeProject.facultyName}</p>
                    </div>
                  </div>

                  {activeProject.domains?.length > 0 && (
                    <div className='mb-3 lg:mb-4'>
                      <p className='text-xs font-medium text-amber-600 mb-1.5 uppercase tracking-wide'>Domains</p>
                      <div className='flex flex-wrap gap-1.5'>
                        {activeProject.domains.map((d, i) => (
                          <span key={i} className='px-2 lg:px-3 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg text-xs font-medium text-amber-800'>{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Duration</p>
                    <p className="text-sm text-amber-800">{activeProject.duration ? `${activeProject.duration} semesters` : 'Not specified'}</p>
                  </div>

                  {activeProject.preRequisites && (
                    <div className="mb-3 lg:mb-4">
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1.5">Prerequisites</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProject.preRequisites.split(/[,;]/).map(s => s.trim()).filter(Boolean).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200 break-words">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex items-center justify-between p-2 lg:p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-100 mb-3 lg:mb-4'>
                    <div className='flex items-center gap-2'>
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <span className='text-sm text-amber-700'>Available Slots</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${activeProject.availableSlots >= activeProject.teamSize ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {activeProject.availableSlots > 0 ? activeProject.availableSlots : 'Full'}
                    </span>
                  </div>

                  {activeProject.teamSize > 0 && activeProject.availableSlots < activeProject.teamSize && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <p className="text-sm text-red-700 font-medium">
                        Not enough slots (Required: {activeProject.teamSize}, Available: {activeProject.availableSlots})
                      </p>
                    </div>
                  )}

                  {/* ── Apply / Already Applied button ─────────────────────── */}
                  <div className='relative group'>
                    <button
                      disabled={isApplyDisabled}
                      onClick={() => { if (!isApplyDisabled) navigate(`/applicationform/${activeProject.id}`); }}
                      className={`w-full py-2.5 px-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2
                        ${activeProject.applied
                          ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                          : !isApplyDisabled
                            ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {activeProject.applied ? (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          Applied
                        </>
                      ) : 'Apply Now'}
                    </button>

                    {/* Tooltip — shown when disabled for any reason */}
                    {isApplyDisabled && (
                      <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg'>
                        {applyDisabledReason}
                        <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800' />
                      </div>
                    )}
                  </div>

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
  );
};

export default ProjectListing;