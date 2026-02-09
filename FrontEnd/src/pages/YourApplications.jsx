import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RequestCard from '../components/RequestCard';
import applications from '../../public/dummyData/studentApplications';

const YourApplications = () => {
    const [yourApplications, setYourApplications] = useState([]);
    const [sortBy, setSortBy] = useState('all');

    useEffect(()=>{
        //fetch the applications of the logged in student and set it to yourApplications state
        setYourApplications(applications);
    },[]);

    // write code for sorting based on status
    const sortedApplications = useMemo(() => {
        if (sortBy === 'all') return yourApplications;
        return yourApplications.filter(app => app.status === sortBy);
    }, [yourApplications, sortBy]);

    return (
        <> 
          <Navbar />
          <main className='min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30'>
            <div className='flex'>
                <Sidebar/>
                <div className='flex-1 p-6'>
                    {/* Header */}
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-amber-900 flex items-center gap-3'>
                            <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                            Your Applications
                        </h1>
                        <p className='text-sm text-amber-600 mt-1 ml-10'>Track the status of your project applications</p>
                    </div>

                    {/* Stats Bar */}
                    <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-4 mb-6'>
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
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Applications List */}
                    <div className='space-y-4'>
                        {
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
                        }
                    </div>
                </div>
            </div>
          </main>
        </>
    )
}

export default YourApplications;