import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar";

import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { data } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Biotechnology",
];

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-orange-200/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 bg-white text-amber-800 placeholder-amber-400";
const LABEL_CLASS = "block text-amber-800 font-medium mb-2";
const FIELD_CLASS = "mb-6";

const CreateProfile = () => {
  const { role, token, authDispatch } = useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState(null); // "student" | "professor"
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const initialStudent = {
    name: "",
    collegeEmailId: "",
    rollNo: "",
    departmentName: "",
    profilePhoto: null,
    resume: null,
  };

  const initialProfessor = {
    name: "",
    email: "",
    departmentName: "",
    domain: "",
    googleScholarLink: "",
    officeNumber: "",
    profilePhoto: null,
  };

  const [studentForm, setStudentForm] = useState(initialStudent);
  const [professorForm, setProfessorForm] = useState(initialProfessor);

  const handleStudentChange = (e) => {
    const { name, value, files } = e.target;

    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    console.log("HANDLE STUDENT CHANGE FIRED", e.target.name, e.target.value);

    let newValue = value;

    // 🔹 Normalization
    if (name === "rollNo") {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (name === "collegeEmailId") {
      newValue = value.toLowerCase();
    }

    if (name === "name") {
      newValue = value.replace(/[^A-Za-z. \-]/g, "");
    }


    // 🔹 Update state
    setStudentForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : newValue,
    }));


    // 🔹 Validation
    let errorMsg = "";

    if (name === "name") {
      if (!newValue) errorMsg = "Name is required";
      else if (newValue.length < 2)
        errorMsg = "Name must be at least 2 characters";
    }

    if (name === "rollNo") {
      if (!newValue) errorMsg = "Roll number is required";
      else if (!/^[BMP][0-9]{6}[A-Z]{2}$/.test(newValue)) {
        errorMsg = "Invalid roll number format";
      }
    }

    if (name === "collegeEmailId") {
      if (!newValue) errorMsg = "Email is required";
      else if (!/^[A-Za-z0-9._%+-]+@nitc\.ac\.in$/.test(newValue)) {
        errorMsg = "Must be a valid NITC email";
      }
    }

    if (name === "departmentName") {
      if (!newValue) {
        errorMsg = "Please select a department";
      }
    }

    setValidationErrors((prev) => {
  const updated = { ...prev };

  if (!errorMsg) {
    delete updated[name];   // 🔥 remove error completely
  } else {
    updated[name] = errorMsg;
  }

  return updated;
});
  };

  const handleProfessorChange = (e) => {
    const { name, value, files } = e.target;

    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    let newValue = value;

    // 🔹 Normalization
    if (name === "name") {
      newValue = value.replace(/[^A-Za-z. \-]/g, "");
    }

    if (name === "email") {
      newValue = value.toLowerCase();
    }

    if (name === "officeNumber") {
      newValue = value.toUpperCase().replace(/[^A-Z0-9\-]/g, "");
    }

    if (name === "experience") {
      newValue = value.replace(/[^0-9]/g, "");
    }

    // 🔹 Update state
    setProfessorForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : newValue,
    }));

    // 🔹 Validation
    let errorMsg = "";

    if (name === "name") {
      if (!newValue) errorMsg = "Name is required";
      else if (newValue.length < 2) errorMsg = "Name too short";
    }

    if (name === "email") {
      if (!newValue) errorMsg = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(newValue)) {
        errorMsg = "Invalid email format";
      }
    }

    if (name === "departmentName") {
      if (!newValue) {
        errorMsg = "Please select a department";
      }
    }

    if (name === "domain") {
      if (!newValue) {
        errorMsg = "Domain is required";
      } else if (newValue.length < 2) {
        errorMsg = "Domain must be at least 2 characters";
      }
    }

    if (name === "officeNumber") {
      if (!newValue) {
        errorMsg = "Office number is required";
      } else if (!/^[A-Za-z0-9\-]+$/.test(newValue)) {
        errorMsg = "Invalid office number";
      }
    }

    if (name === "experience") {
      if (newValue && parseInt(newValue) < 0) {
        errorMsg = "Experience cannot be negative";
      }
    }

    if (name === "googleScholarLink") {
      if (newValue && !/^https?:\/\/.+/.test(newValue)) {
        errorMsg = "Invalid URL (must start with http/https)";
      }
    }

    setValidationErrors((prev) => {
  const updated = { ...prev };

  if (!errorMsg) {
    delete updated[name];   // 🔥 remove error completely
  } else {
    updated[name] = errorMsg;
  }

  return updated;
});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (selectedRole === "student") {
        const studentData = new FormData();

        Object.entries(studentForm).forEach(([key, val]) => {
          if (val !== null && val !== "") studentData.append(key, val);
        });

        console.log(studentData);

        console.log("Token:", token);
        console.log("Full URL:", `${API_URL}/api/students/profile`);
        console.log("API_URL:", API_URL);

        const res = await fetch(`${API_URL}/api/students/profile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: studentData,
        });

        if (!res.ok) {
          let errorData;

          const contentType = res.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            errorData = await res.json();
          } else {
            errorData = await res.text();
          }

          if (typeof errorData === "object") {
            setValidationErrors(errorData);
            setError("Please fix the highlighted errors");
          } else {
            setError(errorData); // 🔥 handles file errors
          }

          setSubmitting(false);
          return;
        }

        const data = await res.json();
        console.log(data);
        authDispatch({ type: "setRole", payload: data });
      } else {
        const professorData = new FormData();
        Object.entries(professorForm).forEach(([key, val]) => {
          if (val !== null && val !== "") professorData.append(key, val);
        });

        console.log(professorData);
        const res = await fetch(`${API_URL}/api/professors/profile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: professorData,
        });

        if (!res.ok) {
          let errorData;

          const contentType = res.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            errorData = await res.json();
          } else {
            errorData = await res.text();
          }

          if (typeof errorData === "object") {
            setValidationErrors(errorData);
            setError("Please fix the highlighted errors");
          } else {
            setError(errorData); // 🔥 handles file errors
          }

          setSubmitting(false);
          return;
        }

        const data = await res.json();
        console.log(data);
        authDispatch({ type: "setRole", payload: data });
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ───────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200/60 p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Profile Created!
              </h2>
              <p className="text-amber-600/70 text-sm">
                Your profile has been set up successfully.
              </p>
              <a
                href="/dashboard"
                className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-orange-500/25"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Main page ────────────────────────────────────────────────── */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-800">
                Create Profile
              </h1>
              <p className="text-amber-600/70 mt-1 text-sm">
                {selectedRole
                  ? `Fill in your ${selectedRole === "student" ? "student" : "professor"} details below`
                  : "Select your role to get started"}
              </p>
            </div>

            {/* ── Step 1 : Role selector ────────────────────────── */}
            {!selectedRole ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student card */}
                <button
                  onClick={() => setSelectedRole("student")}
                  className="group bg-white rounded-2xl shadow-lg border border-orange-200/60 p-8 text-left hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-500 group-hover:to-rose-500 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300">
                    <svg
                      className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 mb-1">
                    Student
                  </h3>
                  <p className="text-amber-500 text-sm leading-relaxed">
                    Set up your student profile with roll number, department,
                    and resume.
                  </p>
                </button>

                {/* Professor card */}
                <button
                  onClick={() => setSelectedRole("professor")}
                  className="group bg-white rounded-2xl shadow-lg border border-orange-200/60 p-8 text-left hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-500 group-hover:to-rose-500 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300">
                    <svg
                      className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 mb-1">
                    Professor
                  </h3>
                  <p className="text-amber-500 text-sm leading-relaxed">
                    Set up your faculty profile with research domain and office
                    details.
                  </p>
                </button>
              </div>
            ) : (
              /* ── Step 2 : Form ─────────────────────────────────── */
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200/60"
              >
                {/* Back link */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    setError(null);
                  }}
                  className="flex items-center gap-1.5 text-amber-500 hover:text-orange-600 text-sm font-medium mb-6 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                  Change role
                </button>

                {/* ── Student form ──────────────────────────────── */}
                {selectedRole === "student" ? (
                  <>
                    <div className={FIELD_CLASS}>
                      <label htmlFor="name" className={LABEL_CLASS}>
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={studentForm.name}
                        // onChange={handleStudentChange}
                        onChange={(e) => {
                          console.log("INPUT CHANGE TRIGGERED");
                          handleStudentChange(e);
                        }}
                        required
                        // className={INPUT_CLASS}
                        placeholder="Enter your full name"
                        className={`${INPUT_CLASS} ${validationErrors.name ? "border-red-500" : ""}`}
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="collegeEmail" className={LABEL_CLASS}>
                        College Email *
                      </label>
                      <input
                        type="email"
                        id="collegeEmail"
                        name="collegeEmailId"
                        value={studentForm.collegeEmailId}
                        onChange={handleStudentChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.collegeEmailId ? "border-red-500" : ""}`}
                        placeholder="you@college.edu"
                      />
                      {validationErrors.collegeEmailId && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.collegeEmailId}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="rollNumber" className={LABEL_CLASS}>
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        id="rollNumber"
                        name="rollNo"
                        value={studentForm.rollNo}
                        onChange={handleStudentChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.rollNo ? "border-red-500" : ""}`}
                        placeholder="e.g., 21CS001"
                      />
                      {validationErrors.rollNo && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.rollNo}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="department" className={LABEL_CLASS}>
                        Department *
                      </label>
                      <select
                        id="department"
                        name="departmentName"
                        value={studentForm.departmentName}
                        onChange={handleStudentChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.departmentName ? "border-red-500" : ""}`}
                      >
                        <option value="">Select your department</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {validationErrors.departmentName && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.departmentName}
                        </p>
                      )}
                    </div>

                    {/* Profile Photo upload */}
                    <div className={FIELD_CLASS}>
                      <label className={LABEL_CLASS}>Profile Photo</label>
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handleStudentChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profilePhoto"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-orange-200/60 hover:border-orange-400 bg-white cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-500 group-hover:to-rose-500 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        </div>
                        <span className="text-amber-500 text-sm truncate">
                          {studentForm.profilePhoto
                            ? studentForm.profilePhoto.name
                            : "Upload a photo (JPG, PNG)"}
                        </span>
                      </label>
                    </div>

                    {/* Resume upload */}
                    <div className="mb-8">
                      <label className={LABEL_CLASS}>Resume</label>
                      <input
                        type="file"
                        id="resume"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleStudentChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-orange-200/60 hover:border-orange-400 bg-white cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-500 group-hover:to-rose-500 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                          </svg>
                        </div>
                        <span className="text-amber-500 text-sm truncate">
                          {studentForm.resume
                            ? studentForm.resume.name
                            : "Upload your resume (PDF, DOC)"}
                        </span>
                      </label>
                    </div>
                  </>
                ) : (
                  /* ── Professor form ──────────────────────────── */
                  <>
                    <div className={FIELD_CLASS}>
                      <label htmlFor="profName" className={LABEL_CLASS}>
                        Name *
                      </label>
                      <input
                        type="text"
                        id="profName"
                        name="name"
                        value={professorForm.name}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.name ? "border-red-500" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="profEmail" className={LABEL_CLASS}>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="profEmail"
                        name="email"
                        value={professorForm.email}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.email ? "border-red-500" : ""}`}
                        placeholder="professor@college.edu"
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="profDepartment" className={LABEL_CLASS}>
                        Department *
                      </label>
                      <select
                        id="profDepartment"
                        name="departmentName"
                        value={professorForm.departmentName}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.departmentName ? "border-red-500" : ""}`}
                      >
                        <option value="">Select your department</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {validationErrors.departmentName && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.departmentName}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="researchDomain" className={LABEL_CLASS}>
                        Research Domain *
                      </label>
                      <input
                        type="text"
                        id="researchDomain"
                        name="domain"
                        value={professorForm.domain}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.domain ? "border-red-500" : ""}`}
                        placeholder="e.g., Machine Learning, Computer Vision"
                      />
                      {validationErrors.domain && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.domain}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="experience" className={LABEL_CLASS}>
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        id="experience"
                        name="experience"
                        value={professorForm.experience}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.experience ? "border-red-500" : ""}`}
                        placeholder="Enter your years of teaching/research experience"
                      />
                      {validationErrors.experience && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.experience}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label htmlFor="officeNumber" className={LABEL_CLASS}>
                        Office Number *
                      </label>
                      <input
                        type="text"
                        id="officeNumber"
                        name="officeNumber"
                        value={professorForm.officeNumber}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.officeNumber ? "border-red-500" : ""}`}
                        placeholder="e.g., CS-204"
                      />
                      {validationErrors.officeNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.officeNumber}
                        </p>
                      )}
                    </div>

                    <div className={FIELD_CLASS}>
                      <label
                        htmlFor="googleScholarLink"
                        className={LABEL_CLASS}
                      >
                        Google Scholar Link *
                      </label>
                      <input
                        type="url"
                        id="googleScholarLink"
                        name="googleScholarLink"
                        value={professorForm.googleScholarLink}
                        onChange={handleProfessorChange}
                        required
                        // className={INPUT_CLASS}
                        className={`${INPUT_CLASS} ${validationErrors.googleScholarLink ? "border-red-500" : ""}`}
                        placeholder="https://scholar.google.com/citations?user=..."
                      />
                      {validationErrors.googleScholarLink && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.googleScholarLink}
                        </p>
                      )}
                    </div>

                    {/* Profile Photo upload */}
                    <div className="mb-8">
                      <label className={LABEL_CLASS}>Profile Photo</label>
                      <input
                        type="file"
                        id="profProfilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handleProfessorChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profProfilePhoto"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-orange-200/60 hover:border-orange-400 bg-white cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-500 group-hover:to-rose-500 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        </div>
                        <span className="text-amber-500 text-sm truncate">
                          {professorForm.profilePhoto
                            ? professorForm.profilePhoto.name
                            : "Upload a photo (JPG, PNG)"}
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-orange-200/60">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : "Create Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectedRole === "student"
                        ? setStudentForm(initialStudent)
                        : setProfessorForm(initialProfessor)
                    }
                    className="px-6 py-3 border border-orange-300 text-amber-700 font-medium rounded-xl hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProfile;
