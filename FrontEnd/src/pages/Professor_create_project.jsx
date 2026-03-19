import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

const ProfessorCreateProject = () => {
  const initialFormState = {
    title: "",
    description: "",
    slots: "",
    domain: "",
    prerequisites: "",
    duration: "",
  };
  const {token}= useContext(AuthContext);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("api/projects", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create project");
      }

      const data = await response.json();
      console.log("Project created:", data);
      setSuccess(true);
      setFormData(initialFormState); // clear form on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 ml-0 md:ml-0">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-800">
                Create New Project
              </h1>
              <p className="text-amber-600/70 mt-2">
                Fill in the details below to create a new project
              </p>
            </div>

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                Project created successfully!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                Error: {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200/60"
            >
              {/* Title Field */}
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-amber-800 font-medium mb-2"
                >
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter project title"
                />
              </div>

              {/* Description Field */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-amber-800 font-medium mb-2"
                >
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Describe the project in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Number of Interns Field */}
                <div>
                  <label
                    htmlFor="numberOfInterns"
                    className="block text-amber-800 font-medium mb-2"
                  >
                    Number of Slots *
                  </label>
                  <input
                    type="number"
                    id="numberOfInterns"
                    name="slots"
                    value={formData.slots}
                    onChange={handleChange}
                    required
                    min="1"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 3"
                  />
                </div>

                {/* Domain Field */}
                <div>
                  <label
                    htmlFor="domain"
                    className="block text-amber-800 font-medium mb-2"
                  >
                    Domain *
                  </label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., Web Development, Machine Learning"
                  />
                </div>
              </div>

              {/* prerequisites Field */}
              <div className="mb-6">
                <label
                  htmlFor="prerequisites"
                  className="block text-amber-800 font-medium mb-2"
                >
                  prerequisites & Skills Needed
                </label>
                <textarea
                  id="prerequisites"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  rows="4"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="List the required skills and qualifications..."
                />
              </div>

              {/* Duration Field */}
              <div className="mb-8">
                <label
                  htmlFor="duration"
                  className="block text-amber-800 font-medium mb-2"
                >
                  Project Duration (in weeks)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., 12"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-orange-200/60">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(initialFormState)}
                  disabled={loading}
                  className="px-6 py-3 border border-orange-300 text-amber-700 font-medium rounded-xl hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCreateProject;