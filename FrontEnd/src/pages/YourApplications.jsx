import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RequestCard from '../components/RequestCard';
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const YourApplications = () => {
    const { token } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const [yourApplications, setYourApplications] = useState([]);
    const [sortBy, setSortBy] = useState('all');
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState({
        show: false,
        type: '',
        message: ''
    });

    useEffect(() => {
        if (location.state?.toast) {
            setToast({
                show: true,
                type: location.state.toast.type,
                message: location.state.toast.message
            });
        }
    }, [location.state]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {

        const fetchApplications = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${API_URL}/api/students/applications`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch applications");
                }

                const data = await response.json();

                // backend returns Page object -> applications inside content
                setYourApplications(data?.content || []);

            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        if(token){
            fetchApplications();
        }

    }, [token]);

    // write code for sorting based on status
    const sortedApplications = useMemo(() => {
        const filtered = sortBy === 'all'
            ? yourApplications
            : yourApplications.filter(app => app.status === sortBy);

        // sort by appliedOn (latest first)
        return [...filtered].sort((a, b) =>
            new Date(b.appliedOn) - new Date(a.appliedOn)
        );

    }, [yourApplications, sortBy]);
    
    return (
        <> 
          <Navbar />
          <main className='min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30'>
            <div className='flex'>
                <Sidebar/>
                <div className='flex-1 p-6'>
                    {toast.show && (
                        <div className={`fixed top-20 right-6 z-50 px-5 py-4 rounded-xl shadow-lg border 
                            ${toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'}`}>
                            {toast.message}
                        </div>
                    )}
                    
                    {/* Header */}
                    <div className='mb-6'>
                        {loading ? (
                            <div className='flex items-center gap-3'>
                                <div className='w-7 h-7 rounded bg-slate-100' />
                                <div>
                                    <Skeleton height={28} width={220} />
                                    <Skeleton height={16} width={280} className="mt-1" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className='text-2xl font-bold text-amber-900 flex items-center gap-3'>
                                    <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                    </svg>
                                    Your Applications
                                </h1>
                                <p className='text-sm text-amber-600 mt-1 ml-10'>Track the status of your project applications</p>
                            </>
                        )}
                    </div>

                    {/* Stats Bar */}
                    <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6'>
                        {loading ? (
                            <div className='flex flex-wrap items-center gap-4 lg:gap-6'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-10 h-10 rounded-lg bg-slate-100' />
                                    <div className='space-y-1'>
                                        <Skeleton height={12} width={110} />
                                        <Skeleton height={20} width={50} />
                                    </div>
                                </div>
                                <div className='flex items-center gap-2 ml-auto'>
                                    <div className='w-4 h-4 rounded bg-slate-100' />
                                    <Skeleton height={12} width={50} />
                                    <div className='w-28 h-8 rounded-lg bg-slate-100' />
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-wrap items-center gap-4 lg:gap-6'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center'>
                                        <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-amber-500'>
                                            {sortBy === 'all' ? 'Total Applications' : `Showing ${sortBy.toLowerCase()}`}
                                        </p>
                                        <p className='text-lg font-bold text-amber-900'>
                                            {sortBy === 'all' ? yourApplications.length : `${sortedApplications.length} of ${yourApplications.length}`}
                                        </p>
                                    </div>
                                </div>
                                {/* Sort by Status */}
                                <div className='flex items-center gap-2 ml-auto'>
                                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                                    </svg>
                                    <label className='text-xs text-amber-600 font-medium'>Filter by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className='px-3 py-1.5 bg-amber-50 border border-orange-200 rounded-lg text-sm text-amber-800 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer'
                                    >
                                        <option value="all">All Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Accepted</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="TEAM_CONFIRMED">Allocated</option>
                                        <option value="TEAM_REJECTED">Declined</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Applications List */}
                    <div className='space-y-4'>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className='bg-white rounded-xl border border-orange-200/60 border-l-4 border-l-amber-400 shadow-sm overflow-hidden'>
                                    <div className='flex flex-col lg:flex-row lg:items-center p-4 gap-3 lg:gap-6'>
                                        {/* Left Section: Project Info */}
                                        <div className='flex-1 min-w-0 space-y-2'>
                                            <div className='flex justify-between items-start gap-3'>
                                                <div className='space-y-1.5 flex-1'>
                                                    <Skeleton height={20} width="70%" />
                                                    <Skeleton height={14} width="50%" />
                                                </div>
                                                <div className='w-20 h-6 rounded-full bg-slate-100 shrink-0' />
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-4 h-4 bg-slate-100' />
                                                <Skeleton height={14} width={140} />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                                        {/* Meta Info: Applied Date */}
                                        <div className='flex items-center gap-2 lg:mx-6'>
                                            <div className='w-4 h-4 bg-slate-100' />
                                            <div className='space-y-1'>
                                                <Skeleton height={11} width={70} />
                                                <Skeleton height={13} width={85} />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                                        {/* Meta Info: Competitors */}
                                        <div className='flex items-center gap-2 lg:mx-6'>
                                            <div className='w-4 h-4 bg-slate-100' />
                                            <div className='space-y-1'>
                                                <Skeleton height={11} width={85} />
                                                <Skeleton height={13} width={60} />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className='hidden lg:block w-px h-12 bg-orange-200'></div>

                                        {/* Status Box */}
                                        <div className='lg:ml-6'>
                                            <div className='w-24 h-12 rounded-lg bg-slate-100' />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            sortedApplications.length > 0 ? (
                                sortedApplications.map(application => 
                                    application?.applicationId ? (
                                        <RequestCard key={application.applicationId} request={application}/>
                                    ) : null
                                )
                            ) : (
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-12 text-center'>
                                    <svg className="w-16 h-16 mx-auto mb-4 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                    </svg>
                                    <p className='text-lg font-medium text-amber-700'>
                                        {yourApplications.length === 0 ? 'No applications yet' : 'No matching applications'}
                                    </p>
                                    <p className='text-sm text-amber-500 mt-1'>
                                        {yourApplications.length === 0 ? 'Browse projects and apply to get started' : 'Try selecting a different status filter'}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
          </main>
        </>
    )
}

export default YourApplications;