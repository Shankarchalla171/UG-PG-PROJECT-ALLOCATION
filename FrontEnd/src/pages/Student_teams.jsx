import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { AuthContext } from '../context/AuthContext';

const Student_teams = () => {
    const { token, temaId, teamRole, authDispatch } = useContext(AuthContext);
    const [view, setView] = useState('selection');
    const [teamId, setTeamId] = useState('');
    const [joinTeamId, setJoinTeamId] = useState('');
    const [currentTeam, setCurrentTeam] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [copied, setCopied] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isLeavingTeam, setIsLeavingTeam] = useState(false);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL ;

    useEffect(() => {
        if (teamRole == null)
            setView('selection');
        else {
            const fetchTeamDetails = async () => {
                try {
                    const url = `${API_URL}/api/teams`;
                    const response = await fetch('/api/teams', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });

                    if (!response.ok) {
                        const msg = await response.text();
                        throw new Error(msg || 'Failed to fetch team details');
                    }

                    const teamData = await response.json();
                    setCurrentTeam(teamData);
                    setTeamId(teamData.teamId);
                    setIsFinalized(teamData.isFinalized);
                    if (teamData.isFinalized) {
                        setView('teamFinalized');
                    } else if (teamRole === "TEAMlEAD") {
                        setView('teamCreated');
                    } else
                        setView('teamJoined');

                } catch (error) {
                    setToast({ show: true, type: 'error', message: error.message || 'Failed to fetch team details.' });
                }
            }
            fetchTeamDetails();
        }
    }, []);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(teamId);
        setCopied(true);
        setToast({ show: true, type: 'success', message: 'Team ID copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateTeam = async () => {
        try {
            setLoading(true);
            const url = `${API_URL}/api/teams`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || 'Failed to create team');
            }

            const data = await response.json();
            setTeamId(data.teamId);
            setCurrentTeam(data);
            authDispatch({
                type: "setTeam",
                payload: {
                    teamRole: "TEAMLEAD"
                }
            });
            setView('teamCreated');
            setToast({ show: true, type: 'success', message: 'Team created successfully!' });
        } catch (error) {
            setToast({ show: true, type: 'error', message: error.message || 'Failed to create team.' });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTeam = async () => {
        if (teamId && teamRole) {
            setToast({ show: true, type: 'error', message: 'You are already a member of this team!' });
            return;
        }

        try {
            setLoading(true);
            const url = `${API_URL}/api/teams/${joinTeamId.trim()}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Failed to join team");
            }

            const data = await response.json();
            setTeamId(data.teamId);
            setCurrentTeam(data);
            setView("teamJoined");

            authDispatch({
                type: "setTeam",
                payload: {
                    teamRole: "TEAM_MEMBER"
                }
            });

            setToast({ show: true, type: "success", message: "Successfully joined the team!" });

        } catch (error) {
            setToast({ show: true, type: "error", message: error.message || "Failed to join team" });
        } finally {
            setLoading(false);
        }
    };

    const leaveTeam = async () => {
        const url = 'api/teams/leave';
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Failed to leave team");
        }

        setToast({ show: true, type: 'success', message: 'You have left the team!' });
        setView('selection');
        setJoinTeamId('');
        setCurrentTeam(null);
        setIsFinalized(false);
        setSelectedNewLeaderId('');

        authDispatch({
            type: "setTeam",
            payload: null,
        });
    };

    const handleBack = async () => {
        setIsLeavingTeam(true);
        if (view === 'teamCreated' && currentTeam?.members?.length > 1) {
            setView('leaveSteps');
            setIsLeavingTeam(false);
            return;
        }
        try {
            await leaveTeam();
        } catch (error) {
            setToast({
                show: true,
                type: 'error',
                message: error.message || 'Failed to leave team. Please try again.',
            });
        } finally {
            setIsLeavingTeam(false);
        }
    };

    const handleFinalizeTeam = async () => {
        try {
            setLoading(true);
            const url = `${API_URL}/api/teams/finalize/${teamId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Failed to finalize team");
            }

            const data = await response.text();
            setIsFinalized(true);
            setView('teamFinalized');
            setToast({ show: true, type: 'success', message: data || 'Team finalized successfully! You can now apply for projects.' });

        } catch (error) {
            setToast({ show: true, type: 'error', message: error.message || 'Failed to finalize team. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Stepper for team dashboard
    const getStepStatus = () => {
        const members = currentTeam?.members?.length || 1;
        if (isFinalized) return 3;
        if (members > 1) return 2;
        return 1;
    };

    return (
        <>
            <Navbar />
            <main className='flex min-h-screen bg-gradient-to-b from-amber-50/50 to-orange-50/30'>
                <Sidebar />
                <div className='flex-1 p-6 md:p-8 flex flex-col gap-6'>
                    {/* Toast Notification */}
                    <div
                        className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border transition-all duration-500 ${
                            toast.show
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-full opacity-0 pointer-events-none'
                        } ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100'
                                : 'bg-red-50 border-red-200 text-red-800 shadow-red-100'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                {toast.type === 'success' ? (
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                ) : (
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                )}
                            </svg>
                        </div>
                        <span className='font-medium text-sm'>{toast.message}</span>
                        <button
                            onClick={() => setToast({ show: false, type: '', message: '' })}
                            className='ml-2 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer'
                        >
                            <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>

                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center gap-3 mb-1'>
                            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25'>
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold text-amber-900'>Team Management</h1>
                                <p className='text-sm text-amber-600/80'>Create or join a team to collaborate on projects</p>
                            </div>
                        </div>
                    </div>

                    <div className='w-full flex justify-center'>
                        {/* Selection View */}
                        {view === 'selection' && (
                            <div className='w-full max-w-3xl animate-fadeIn'>
                                {/* Immersive Hero Banner */}
                                <div className='relative rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 p-8 md:p-10 mb-8 overflow-hidden shadow-xl shadow-orange-200/40'>
                                    {/* Decorative floating circles */}
                                    <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10'></div>
                                    <div className='absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10'></div>
                                    <div className='absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5'></div>

                                    <div className='relative text-center'>
                                        <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/10'>
                                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                            </svg>
                                        </div>
                                        <span className='inline-block px-3 py-1 mb-3 text-xs font-medium text-white/90 bg-white/20 backdrop-blur-sm rounded-full'>
                                            Step 1 of your project journey
                                        </span>
                                        <h2 className='text-2xl md:text-3xl font-bold text-white mb-2'>Get Started with Your Team</h2>
                                        <p className='text-sm text-white/80 max-w-md mx-auto leading-relaxed'>
                                            Form a team to apply for projects together. Create a new team or join an existing one using a Team Code.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    {/* Create Team Card */}
                                    <button
                                        onClick={() => setView('createConfirm')}
                                        className='group relative p-7 bg-white rounded-2xl border-2 border-orange-200/60 hover:border-orange-400 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500/30'
                                    >
                                        <div className='w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 group-hover:from-orange-500 group-hover:to-rose-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300'>
                                            <svg className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            </svg>
                                        </div>
                                        <h3 className='text-lg font-bold text-amber-900 mb-1.5'>Create Team</h3>
                                        <p className='text-sm text-amber-600/80 leading-relaxed mb-4'>Start a new team and become the team leader.</p>

                                        {/* Feature bullets */}
                                        <ul className='space-y-2 mb-5'>
                                            {['Become the team leader', 'Get a unique Team Code', 'Invite your teammates'].map((item, i) => (
                                                <li key={i} className='flex items-center gap-2 text-xs text-amber-700/80'>
                                                    <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className='flex items-center text-sm font-medium text-orange-500 group-hover:text-orange-600 transition-colors'>
                                            Get started
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* OR divider for mobile */}
                                    <div className='flex md:hidden items-center gap-3'>
                                        <div className='flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent'></div>
                                        <span className='text-xs font-semibold text-amber-400 uppercase tracking-wider'>or</span>
                                        <div className='flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent'></div>
                                    </div>

                                    {/* Join Team Card */}
                                    <button
                                        onClick={() => setView('joinInput')}
                                        className='group relative p-7 bg-white rounded-2xl border-2 border-emerald-200/60 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30'
                                    >
                                        <div className='w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 group-hover:from-emerald-500 group-hover:to-teal-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300'>
                                            <svg className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                        <h3 className='text-lg font-bold text-emerald-900 mb-1.5'>Join Team</h3>
                                        <p className='text-sm text-emerald-600/80 leading-relaxed mb-4'>Have a Team Code? Join an existing team.</p>

                                        {/* Feature bullets */}
                                        <ul className='space-y-2 mb-5'>
                                            {['Enter a shared Team Code', 'Collaborate with your team', 'Apply for projects together'].map((item, i) => (
                                                <li key={i} className='flex items-center gap-2 text-xs text-emerald-700/80'>
                                                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className='flex items-center text-sm font-medium text-emerald-500 group-hover:text-emerald-600 transition-colors'>
                                            Enter code
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Create Confirmation View */}
                        {view === 'createConfirm' && (
                            <div className='w-full max-w-md animate-fadeIn'>
                                <div className='bg-white rounded-2xl border border-orange-200/60 shadow-lg shadow-orange-100/30 p-8 text-center'>
                                    <div className='w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center'>
                                        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                        </svg>
                                    </div>
                                    <h2 className='text-xl font-bold text-amber-900 mb-2'>Create a New Team?</h2>
                                    <p className='text-sm text-amber-600/80 mb-8 leading-relaxed'>
                                        You'll become the team leader. A unique Team Code will be generated that you can share with your teammates.
                                    </p>

                                    {/* Info callout */}
                                    <div className='mb-8 p-4 bg-amber-50/80 rounded-xl border border-amber-200/50 text-left'>
                                        <p className='text-xs font-semibold text-amber-800 mb-2'>As team leader, you can:</p>
                                        <ul className='space-y-1.5'>
                                            {['Share Team Code to invite members', 'Finalize the team when ready', 'Transfer leadership to others'].map((item, i) => (
                                                <li key={i} className='flex items-start gap-2 text-xs text-amber-700'>
                                                    <svg className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setView('selection')}
                                            className='flex-1 px-5 py-3 bg-white border border-orange-200 text-amber-700 font-medium rounded-xl hover:bg-orange-50 transition-all duration-200 cursor-pointer'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateTeam}
                                            disabled={loading}
                                            className='flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                        >
                                            {loading && (
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M12 2v4m0 12v4m-8-10h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8" strokeLinecap="round" />
                                                </svg>
                                            )}
                                            Yes, Create Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Join Team Input View */}
                        {view === 'joinInput' && (
                            <div className='w-full max-w-lg animate-fadeIn'>
                                <div className='bg-white rounded-2xl border border-orange-200/60 shadow-lg shadow-orange-100/30 p-8'>
                                    <button
                                        onClick={() => setView('selection')}
                                        className='mb-6 flex items-center gap-1.5 text-sm text-amber-600 hover:text-orange-600 transition-colors cursor-pointer group'
                                    >
                                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                        </svg>
                                        Back
                                    </button>

                                    <div className='text-center mb-8'>
                                        <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center'>
                                            <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                        <h2 className='text-xl font-bold text-amber-900 mb-1.5'>Join a Team</h2>
                                        <p className='text-sm text-amber-600/80'>
                                            Enter the Team Code shared by your team leader
                                        </p>
                                    </div>

                                    <div className='mb-6'>
                                        <label className='block text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider'>Team Code</label>
                                        <input
                                            type="text"
                                            value={joinTeamId}
                                            onChange={(e) => setJoinTeamId(e.target.value)}
                                            placeholder="e.g., TEAM001"
                                            className='w-full px-5 py-4 bg-amber-50/50 border-2 border-orange-200/80 rounded-xl text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-400 transition-all duration-200 text-center font-mono text-xl tracking-widest'
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && joinTeamId.trim()) handleJoinTeam();
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleJoinTeam}
                                        disabled={!joinTeamId.trim() || loading}
                                        className={`w-full py-3.5 font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                                            joinTeamId.trim()
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        {loading && (
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M12 2v4m0 12v4m-8-10h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        Join Team
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Team Created/Joined/Finalized View */}
                        {(view === 'teamCreated' || view === 'teamJoined' || view === 'teamFinalized') && currentTeam && (
                            <div className='w-full max-w-3xl animate-fadeIn'>
                                <div className='bg-white rounded-2xl border border-orange-200/60 shadow-lg shadow-orange-100/30 overflow-hidden'>
                                    {/* Header with gradient */}
                                    <div className={`relative p-7 text-white text-center overflow-hidden ${
                                        isFinalized
                                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                                            : 'bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600'
                                    }`}>
                                        {/* Decorative circles */}
                                        <div className='absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10'></div>
                                        <div className='absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10'></div>

                                        <div className='relative'>
                                            <div className='w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                                                {isFinalized ? (
                                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <h2 className='text-xl font-bold mb-1'>
                                                {view === 'teamCreated' ? 'Team Created!' : view === 'teamJoined' ? 'Team Joined!' : 'Team Finalized!'}
                                            </h2>
                                            <p className='text-white/80 text-sm'>
                                                {view === 'teamCreated' ? 'Share the Team Code with your teammates' : view === 'teamJoined' ? 'You are now part of this team' : 'Your team is locked in and ready to apply for projects'}
                                            </p>
                                            {isFinalized && (
                                                <span className='inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium'>
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                                    </svg>
                                                    Finalized
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='p-7'>
                                        {/* Progress Stepper */}
                                        {!isFinalized && (
                                            <div className='mb-7 pb-7 border-b border-orange-100'>
                                                <div className='flex items-center justify-between'>
                                                    {[
                                                        { label: 'Team Created', step: 1 },
                                                        { label: 'Members Joined', step: 2 },
                                                        { label: 'Finalized', step: 3 },
                                                    ].map(({ label, step }, i) => {
                                                        const current = getStepStatus();
                                                        const isCompleted = current >= step;
                                                        const isActive = current === step;
                                                        return (
                                                            <React.Fragment key={step}>
                                                                {i > 0 && (
                                                                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors duration-500 ${
                                                                        current >= step ? 'bg-orange-400' : 'bg-orange-100'
                                                                    }`} />
                                                                )}
                                                                <div className='flex flex-col items-center gap-1.5'>
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                                        isCompleted
                                                                            ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20'
                                                                            : 'bg-orange-100 text-orange-400'
                                                                    } ${isActive ? 'ring-4 ring-orange-200' : ''}`}>
                                                                        {isCompleted && step < current ? (
                                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                                            </svg>
                                                                        ) : step}
                                                                    </div>
                                                                    <span className={`text-xs font-medium hidden sm:block ${
                                                                        isCompleted ? 'text-amber-900' : 'text-amber-400'
                                                                    }`}>{label}</span>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Team ID Section */}
                                        {!isFinalized && (
                                            <div className='mb-7'>
                                                <label className='block text-xs font-semibold text-amber-600 mb-2.5 uppercase tracking-wider'>Team Code</label>
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex-1 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-orange-200 rounded-xl font-mono text-2xl font-bold text-amber-900 text-center tracking-wider'>
                                                        {teamId}
                                                    </div>
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                                            copied
                                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600 scale-95'
                                                                : 'bg-white border-orange-200 text-amber-600 hover:bg-orange-50 hover:border-orange-300 hover:scale-105'
                                                        }`}
                                                        title="Copy Team Code"
                                                    >
                                                        {copied ? (
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                <p className='text-xs text-amber-500 mt-2 text-center'>Share this code with teammates so they can join</p>
                                            </div>
                                        )}

                                        {/* Team Members Section */}
                                        <div>
                                            <div className='flex items-center justify-between mb-3'>
                                                <label className='text-xs font-semibold text-amber-600 uppercase tracking-wider'>
                                                    Team Members
                                                </label>
                                                <span className='text-xs font-medium text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full'>
                                                    {currentTeam.members.length} {currentTeam.members.length === 1 ? 'member' : 'members'}
                                                </span>
                                            </div>
                                            <div className='space-y-2.5'>
                                                {currentTeam.members.map((member, idx) => (
                                                    <div
                                                        key={member.studentId}
                                                        className='flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-orange-100 hover:border-orange-200 hover:shadow-sm transition-all duration-200'
                                                    >
                                                        <div className='relative'>
                                                            <div className='w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm'>
                                                                {member.name?.charAt(0) || 'M'}
                                                            </div>
                                                            {(member.teamRole === "TEAMlEAD" || member.teamRole === "TEAMLEAD") && (
                                                                <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm border-2 border-white'>
                                                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='flex-1 min-w-0'>
                                                            <p className='text-sm font-semibold text-amber-900 truncate'>{member.name}</p>
                                                            <p className='text-xs text-amber-500'>{member.rollNumber}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 ${
                                                            member.teamRole === "TEAMlEAD" || member.teamRole === "TEAMLEAD"
                                                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 ring-1 ring-amber-200'
                                                                : 'bg-orange-50 text-orange-600'
                                                        }`}>
                                                            {member.teamRole === "TEAMlEAD" || member.teamRole === "TEAMLEAD" ? "Leader" : "Member"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='mt-7 pt-6 border-t border-orange-100 flex flex-col sm:flex-row gap-3'>
                                            {!isFinalized && (
                                                <button
                                                    onClick={handleBack}
                                                    className='flex-1 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2'
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                                    </svg>
                                                    Leave Team
                                                </button>
                                            )}
                                            {view === 'teamCreated' && !isFinalized && (
                                                <button
                                                    onClick={handleFinalizeTeam}
                                                    disabled={loading}
                                                    className='flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                                >
                                                    {loading ? (
                                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M12 2v4m0 12v4m-8-10h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8" strokeLinecap="round" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                        </svg>
                                                    )}
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

            {/* Animation keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </>
    )
}

export default Student_teams;
