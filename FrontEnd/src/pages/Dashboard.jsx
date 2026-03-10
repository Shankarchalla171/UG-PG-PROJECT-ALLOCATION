import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import CoordinatorDashboard from "./CoordinatorDashboard";
import Professor_dashboard from "./Professor_dashboard";
import CreateProfile from "./CreateProfile";

const Dashboard = () => {
    const navigate = useNavigate();
    // const { role } = useContext(AuthContext);

    const {role}= useContext(AuthContext);



    // Render based on role
    if (role === "STUDENT") {
        return <StudentDashboard />;
    } else if (role === "deptCoordinator") {
        return <CoordinatorDashboard />;
    } else if (role === "PROFF") {
        // Faculty will be redirected, but show nothing while redirecting
        return <Professor_dashboard/>
    }else if(role === "USER"){
        return <CreateProfile/>
    }

    // Default fallback for unknown roles
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/30">
            <div className="text-center">
                <p className="text-amber-600">Role: {role || "not set"} - Loading...</p>
            </div>
        </div>
    );
};

export default Dashboard;