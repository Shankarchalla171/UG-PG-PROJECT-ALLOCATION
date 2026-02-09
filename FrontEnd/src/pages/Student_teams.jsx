import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import students from '../../public/dummyData/students'
import teams from '../../public/dummyData/teams'

const Student_teams = () => {
    const [student, setStudent] = useState({});
    const [view, setView] = useState('selection'); // 'selection', 'createConfirm', 'teamCreated', 'joinInput', 'teamJoined', 'teamFinalized'
    const [teamId, setTeamId] = useState('');
    const [joinTeamId, setJoinTeamId] = useState('');
    const [currentTeam, setCurrentTeam] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [copied, setCopied] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);

    useEffect(() => {
        setStudent(students[2]);
    }, []);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Generate random team ID
    const generateTeamId = () => {
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        return `TEAM${randomNum}`;
    };

    // Copy team ID to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(teamId);
        setCopied(true);
        setToast({ show: true, type: 'success', message: 'Team ID copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle create team confirmation
    const handleCreateTeam = () => {
        const newTeamId = generateTeamId();
        setTeamId(newTeamId);
        const newTeam = {
            teamId: newTeamId,
            students: [{ name: student.name, rollNo: student.rollNo }]
        };
        setCurrentTeam(newTeam);
        setView('teamCreated');
        setToast({ show: true, type: 'success', message: 'Team created successfully!' });
    };

    // Handle join team
    const handleJoinTeam = () => {
        const foundTeam = teams.find(t => t.teamId.toLowerCase() === joinTeamId.trim().toLowerCase());
        if (foundTeam) {
            // Check if team is full (max 3 members, so can't join if already 3 or more)
            if (foundTeam.students.length >= 3) {
                setToast({ show: true, type: 'error', message: 'This team is full! Maximum 3 members allowed.' });
                return;
            }
            // Check if student is already in the team
            const alreadyMember = foundTeam.students.some(s => s.rollNo === student.rollNo);
            if (alreadyMember) {
                setToast({ show: true, type: 'error', message: 'You are already a member of this team!' });
                return;
            }
            // Add student to team
            const updatedTeam = {
                ...foundTeam,
                students: [...foundTeam.students, { name: student.name, rollNo: student.rollNo }]
            };
            setCurrentTeam(updatedTeam);
            setTeamId(foundTeam.teamId);
            setView('teamJoined');
            setToast({ show: true, type: 'success', message: 'Successfully joined the team!' });
        } else {
            setToast({ show: true, type: 'error', message: 'Team not found. Please check the Team ID.' });
        }
    };

    // Reset to selection view
    const handleBack = () => {
        if(view === 'teamCreated') {
            setToast({ show: true, type: 'error', message: 'Team deleted successfully!' });
        }else if(view === 'teamJoined') {
            setToast({ show: true, type: 'success', message: 'You have left the team!' });
        }
        setView('selection');
        setJoinTeamId('');
        setCurrentTeam(null);
        setIsFinalized(false);
    };

    // Handle finalize team
    const handleFinalizeTeam = () => {
        setIsFinalized(true);
        setView('teamFinalized');
        setToast({ show: true, type: 'success', message: 'Team finalized successfully! You can now apply for projects.' });
    };


    return (
        <>
            <Navbar />
            <main className='flex min-h-screen bg-gradient-to-b from-amber-50/50 to-orange-50/30'>
                <Sidebar />
                <div className='flex-1 p-6 flex flex-col gap-6'>
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
                        </div>
                    )}

                    {/* Header */}
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-amber-900 flex items-center gap-3'>
                            <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                            Team Management
                        </h1>
                        <p className='text-sm text-amber-600 mt-1 ml-10'>Create or join a team to collaborate on projects</p>
                    </div>
                    <div className='w-full flex justify-center'>
                        {/* Selection View */}
                        {view === 'selection' && (
                            <div className='w-full max-w-2xl'>
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-8'>
                                    <h2 className='text-lg font-semibold text-amber-900 mb-6 text-center'>What would you like to do?</h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <button
                                            onClick={() => setView('createConfirm')}
                                            className='p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all duration-300 group cursor-pointer'
                                        >
                                            <div className='w-14 h-14 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors'>
                                                <svg className="w-7 h-7 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                                </svg>
                                            </div>
                                            <h3 className='text-lg font-semibold text-amber-900 mb-2'>Create Team</h3>
                                            <p className='text-sm text-amber-600'>Start a new team and invite others</p>
                                        </button>

                                        <button
                                            onClick={() => setView('joinInput')}
                                            className='p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all duration-300 group cursor-pointer'
                                        >
                                            <div className='w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors'>
                                                <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <h3 className='text-lg font-semibold text-emerald-900 mb-2'>Join Team</h3>
                                            <p className='text-sm text-emerald-600'>Join an existing team with Team ID</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Confirmation View */}
                        {view === 'createConfirm' && (
                            <div className='max-w-md'>
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-8 text-center'>
                                    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center'>
                                        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <h2 className='text-xl font-bold text-amber-900 mb-2'>Create a New Team?</h2>
                                    <p className='text-sm text-amber-600 mb-6'>
                                        You will be the team leader. A unique Team ID will be generated that you can share with others.
                                    </p>
                                    <div className='flex gap-3 justify-center'>
                                        <button
                                            onClick={handleBack}
                                            className='px-6 py-2.5 bg-white border border-orange-200 text-amber-700 font-medium rounded-lg hover:bg-orange-50 transition-colors cursor-pointer'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateTeam}
                                            className='px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 shadow-sm hover:shadow-md transition-all cursor-pointer'
                                        >
                                            Yes, Create Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Join Team Input View */}
                        {view === 'joinInput' && (
                            <div className='w-full max-w-3xl'>
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm p-8'>
                                    <button
                                        onClick={handleBack}
                                        className='mb-4 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors cursor-pointer'
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                        </svg>
                                        Back
                                    </button>
                                    <div className='w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center'>
                                        <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    <h2 className='text-xl font-bold text-amber-900 mb-2 text-center'>Join a Team</h2>
                                    <p className='text-sm text-amber-600 mb-6 text-center'>
                                        Enter the Team Code shared by your team leader
                                    </p>
                                    <div className='mb-4'>
                                        <label className='block text-xs font-medium text-amber-700 mb-1.5'>Team Code</label>
                                        <input
                                            type="text"
                                            value={joinTeamId}
                                            onChange={(e) => setJoinTeamId(e.target.value)}
                                            placeholder="e.g., TEAM001"
                                            className='w-full px-4 py-3 bg-amber-50/50 border border-orange-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all text-center font-mono text-lg'
                                        />
                                    </div>
                                    <button
                                        onClick={handleJoinTeam}
                                        disabled={!joinTeamId.trim()}
                                        className={`w-full py-3 font-medium rounded-lg transition-all cursor-pointer ${joinTeamId.trim()
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Join Team
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Team Created/Joined View */}
                        {(view === 'teamCreated' || view === 'teamJoined' || view === 'teamFinalized') && currentTeam && (
                            <div className='w-full max-w-3xl'>
                                <div className='bg-white rounded-xl border border-orange-200/60 shadow-sm overflow-hidden'>
                                    {/* Success Header */}
                                    <div className='bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center'>
                                        <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center'>
                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        </div>
                                        <h2 className='text-xl font-bold mb-1'>
                                            {view === 'teamCreated' ? 'Team Created Successfully!' : view === 'teamJoined' ? 'Joined Team Successfully!' : 'Team Finalized!'}
                                        </h2>
                                        <p className='text-emerald-100 text-sm'>
                                            {view === 'teamCreated' ? 'Share the Team Code with your teammates' : view === 'teamJoined' ? 'You are now part of this team' : 'Your team is ready to apply for projects'}
                                        </p>
                                        {isFinalized && (
                                            <span className='inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium'>
                                                Finalized
                                            </span>
                                        )}
                                    </div>

                                    <div className='p-6'>
                                        {/* Team ID Section */}
                                        <div className='mb-6'>
                                            <label className='block text-xs font-medium text-amber-600 mb-2 uppercase tracking-wide'>Team Code</label>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex-1 px-5 py-4 bg-amber-50 border border-orange-200 rounded-xl font-mono text-2xl font-bold text-amber-900 text-center'>
                                                    {teamId}
                                                </div>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className={`px-4 py-4 rounded-xl border transition-all cursor-pointer ${copied
                                                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                        : 'bg-white border-orange-200 text-amber-700 hover:bg-orange-50 hover:border-orange-300'
                                                        }`}
                                                >
                                                    {copied ? (
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Team Members Section */}
                                        <div>
                                            <label className='block text-xs font-medium text-amber-600 mb-3 uppercase tracking-wide'>
                                                Team Members ({currentTeam.students.length})
                                            </label>
                                            <div className='space-y-3'>
                                                {currentTeam.students.map((member, index) => (
                                                    <div key={index} className='flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-orange-100'>
                                                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm'>
                                                            {member.name?.charAt(0) || 'M'}
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='text-sm font-medium text-amber-900'>{member.name}</p>
                                                            <p className='text-xs text-amber-600'>{member.rollNo}</p>
                                                        </div>
                                                        {index === 0 && (
                                                            <span className='px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full'>
                                                                Leader
                                                            </span>
                                                        )}
                                                        {member.rollNo === student.rollNo && index !== 0 && (
                                                            <span className='px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full'>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='mt-6 flex flex-col sm:flex-row gap-3'>
                                            {!isFinalized && (
                                                <button
                                                    onClick={handleBack}
                                                    className='flex-1 py-3 bg-white border border-orange-200 text-amber-700 font-medium rounded-lg hover:bg-orange-50 transition-colors cursor-pointer'
                                                >
                                                   {view === 'teamCreated' ? 'Delete Team' : 'Leave Team'}
                                                </button>
                                            )}
                                            {view === 'teamCreated' && !isFinalized && (
                                                <button
                                                    onClick={handleFinalizeTeam}
                                                    className='flex-1 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2'
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                    Finalize Team
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}

export default Student_teams;