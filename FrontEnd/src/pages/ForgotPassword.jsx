import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mainGate from "../assets/mainGate.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [step, setStep] = useState("email"); // "email", "otp", or "reset"
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Step 1: Send OTP to email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    otp: null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            setMessage(data.message || "OTP sent to your email! Please check your inbox.");
            setStep("otp");
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    otp: parseInt(otp)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OTP validation failed");
            }

            // Save the token for password reset
            setResetToken(data.token);
            setMessage("OTP verified successfully! Please set your new password.");
            setStep("reset");
        } catch (err) {
            setError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setMessage("Password reset successfully! Redirecting to login...");
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = () => {
        setStep("email");
        setOtp("");
        setMessage("");
        // Optionally auto-submit email again
        setTimeout(() => {
            handleEmailSubmit(new Event('submit'));
        }, 100);
    };

    return (
        <main
            className="w-full min-h-screen flex justify-center items-center px-4 py-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${mainGate})` }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Card Container */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-6 lg:p-8">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/20">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                            Reset Password
                        </h2>
                        <p className="text-white/70 text-sm mt-2">
                            {step === "email" && "Enter your email to receive OTP"}
                            {step === "otp" && "Enter the OTP sent to your email"}
                            {step === "reset" && "Create a new password"}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-between mb-6">
                        {['Email', 'OTP', 'New Password'].map((label, index) => {
                            let stepStatus = "pending";
                            if (step === "email" && index === 0) stepStatus = "active";
                            else if (step === "otp" && index <= 1) stepStatus = "active";
                            else if (step === "reset" && index <= 2) stepStatus = "active";
                            
                            return (
                                <div key={label} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                                        ${stepStatus === "active" 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-white/20 text-white/60'}`}>
                                        {index + 1}
                                    </div>
                                    <span className="text-xs text-white/60 mt-1">{label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-200 text-sm">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Email Form */}
                    {step === "email" && (
                        <form className="space-y-5" onSubmit={handleEmailSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg transition-all duration-200 flex justify-center items-center gap-2
                                    ${loading ? "cursor-wait opacity-80" : "hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5"}`}
                            >
                                {loading && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === "otp" && (
                        <form className="space-y-5" onSubmit={handleOtpSubmit}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-white/90 mb-2">
                                    OTP Code
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200 text-center text-lg tracking-widest"
                                />
                                <p className="text-xs text-white/50 mt-2">OTP sent to: {email}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className={`w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg transition-all duration-200 flex justify-center items-center gap-2
                                    ${loading || otp.length !== 6 ? "cursor-not-allowed opacity-60" : "hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5"}`}
                            >
                                {loading && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                                >
                                    Didn't receive OTP? Resend
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password Form */}
                    {step === "reset" && (
                        <form className="space-y-5" onSubmit={handleResetPassword}>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-white/90 mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword || !confirmPassword}
                                className={`w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg transition-all duration-200 flex justify-center items-center gap-2
                                    ${loading || !newPassword || !confirmPassword ? "cursor-not-allowed opacity-60" : "hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5"}`}
                            >
                                {loading && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;