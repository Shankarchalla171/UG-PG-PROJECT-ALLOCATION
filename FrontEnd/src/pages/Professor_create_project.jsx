import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ProfessorCreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    numberOfInterns: '',
    domain: '',
    requirements: '',
    duration: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 p-6 ml-0 md:ml-0">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-800">Create New Project</h1>
              <p className="text-amber-600/70 mt-2">Fill in the details below to create a new project</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200/60">
              {/* Title Field */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-amber-800 font-medium mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400"
                  placeholder="Enter project title"
                />
              </div>

              {/* Description Field */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-amber-800 font-medium mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 resize-none"
                  placeholder="Describe the project in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Number of Interns Field */}
                <div>
                  <label htmlFor="numberOfInterns" className="block text-amber-800 font-medium mb-2">
                    Number of Interns Needed *
                  </label>
                  <input
                    type="number"
                    id="numberOfInterns"
                    name="numberOfInterns"
                    value={formData.numberOfInterns}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400"
                    placeholder="e.g., 3"
                  />
                </div>

                {/* Domain Field - Changed to text input */}
                <div>
                  <label htmlFor="domain" className="block text-amber-800 font-medium mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400"
                    placeholder="e.g., Web Development, Machine Learning"
                  />
                </div>
              </div>

              {/* Requirements Field */}
              <div className="mb-6">
                <label htmlFor="requirements" className="block text-amber-800 font-medium mb-2">
                  Requirements & Skills Needed
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 resize-none"
                  placeholder="List the required skills and qualifications..."
                />
              </div>

              {/* Duration Field */}
              <div className="mb-8">
                <label htmlFor="duration" className="block text-amber-800 font-medium mb-2">
                  Project Duration (in weeks)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400"
                  placeholder="e.g., 12"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-orange-200/60">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  className="px-6 py-3 border border-orange-300 text-amber-700 font-medium rounded-xl hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Form Guidelines */}
            {/* <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
              <h3 className="text-amber-800 font-medium mb-2">Tips for creating a great project:</h3>
              <ul className="text-sm text-amber-600/70 space-y-1">
                <li>• Be clear and specific about the project objectives</li>
                <li>• Mention the technologies and tools to be used</li>
                <li>• Specify the expected outcomes and deliverables</li>
                <li>• Clearly state the skills you're looking for in applicants</li>
                <li>• Mention any prerequisites or background requirements</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCreateProject;