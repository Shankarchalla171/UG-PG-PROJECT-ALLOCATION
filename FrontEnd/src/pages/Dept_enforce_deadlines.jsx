import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DeptEnforceDeadlines = () => {
  // Mock data for deadlines
  const [deadlines, setDeadlines] = useState([
    {
      id: 1,
      phase: "team_formation",
      title: "Team Formation",
      description: "Students must form teams and register their team details",
      currentDeadline: "2024-03-15",
      status: "upcoming",
      assignedBy: "Dept. Coordinator",
      lastModified: "2024-02-10",
      notifications: true,
      projectsAffected: 25,
      teamsRegistered: 18
    },
    {
      id: 2,
      phase: "project_creation",
      title: "Project Creation",
      description: "Professors must create and publish project proposals",
      currentDeadline: "2024-03-20",
      status: "upcoming",
      assignedBy: "Dept. Coordinator",
      lastModified: "2024-02-12",
      notifications: true,
      projectsAffected: 15,
      teamsRegistered: 0
    },
    {
      id: 3,
      phase: "project_application",
      title: "Project Application",
      description: "Teams must apply to projects with their proposals",
      currentDeadline: "2024-03-25",
      status: "upcoming",
      assignedBy: "Dept. Coordinator",
      lastModified: "2024-02-08",
      notifications: true,
      projectsAffected: 15,
      teamsRegistered: 18
    },
    {
      id: 4,
      phase: "project_acceptance",
      title: "Project Acceptance",
      description: "Professors must review and accept team applications",
      currentDeadline: "2024-03-30",
      status: "upcoming",
      assignedBy: "Dept. Coordinator",
      lastModified: "2024-02-05",
      notifications: true,
      projectsAffected: 15,
      teamsRegistered: 18
    },
    {
      id: 5,
      phase: "midterm_evaluation",
      title: "Midterm Evaluation",
      description: "Professors submit midterm progress reports",
      currentDeadline: "2024-04-25",
      status: "upcoming",
      assignedBy: "Dept. Head",
      lastModified: "2024-02-01",
      notifications: false,
      projectsAffected: 12,
      teamsRegistered: 0
    },
    {
      id: 6,
      phase: "final_submission",
      title: "Final Project Submission",
      description: "Teams submit final project deliverables and documentation",
      currentDeadline: "2024-05-30",
      status: "upcoming",
      assignedBy: "Dept. Head",
      lastModified: "2024-01-20",
      notifications: true,
      projectsAffected: 12,
      teamsRegistered: 0
    }
  ]);

  const [newDeadline, setNewDeadline] = useState({
    phase: "",
    title: "",
    description: "",
    deadlineDate: "",
    notifications: true
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    deadlineDate: "",
    title: "",
    description: "",
    notifications: true
  });

  const [filter, setFilter] = useState('all'); // all, upcoming, active, passed, today
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate stats
  const stats = {
    totalDeadlines: deadlines.length,
    upcomingDeadlines: deadlines.filter(d => d.status === 'upcoming').length,
    activeDeadlines: deadlines.filter(d => d.status === 'active').length,
    passedDeadlines: deadlines.filter(d => d.status === 'passed').length
  };

  // Filter deadlines
  const filteredDeadlines = deadlines.filter(deadline => {
    if (filter === 'all') return true;
    return deadline.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'passed': return 'bg-rose-100 text-rose-800';
      case 'today': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'passed': return 'Passed';
      case 'today': return 'Due Today';
      default: return status;
    }
  };

  const getPhaseIcon = (phase) => {
    switch(phase) {
      case 'team_formation': return '👥';
      case 'project_creation': return '📝';
      case 'project_application': return '📄';
      case 'project_acceptance': return '✅';
      case 'midterm_evaluation': return '📊';
      case 'final_submission': return '🏁';
      default: return '📅';
    }
  };

  const getPhaseColor = (phase) => {
    switch(phase) {
      case 'team_formation': return 'bg-purple-100 text-purple-800';
      case 'project_creation': return 'bg-amber-100 text-amber-800';
      case 'project_application': return 'bg-blue-100 text-blue-800';
      case 'project_acceptance': return 'bg-green-100 text-green-800';
      case 'midterm_evaluation': return 'bg-cyan-100 text-cyan-800';
      case 'final_submission': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddDeadline = () => {
    if (!newDeadline.phase || !newDeadline.title || !newDeadline.deadlineDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newId = deadlines.length + 1;
    const newDeadlineObj = {
      id: newId,
      phase: newDeadline.phase,
      title: newDeadline.title,
      description: newDeadline.description,
      currentDeadline: newDeadline.deadlineDate,
      status: "upcoming",
      assignedBy: "Dept. Coordinator",
      lastModified: new Date().toISOString().split('T')[0],
      notifications: newDeadline.notifications,
      projectsAffected: 0,
      teamsRegistered: 0
    };

    setDeadlines([...deadlines, newDeadlineObj]);
    setNewDeadline({
      phase: "",
      title: "",
      description: "",
      deadlineDate: "",
      notifications: true
    });
    setShowAddForm(false);
    alert('New deadline added successfully!');
  };

  const handleEditDeadline = (id) => {
    const deadline = deadlines.find(d => d.id === id);
    setEditingId(id);
    setEditForm({
      deadlineDate: deadline.currentDeadline,
      title: deadline.title,
      description: deadline.description,
      notifications: deadline.notifications
    });
  };

  const handleSaveEdit = (id) => {
    if (!editForm.deadlineDate) {
      alert('Please select a deadline date');
      return;
    }

    setDeadlines(deadlines.map(deadline => 
      deadline.id === id 
        ? { 
            ...deadline, 
            currentDeadline: editForm.deadlineDate,
            title: editForm.title,
            description: editForm.description,
            notifications: editForm.notifications,
            lastModified: new Date().toISOString().split('T')[0]
          } 
        : deadline
    ));

    setEditingId(null);
    alert('Deadline updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteDeadline = (id) => {
    if (window.confirm('Are you sure you want to delete this deadline?')) {
      setDeadlines(deadlines.filter(deadline => deadline.id !== id));
      alert('Deadline deleted successfully!');
    }
  };

  const handleToggleNotifications = (id) => {
    setDeadlines(deadlines.map(deadline => 
      deadline.id === id 
        ? { ...deadline, notifications: !deadline.notifications }
        : deadline
    ));
  };

  const handleMarkAsPassed = (id) => {
    setDeadlines(deadlines.map(deadline => 
      deadline.id === id 
        ? { ...deadline, status: 'passed' }
        : deadline
    ));
  };

  const handleMarkAsActive = (id) => {
    setDeadlines(deadlines.map(deadline => 
      deadline.id === id 
        ? { ...deadline, status: 'active' }
        : deadline
    ));
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const daysUntilDeadline = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <h1 className="text-3xl font-bold text-amber-800">Enforce Deadlines</h1>
              <p className="text-amber-600/70 mt-2">Manage project timeline deadlines across all phases</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Total Deadlines</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.totalDeadlines}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Upcoming</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.upcomingDeadlines}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600/70">Active</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.activeDeadlines}</h3>
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
                    <p className="text-sm text-amber-600/70">Passed</p>
                    <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.passedDeadlines}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-orange-200 hover:bg-amber-50'}`}
                    >
                      All Deadlines
                    </button>
                    <button
                      onClick={() => setFilter('upcoming')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setFilter('active')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'}`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilter('passed')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === 'passed' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'}`}
                    >
                      Passed
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/25 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Deadline
                  </button>
                </div>

                {/* Add Deadline Form */}
                {showAddForm && (
                  <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200">
                    <h3 className="text-lg font-bold text-amber-800 mb-4">Add New Deadline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-600/70 mb-2">
                          Phase *
                        </label>
                        <select
                          value={newDeadline.phase}
                          onChange={(e) => setNewDeadline({...newDeadline, phase: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                        >
                          <option value="">Select Phase</option>
                          <option value="team_formation">Team Formation</option>
                          <option value="project_creation">Project Creation</option>
                          <option value="project_application">Project Application</option>
                          <option value="project_acceptance">Project Acceptance</option>
                          <option value="midterm_evaluation">Midterm Evaluation</option>
                          <option value="final_submission">Final Submission</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-amber-600/70 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={newDeadline.title}
                          onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          placeholder="Enter deadline title"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-amber-600/70 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newDeadline.description}
                          onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          rows="3"
                          placeholder="Enter deadline description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-amber-600/70 mb-2">
                          Deadline Date *
                        </label>
                        <input
                          type="date"
                          value={newDeadline.deadlineDate}
                          onChange={(e) => setNewDeadline({...newDeadline, deadlineDate: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="notifications"
                          checked={newDeadline.notifications}
                          onChange={(e) => setNewDeadline({...newDeadline, notifications: e.target.checked})}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="notifications" className="text-sm text-amber-600/70">
                          Send email notifications
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleAddDeadline}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                      >
                        Add Deadline
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-medium rounded-xl border border-orange-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deadlines Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDeadlines.map((deadline) => (
                <div key={deadline.id} className="bg-white rounded-2xl border border-orange-200/60 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300">
                  {/* Header */}
                  <div className="p-6 border-b border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(deadline.phase)}`}>
                          {getPhaseIcon(deadline.phase)} {deadline.phase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                          {getStatusText(deadline.status)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleNotifications(deadline.id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${deadline.notifications ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={deadline.notifications ? 'Notifications ON' : 'Notifications OFF'}
                        >
                          {deadline.notifications ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleEditDeadline(deadline.id)}
                          className="p-2 rounded-lg text-amber-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-300"
                          title="Edit Deadline"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDeadline(deadline.id)}
                          className="p-2 rounded-lg text-rose-700 hover:bg-rose-100 hover:text-rose-600 transition-all duration-300"
                          title="Delete Deadline"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-800 mb-2">{deadline.title}</h3>
                    <p className="text-sm text-amber-600/70">{deadline.description}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Deadline Date */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-amber-800 mb-2">Deadline Date</p>
                      {editingId === deadline.id ? (
                        <div className="space-y-4">
                          <input
                            type="date"
                            value={editForm.deadlineDate}
                            onChange={(e) => setEditForm({...editForm, deadlineDate: e.target.value})}
                            className="w-full px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-800"
                          />
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-800"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="w-full px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-800"
                            rows="2"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`notifications-${deadline.id}`}
                              checked={editForm.notifications}
                              onChange={(e) => setEditForm({...editForm, notifications: e.target.checked})}
                              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <label htmlFor={`notifications-${deadline.id}`} className="text-sm text-amber-600/70">
                              Send notifications
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(deadline.id)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                            >
                              Save Changes
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
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200">
                          <p className="text-lg font-bold text-amber-800">{formatDate(deadline.currentDeadline)}</p>
                          <p className="text-sm text-amber-600/70 mt-1">
                            {daysUntilDeadline(deadline.currentDeadline) > 0 
                              ? `${daysUntilDeadline(deadline.currentDeadline)} days remaining`
                              : daysUntilDeadline(deadline.currentDeadline) === 0
                                ? 'Due today!'
                                : `${Math.abs(daysUntilDeadline(deadline.currentDeadline))} days ago`
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                        <p className="text-xs text-blue-600/70">Projects Affected</p>
                        <p className="text-lg font-bold text-blue-800">{deadline.projectsAffected}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-xs text-green-600/70">Teams Registered</p>
                        <p className="text-lg font-bold text-green-800">{deadline.teamsRegistered}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkAsActive(deadline.id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                        >
                          Mark as Active
                        </button>
                        <button
                          onClick={() => handleMarkAsPassed(deadline.id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 text-sm font-medium rounded-lg border border-rose-200 hover:from-rose-100 hover:to-pink-100 transition-all duration-300"
                        >
                          Mark as Passed
                        </button>
                      </div>
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 font-medium rounded-xl border border-orange-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-300">
                        Send Reminder Email
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-orange-200/60 bg-gradient-to-r from-orange-50/30 to-amber-50/30">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-amber-600/70">
                        Assigned by: {deadline.assignedBy}
                      </p>
                      <p className="text-xs text-amber-600/70">
                        Last modified: {deadline.lastModified}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredDeadlines.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">No Deadlines Found</h3>
                <p className="text-amber-600/70">No deadlines match your current filter criteria</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/25"
                >
                  Add Your First Deadline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptEnforceDeadlines;