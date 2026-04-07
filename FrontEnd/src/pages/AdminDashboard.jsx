import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

// Custom styles for react-select
const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#fed7aa",
    borderWidth: "1px",
    borderRadius: "0.5rem",
    padding: "0.25rem",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#fb923c",
    },
    "&:focus": {
      borderColor: "#fb923c",
      outline: "none",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#fffaeb"
      : state.isFocused
        ? "#f54900"
        : "white",
    color: state.isSelected ? "#000" : state.isFocused ? "white" : "#000",
    padding: "10px",
    "&:active": {
      backgroundColor: "#fffaeb",
    },
  }),
  menu: (base) => ({
    ...base,
    borderColor: "#fed7aa",
  }),
  menuList: (base) => ({
    ...base,
    borderRadius: "0.5rem",
  }),
};

const AdminDashboard = () => {
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Check if user is admin
  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users", "create", "coordinator"

  // Create User Form State
  const [createUserForm, setCreateUserForm] = useState({
    userName: "",
    email: "",
    password: "",
    role: "USER",
    deptName: "",
  });

  // Make Coordinator Form State
  const [coordinatorForm, setCoordinatorForm] = useState({
    userId: "",
    deptName: "",
  });

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    if (role === "ADMIN") {
      fetchUsers();
    }
  }, [role]);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate form
      if (
        !createUserForm.userName ||
        !createUserForm.email ||
        !createUserForm.password
      ) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: createUserForm.userName,
          email: createUserForm.email,
          password: createUserForm.password,
          role: createUserForm.role,
          deptName: createUserForm.deptName || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create user";

        const text = await response.text(); // ✅ read ONCE

        try {
          const data = JSON.parse(text); // try parsing manually
          errorMessage = data.message || errorMessage;
        } catch {
          errorMessage = text; // plain text fallback
        }

        throw new Error(errorMessage);
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setSuccess("User created successfully!");

      // Reset form
      setCreateUserForm({
        userName: "",
        email: "",
        password: "",
        role: "USER",
        deptName: "",
      });

      // Switch to users tab to see the new user
      setTimeout(() => {
        setActiveTab("users");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // Handle make coordinator
  const handleMakeCoordinator = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!coordinatorForm.userId || !coordinatorForm.deptName) {
        throw new Error("Please select a user and enter department name");
      }

      const response = await fetch(
        `${API_URL}/api/admin/users/${coordinatorForm.userId}/make-coordinator`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deptName: coordinatorForm.deptName,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to make coordinator");
      }

      setSuccess("User promoted to coordinator successfully!");

      // Refresh users list
      await fetchUsers();

      // Reset form
      setCoordinatorForm({
        userId: "",
        deptName: "",
      });

      // Switch to users tab
      setTimeout(() => {
        setActiveTab("users");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error making coordinator");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setUsers(users.filter((u) => u.id !== userId));
        setSuccess("User deleted successfully!");
        setTimeout(() => setSuccess(""), 2000);
      } catch (err) {
        setError(err.message || "Error deleting user");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-amber-600">
              Manage users, create accounts, and assign roles.
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
              <span className="text-xl">✓</span>
              <p>{success}</p>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-6 border-b border-orange-200">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "users"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "create"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
            >
              Create User
            </button>
            <button
              onClick={() => setActiveTab("coordinator")}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === "coordinator"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
            >
              Make Coordinator
            </button>
          </div>

          {/* Tab Content */}
          {/* Users List Tab */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8">
                  <div className="mb-4">
                    <Skeleton height={24} width={200} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-50 border-b border-orange-200">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                            <Skeleton width={80} />
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                            <Skeleton width={60} />
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                            <Skeleton width={50} />
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                            <Skeleton width={100} />
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                            <Skeleton width={70} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <tr
                            key={index}
                            className="border-b border-orange-100 hover:bg-orange-50/30 transition"
                          >
                            <td className="px-6 py-4">
                              <Skeleton width={100} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton width={150} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton width={80} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton width={120} />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton width={60} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-orange-50 border-b border-orange-200">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-amber-600"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-orange-100 hover:bg-orange-50/30 transition"
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {user.userName || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.role === "ADMIN"
                                    ? "bg-red-100 text-red-800"
                                    : user.role === "DEPTCORDINATOR"
                                      ? "bg-blue-100 text-blue-800"
                                      : user.role === "PROFF"
                                        ? "bg-purple-100 text-purple-800"
                                        : user.role === "STUDENT"
                                          ? "bg-green-100 text-green-800"
                                          : user.role === "USER"
                                            ? "bg-slate-100 text-slate-700"
                                            : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.departmentName || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50 text-xs font-semibold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create User Tab */}
          {activeTab === "create" && (
            <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-8 max-w-2xl">
              {loading ? (
                <>
                  <div className="mb-6">
                    <Skeleton height={32} width={200} />
                  </div>
                  <div className="space-y-5">
                    <div>
                      <Skeleton height={16} width={100} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div>
                      <Skeleton height={16} width={60} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div>
                      <Skeleton height={16} width={80} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div>
                      <Skeleton height={16} width={50} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div>
                      <Skeleton height={16} width={150} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Skeleton height={48} width="48%" />
                      <Skeleton height={48} width="48%" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-amber-900 mb-6">
                    Create New User
                  </h2>

                  <form onSubmit={handleCreateUser} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={createUserForm.userName}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            userName: e.target.value,
                          })
                        }
                        placeholder="Enter username"
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email"
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={createUserForm.password}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Role *
                      </label>
                      <Select
                        options={[
                          { value: "USER", label: "USER" },
                          { value: "ADMIN", label: "ADMIN" },
                        ]}
                        value={
                          createUserForm.role
                            ? { value: createUserForm.role, label: createUserForm.role }
                            : null
                        }
                        onChange={(option) =>
                          setCreateUserForm({
                            ...createUserForm,
                            role: option ? option.value : "USER",
                          })
                        }
                        styles={customSelectStyles}
                        isDisabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Department Name (Optional)
                      </label>
                      <Select
                        options={DEPARTMENTS.map((d) => ({
                          value: d,
                          label: d,
                        }))}
                        value={
                          createUserForm.deptName
                            ? {
                                value: createUserForm.deptName,
                                label: createUserForm.deptName,
                              }
                            : null
                        }
                        onChange={(option) =>
                          setCreateUserForm({
                            ...createUserForm,
                            deptName: option ? option.value : "",
                          })
                        }
                        isClearable
                        styles={customSelectStyles}
                        isDisabled={loading}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {loading ? "Creating..." : "Create User"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateUserForm({
                            userName: "",
                            email: "",
                            password: "",
                            role: "USER",
                            deptName: "",
                          })
                        }
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Make Coordinator Tab */}
          {activeTab === "coordinator" && (
            <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm p-8 max-w-2xl">
              {loading ? (
                <>
                  <div className="mb-6">
                    <Skeleton height={32} width={250} />
                  </div>
                  <div className="space-y-5">
                    <div>
                      <Skeleton height={16} width={100} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div>
                      <Skeleton height={16} width={140} className="mb-2" />
                      <Skeleton height={40} />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Skeleton height={48} width="48%" />
                      <Skeleton height={48} width="48%" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-amber-900 mb-6">
                    Make User a Coordinator
                  </h2>

                  <form onSubmit={handleMakeCoordinator} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Select User *
                      </label>
                      <Select
                        options={users.map((user) => ({
                          value: user.id,
                          label: `${user.userName} (${user.email}) - ${user.role}`,
                        }))}
                        value={
                          coordinatorForm.userId
                            ? {
                                value: coordinatorForm.userId,
                                label: users.find((u) => u.id === coordinatorForm.userId)
                                  ? `${users.find((u) => u.id === coordinatorForm.userId).userName} (${users.find((u) => u.id === coordinatorForm.userId).email}) - ${users.find((u) => u.id === coordinatorForm.userId).role}`
                                  : "",
                              }
                            : null
                        }
                        onChange={(option) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            userId: option ? option.value : "",
                          })
                        }
                        styles={customSelectStyles}
                        isDisabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Department Name *
                      </label>
                      <Select
                        options={DEPARTMENTS.map((d) => ({
                          value: d,
                          label: d,
                        }))}
                        value={
                          coordinatorForm.deptName
                            ? {
                                value: coordinatorForm.deptName,
                                label: coordinatorForm.deptName,
                              }
                            : null
                        }
                        onChange={(option) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            deptName: option ? option.value : "",
                          })
                        }
                        styles={customSelectStyles}
                        isDisabled={loading}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Make Coordinator"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCoordinatorForm({
                            userId: "",
                            deptName: "",
                          })
                        }
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
