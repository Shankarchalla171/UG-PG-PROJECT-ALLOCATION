import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Verifying...");

    // grab token from query params
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    useEffect(() => {
        if (!token) {
            setMessage("No verification token provided in URL.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
                const data = await res.json();

                if (res.ok) {
                    setMessage("Email successfully verified! Redirecting to login page...");
                    setTimeout(() => navigate("/"), 2500);
                } else {
                    setMessage(data.message || "Email verification failed.");
                }
            } catch (err) {
                console.error("Verification error", err);
                setMessage("An error occurred while verifying email.");
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <main className="w-full min-h-screen flex justify-center items-center px-4 py-4">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Email Verification</h2>
                <p>{message}</p>
            </div>
        </main>
    );
};

export default VerifyEmail;