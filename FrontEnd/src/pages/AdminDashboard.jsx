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
  const [activeTab, setActiveTab] = useState("users"); // "users", "create", "coordinator"

  // Create User Form State
  const [createUserForm, setCreateUserForm] = useState({
    email: "",
    password: "",
    role: "USER",
    deptName: "",
  });

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    userId: null,
  });

  // sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Make Coordinator Form State
  const [coordinatorForm, setCoordinatorForm] = useState({
    userId: "",
    deptName: "",
    batch: "",
  });

  // role filter state
  const [selectedRole, setSelectedRole] = useState("");

  // Fetch all users

  const fetchUsers = async (sortBy, direction, roleParam) => {
    setLoading(true);

    try {
      let url = `${API_URL}/api/admin/users?`;

      if (roleParam) {
        url += `role=${roleParam}&`;
      }

      if (sortBy && direction) {
        url += `sortBy=${sortBy}&direction=${direction}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.message || "Error fetching users",
      });
    } finally {
      setLoading(false);
    }
  };

  // sort click handler
  const sortableColumns = ["email", "role"];
  const handleSort = (column) => {
    if (!sortableColumns.includes(column)) return;

    let direction = "asc";
    if (sortConfig.key === column) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({ key: column, direction });

    fetchUsers(column, direction, selectedRole);
  };

  // arrow icons for sorting
  const getSortIcon = (column) => {
    if (!sortableColumns.includes(column)) return "";

    if (sortConfig.key !== column) return "⇅";
    if (sortConfig.direction === "asc") return "↑";
    if (sortConfig.direction === "desc") return "↓";
    return "⇅";
  };

  // Fetch users on component mount
  useEffect(() => {
    if (role === "ADMIN") {
      fetchUsers(null, null, selectedRole);
    }
  }, [role, selectedRole]);

  // auto hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({
          show: false,
          type: "",
          message: "",
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setToast({
      show: false,
      type: "",
      message: "",
    });
    setLoading(true);

    try {
      // Validate form
      if (!createUserForm.email || !createUserForm.password) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createUserForm.email,
          password: createUserForm.password,
          role: createUserForm.role,
          deptName: createUserForm.deptName || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Failed to create user");
      }

      const newUser = await response.json();
      setUsers([...users, newUser.data]);
      setToast({
        show: true,
        type: "success",
        message: "User created successfully!",
      });

      // Reset form
      setCreateUserForm({
        email: "",
        password: "",
        role: "USER",
        deptName: "",
      });

      // Switch to users tab to see the new user
      setTimeout(() => {
        setActiveTab("users");
        setToast({
          show: true,
          type: "success",
          message: "User created successfully!",
        });
      }, 2000);
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.message || "Error creating user",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle make coordinator
  const handleMakeCoordinator = async (e) => {
    e.preventDefault();
    setToast({
      show: false,
      type: "",
      message: "",
    });
    setLoading(true);

    try {
      if (
        !coordinatorForm.userId ||
        !coordinatorForm.deptName ||
        !coordinatorForm.batch
      ) {
        throw new Error("Please fill in all required fields");
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
            userId: coordinatorForm.userId,
            deptName: coordinatorForm.deptName,
            batch: coordinatorForm.batch,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.error?.message || "Failed to make coordinator",
        );
      }

      setToast({
        show: true,
        type: "success",
        message: "User promoted to coordinator successfully!",
      });

      // Refresh users list
      await fetchUsers();

      // Reset form
      setCoordinatorForm({
        userId: "",
        deptName: "",
        batch: "",
      });

      // Switch to users tab
      setTimeout(() => {
        setActiveTab("users");
      }, 2000);
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.message || "Error making coordinator",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    setToast({
      show: false,
      type: "",
      message: "",
    });

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== userId));
      setToast({
        show: true,
        type: "success",
        message: "User deleted successfully!",
      });
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.message || "Error deleting user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
        <Sidebar />
        <div className="flex-1 p-6">
          <div
            className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border transition-all duration-500 ${
              toast.show
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            } ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span className="font-medium text-sm">{toast.message}</span>

            <button
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
              className="ml-2 p-1 rounded-full hover:bg-black/5"
            >
              ✕
            </button>
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-amber-600">
              Manage users, create accounts, and assign roles.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-between items-center mb-6 border-b border-orange-200">
            {/* LEFT: Tabs */}
            <div className="flex gap-4">
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

            {/* RIGHT: Filter */}
            {activeTab === "users" && (
              <div className="mb-2">
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition">
                  <span className="text-sm font-medium text-amber-800">
                    🔎 Filter
                  </span>

                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-1 border border-orange-300 rounded-md bg-white text-amber-900 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="">All</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                    <option value="STUDENT">Student</option>
                    <option value="PROFF">Professor</option>
                    <option value="DEPTCORDINATOR">Coordinator</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {/* Users List Tab */}
          {activeTab === "users" && (
            <div>
              <div className="bg-white rounded-xl border border-orange-200/60 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-8">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-orange-50 border-b border-orange-200">
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
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold text-amber-900"
                            onClick={() => handleSort("email")}
                          >
                            Email {getSortIcon("email")}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold text-amber-900"
                            onClick={() => handleSort("role")}
                          >
                            Role {getSortIcon("role")}
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
                              colSpan={4}
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
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.email}
                                {user.email ===
                                  JSON.parse(atob(token.split(".")[1])).sub && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                    You
                                  </span>
                                )}
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
                                  onClick={() =>
                                    setDeleteModal({
                                      show: true,
                                      userId: user.id,
                                    })
                                  }
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
                            ? {
                                value: createUserForm.role,
                                label: createUserForm.role,
                              }
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
                        options={users
                          .filter((user) => user.role === "PROFF")
                          .map((user) => ({
                            value: user.id,
                            label: `(${user.email}) - ${user.role}`,
                          }))}
                        value={
                          coordinatorForm.userId
                            ? {
                                value: coordinatorForm.userId,
                                label: users.find(
                                  (u) => u.id === coordinatorForm.userId,
                                )
                                  ? `${users.find((u) => u.id === coordinatorForm.userId).email} - ${users.find((u) => u.id === coordinatorForm.userId).role}`
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

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2">
                        Batch *
                      </label>
                      <input
                        type="text"
                        value={coordinatorForm.batch}
                        onChange={(e) =>
                          setCoordinatorForm({
                            ...coordinatorForm,
                            batch: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Enter batch (e.g. B23)"
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={loading}
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
                            batch: "",
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

        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Delete User?
              </h3>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove this user? This action cannot be
                undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() =>
                    setDeleteModal({
                      show: false,
                      userId: null,
                    })
                  }
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    handleDeleteUser(deleteModal.userId);

                    setDeleteModal({
                      show: false,
                      userId: null,
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default AdminDashboard;
