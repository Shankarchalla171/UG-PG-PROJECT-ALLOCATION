import React, { useContext, useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const normalizeStatus = (status = '') => status.toLowerCase();
const normalizePhase = (phase = '') => String(phase || '').toUpperCase();

const normalizeEvent = (event = {}) => ({
  ...event,
  title: normalizePhase(event.title),
  status: event.status || 'Upcoming',
  startDate: event.startDate || '',
  endDate: event.endDate || '',
  notifications: event.notifications ?? true
});

const formatPhaseLabel = (phase = '') =>
  normalizePhase(phase)
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

const DeptEventManagement = () => {
  const { token } = useContext(AuthContext);

  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const url = `${API_BASE_URL}/api/events`;
    try {
      console.log(`Fetching events from ${url} with token: ${token}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`Error fetching events: ${message}`);
      }

      const data = await response.json();
      console.log('Fetched events:', data);
      if (Array.isArray(data)) {
        setEvents(data.map(normalizeEvent));
      }
    } catch (error) {
      console.log('Error fetching events:', error.message);
    }
  }
  useEffect(() => {
    fetchEvents();
  }, [])

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: getTodayDate(),
    endDate: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [originalForm, setOriginalForm] = useState(null);

  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Reminder modal state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEventId, setReminderEventId] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    subject: "",
    body: "",
    batch: ""
  });

  // Calculate stats
  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => normalizeStatus(e.status) === 'upcoming').length,
    activeEvents: events.filter((e) => normalizeStatus(e.status) === 'active').length,
    passedEvents: events.filter((e) => normalizeStatus(e.status) === 'passed').length
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return normalizeStatus(event.status) === filter;
  });

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'passed': return 'bg-rose-100 text-rose-800';
      case 'today': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (normalizeStatus(status)) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'passed': return 'Passed';
      case 'today': return 'Today';
      default: return status;
    }
  };

  const getPhaseIcon = (phase) => {
    switch (normalizePhase(phase)) {
      case 'TEAM_FORMATION': return '👥';
      case 'PROJECT_CREATION': return '📝';
      case 'PROJECT_ALLOCATION': return '📋';
      default: return '📅';
    }
  };

  const getPhaseColor = (phase) => {
    switch (normalizePhase(phase)) {
      case 'TEAM_FORMATION': return 'bg-purple-100 text-purple-800';
      case 'PROJECT_CREATION': return 'bg-amber-100 text-amber-800';
      case 'PROJECT_ALLOCATION': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addEvent = async () => {
    const url = `${API_BASE_URL}/api/events`;

    try {
      console.log(`Creating event at ${url} with token: ${token} and newEvent:`, newEvent);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEvent)
      })

      if (!response.ok) {
        const message = await response.text();
        alert(`Error adding event: ${message}`);
      }

      const data = await response.json();
      console.log('Event added successfully:', data);
      if (Array.isArray(data)) {
        setEvents(data.map(normalizeEvent));
      } else if (Array.isArray(data?.deadlines)) {
        setEvents(data.deadlines.map(normalizeEvent));
      } else {
        setEvents((prev) => [...prev, normalizeEvent(data)]);
      }

      // Reset form and close
      setNewEvent({
        title: "",
        description: "",
        startDate: getTodayDate(),
        endDate: ""
      });
      setShowAddForm(false);

    } catch (error) {
      console.log('Error adding event:', error.message);
    }
  }

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.endDate) {
      alert('Please fill in all required fields (Phase and End Date)');
      return;
    }
    addEvent();
  };

  const handleEditEvent = (id) => {
    const event = events.find(e => e.id === id);
    const formData = {
      title: normalizePhase(event.title || ''),
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      description: event.description || ''
    };
    setEditingId(id);
    setEditForm(formData);
    setOriginalForm(formData);
  };

  const saveEdit = async (id) => {
    const url = `${API_BASE_URL}/api/events/${id}`;

    // Only include fields that have changed
    const changedFields = {};
    Object.keys(editForm).forEach(key => {
      if (editForm[key] !== originalForm[key]) {
        changedFields[key] = editForm[key];
      }
    });

    // If nothing changed, just close the edit mode
    if (Object.keys(changedFields).length === 0) {
      console.log('No changes detected, skipping API call');
      return;
    }

    try {
      console.log(`Saving edits for event ${id}, changed fields:`, changedFields);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(changedFields)
      });

      console.log(`Response status for editing event ${id}:`, response.status);
      if (!response.ok) {
        const message = await response.text();
        alert(`Error saving edits: ${message}`);
        return;
      }

      const updatedEvent = await response.json();
      console.log('Event updated successfully:', updatedEvent);
      setEvents(events.map(event =>
        event.id === id ? normalizeEvent(updatedEvent) : event
      ));

    } catch (error) {
      console.log(`Error saving edits for event ${id}:`, error.message);
    }
  }

  const handleSaveEdit = (id) => {
    if (!editForm.title || !editForm.endDate) {
      alert('Please fill in all required fields (Phase and End Date)');
      return;
    }
    saveEdit(id);
    setEditingId(null);
    setOriginalForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setOriginalForm(null);
  };

  const deleteEvent = async (id) => {
    const url = `${API_BASE_URL}/api/events/${id}`;
    try {
      console.log(`Deleting event ${id} with token: ${token}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      console.log(response.status);
      if (!response.ok) {
        const message = await response.text();
        alert(`Error deleting event: ${message}`);
      }
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again later.');
    }
  }

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };

  const openReminderModal = (id) => {
    const event = events.find(e => e.id === id);
    setReminderEventId(id);
    setReminderForm({
      subject: `Reminder: ${event.title}`,
      body: `This is a reminder for the ${event.status} event : "${event.title}".\n\nEvent Details:\n- Start Date: ${formatDate(event.startDate)}\n- End Date: ${formatDate(event.endDate)}\n\n${event.description || ''}`,
      batch: ""
    });
    setShowReminderModal(true);
  };

  const closeReminderModal = () => {
    setShowReminderModal(false);
    setReminderEventId(null);
    setReminderForm({ subject: "", body: "", batch: "" });
  };

  const handleSendReminder = async () => {
    if (!reminderForm.batch) {
      alert('Please enter the batch (e.g., b23)');
      return;
    }
    if (!reminderForm.subject || !reminderForm.body) {
      alert('Please fill in subject and body');
      return;
    }

    const url = `${API_BASE_URL}/api/events/${reminderEventId}/reminder`;

    try {
      console.log(`Sending reminder for event ${reminderEventId}`, reminderForm);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: reminderForm.subject,
          body: reminderForm.body,
          batch: reminderForm.batch
        })
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`Error sending reminder: ${message}`);
        return;
      }

      alert(`Reminder email sent successfully to batch ${reminderForm.batch}!`);
      closeReminderModal();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const daysUntilEnd = (dateString) => {
    const today = new Date();
    const endDate = new Date(dateString);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes bounceX {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
        .animate-bounce-x {
          animation: bounceX 1s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6 ml-0 md:ml-0 mt-16">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-amber-800">Event Management</h1>
                <p className="text-amber-600/70 mt-2">Manage project events and milestones across all phases</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600/70">Total Events</p>
                      <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.totalEvents}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600/70">Upcoming</p>
                      <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.upcomingEvents}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600/70">Active</p>
                      <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.activeEvents}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600/70">Passed</p>
                      <h3 className="text-2xl font-bold text-amber-800 mt-1">{stats.passedEvents}</h3>
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
                        All Events
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
                      className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${showAddForm
                          ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25'
                        }`}
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {showAddForm ? 'Cancel' : 'Add New Event'}
                    </button>
                  </div>

                  {/* Add Event Form */}
                  {showAddForm && (
                    <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 animate-slide-down">
                      <h3 className="text-lg font-bold text-amber-800 mb-4">Add New Event</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-amber-600/70 mb-2">
                            Phase *
                          </label>
                          <select
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          >
                            <option value="">Select Phase</option>
                            <option value="TEAM_FORMATION">Team Formation</option>
                            <option value="PROJECT_CREATION">Project Creation</option>
                            <option value="PROJECT_ALLOCATION">Project Allocation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-amber-600/70 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={newEvent.startDate}
                            min={getTodayDate()}
                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-amber-600/70 mb-2">
                            End Date *
                          </label>
                          <input
                            type="date"
                            value={newEvent.endDate}
                            min={getTodayDate()}
                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-amber-600/70 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                            rows="3"
                            placeholder="Enter event description"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleAddEvent}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                        >
                          Add Event
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

              {/* Events List */}
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-orange-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {editingId === event.id ? (
                      /* Edit Mode */
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-amber-800 mb-4">Edit Event</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-amber-700 mb-1">Phase *</label>
                            <select
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                            >
                              <option value="">Select Phase</option>
                              <option value="TEAM_FORMATION">Team Formation</option>
                              <option value="PROJECT_CREATION">Project Creation</option>
                              <option value="PROJECT_ALLOCATION">Project Allocation</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-amber-700 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={editForm.startDate}
                                min={getTodayDate()}
                                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-amber-700 mb-1">End Date *</label>
                              <input
                                type="date"
                                value={editForm.endDate}
                                min={getTodayDate()}
                                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 text-sm"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-sm font-medium text-amber-700 mb-1">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 resize-none"
                              rows="2"
                              placeholder="Event description"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                          <button
                            onClick={handleCancelEdit}
                            className="px-5 py-2.5 text-amber-700 font-medium rounded-xl border border-orange-200 hover:bg-amber-50 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(event.id)}
                            className="px-5 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all duration-200"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Phase Icon & Status */}
                          <div className="flex items-center gap-3 lg:w-56 shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 hover:scale-110 hover:rotate-3 ${getPhaseColor(event.title)}`}>
                              {getPhaseIcon(event.title)}
                            </div>
                            <div>
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 ${getStatusColor(event.status)}`}>
                                {getStatusText(event.status)}
                              </span>
                            </div>
                          </div>

                          {/* Phase as Title & Description */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-amber-800 truncate">{formatPhaseLabel(event.title)}</h3>
                            <p className="text-sm text-amber-600/70 mt-0.5 line-clamp-2">{event.description}</p>
                          </div>

                          {/* Date Range - Separated */}
                          <div className="lg:w-80 shrink-0">
                            <div className="flex items-center gap-2">
                              {/* Start Date */}
                              <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 group hover:border-green-200 transition-all duration-200 hover:shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">Start</p>
                                    <p className="text-xs font-bold text-green-800">{formatDate(event.startDate)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Arrow / Connector */}
                              <div className="flex flex-col items-center px-1">
                                <svg className="w-5 h-5 text-amber-400 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <p className={`text-[10px] font-bold mt-0.5 ${daysUntilEnd(event.endDate) > 3 ? 'text-green-600' :
                                    daysUntilEnd(event.endDate) > 0 ? 'text-amber-600' :
                                      daysUntilEnd(event.endDate) === 0 ? 'text-orange-600' : 'text-rose-600'
                                  }`}>
                                  {daysUntilEnd(event.endDate) > 0
                                    ? `${daysUntilEnd(event.endDate)}d`
                                    : daysUntilEnd(event.endDate) === 0
                                      ? 'Today'
                                      : `${Math.abs(daysUntilEnd(event.endDate))}d`
                                  }
                                </p>
                              </div>

                              {/* End Date */}
                              <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 group hover:border-rose-200 transition-all duration-200 hover:shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-rose-600 font-semibold">End</p>
                                    <p className="text-xs font-bold text-rose-800">{formatDate(event.endDate)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 lg:w-auto shrink-0">
                            <button
                              onClick={() => openReminderModal(event.id)}
                              className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Send Reminder Email"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              className="p-2.5 rounded-xl text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Edit Event"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 hover:scale-110 active:scale-95"
                              title="Delete Event"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-end mt-3 pt-3 border-t border-orange-100">
                          <p className="text-xs text-amber-500">
                            Last modified: {formatDate(event.lastModified)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredEvents.length === 0 && (
                <div className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-1">No Events Found</h3>
                  <p className="text-sm text-amber-600/70 mb-6">
                    {filter === 'all'
                      ? "You haven't created any events yet"
                      : `No ${filter} events at the moment`}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Email Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={closeReminderModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Send Reminder Email</h3>
                  <p className="text-xs text-amber-600/70">Notify about this event</p>
                </div>
              </div>
              <button
                onClick={closeReminderModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1.5">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reminderForm.batch}
                  onChange={(e) => setReminderForm({ ...reminderForm, batch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                  placeholder="e.g., b23, b22"
                />
                <p className="text-xs text-amber-500 mt-1">Enter the batch code to send reminder to</p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reminderForm.subject}
                  onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800"
                  placeholder="Email subject"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1.5">
                  Email Body <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reminderForm.body}
                  onChange={(e) => setReminderForm({ ...reminderForm, body: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none text-amber-800 resize-none"
                  rows="6"
                  placeholder="Enter the email message..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-orange-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-b-2xl">
              <button
                onClick={closeReminderModal}
                className="px-5 py-2.5 text-amber-700 font-medium rounded-xl border border-orange-200 hover:bg-amber-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeptEventManagement;
