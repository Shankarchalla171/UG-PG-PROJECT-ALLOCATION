import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const department = {
  name: "CSE",
  totalStudents: 120,
  allocatedStudents: 105,
  totalProjects: 40,
};

const recentActivities = [
  { id: 1, text: "Project allocations finalized for final year batch", time: "2h" },
  { id: 2, text: "Application deadline extended for 3 students", time: "1d" },
  { id: 3, text: "5 allocation requests pending review", time: "3d" },
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();

  const pendingAllocations =
    department.totalStudents - department.allocatedStudents;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 mt-16">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-amber-800">
                Department Coordinator Dashboard
              </h1>
              <p className="text-amber-600/70 mt-2">
                Overview of project allocations and department activity
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Students" value={department.totalStudents} />
              <StatCard title="Allocated Students" value={department.allocatedStudents} />
              <StatCard title="Available Projects" value={department.totalProjects} />
              <StatCard title="Pending Allocations" value={pendingAllocations} />
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activities */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-amber-800">
                    Recent Activities
                  </h2>
                  <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-full">
                    {recentActivities.length} updates
                  </span>
                </div>

                <div className="relative border-l-2 border-orange-200 pl-6 space-y-6">
                  {recentActivities.map((a) => (
                    <div key={a.id} className="relative">
                      <span className="absolute -left-[13px] top-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-4 border-white shadow-md"></span>

                      <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-amber-800">
                            {a.text}
                          </p>
                          <span className="text-xs text-amber-600/70 bg-white px-2 py-1 rounded-md">
                            {a.time} ago
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <aside className="bg-white rounded-2xl border border-orange-200/60 shadow-sm p-6 flex flex-col">
                <h3 className="text-sm font-bold text-amber-800 mb-4">
                  Quick Actions
                </h3>

                <div className="flex flex-col gap-4 flex-1">
                  <button
                    onClick={() => navigate("/dept_view_allocations")}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center"
                  >
                    View Allocations
                  </button>

                  <button
                    onClick={() => navigate("/dept_enforce_deadlines")}
                    className="flex-1 bg-gradient-to-r from-orange-400 to-rose-400 text-white font-medium rounded-xl shadow-md hover:from-orange-500 hover:to-rose-500 transition-all flex items-center justify-center"
                  >
                    Enforce Deadlines
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200/60 shadow-sm">
      <p className="text-sm text-amber-600/70">{title}</p>
      <h3 className="text-2xl font-bold text-amber-800 mt-1">{value}</h3>
    </div>
  );
}