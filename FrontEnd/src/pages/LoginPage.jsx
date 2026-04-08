import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import mainGate from "../assets/mainGate.png";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const {
        isloggedIn, email, role, token, authDispatch
    } = useContext(AuthContext);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;
    console.log(API_URL);
    
    // State for form mode and form fields
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loading) {
            document.body.style.cursor = "wait";
        } else {
            document.body.style.cursor = "default";
        }

        return () => {
            document.body.style.cursor = "default";
        };
    }, [loading]);

    useEffect(() => {
        console.log(localStorage);
        if (isloggedIn) {
            // navigate("/dashboard");
        }
    }, [isloggedIn, role, navigate]);

    const handleEmailChange = (e) => {
        authDispatch({
            type: "setEmail",
            payload: e.target.value,
        });
        setErr("");
        setSuccessMsg("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setErr("");
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setErr("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setErr("Please fill in all fields");
            return;
        }

        setErr("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend now returns appropriate error status with a 'message' field
                throw new Error(data.message || "Login failed");
            }
            
            authDispatch({
                type: "loginSuccess",
                payload: {
                    token: data.token,
                    role: data.role,
                    teamRole: data.teamRole,
                    email: email,
                }
            });
            navigate('/dashboard');

        } catch (err) {
            console.error("Login error:", err);
            setErr(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("register button clicked");

        // Validation
        if (!email || !password || !confirmPassword) {
            setErr("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Passwords do not match");
            return;
        }

        if (password.length < 3) {
            setErr("Password must be at least 3 characters long");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErr("Please enter a valid email address");
            return;
        }

        setErr("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    email: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle 409 Conflict for duplicate user/email
                throw new Error(data.message || "Registration failed");
            }

            // Registration successful
            setSuccessMsg(data.message || "Registration successful! Please check your inbox for the verification link.");
            
            // Clear form after 3 seconds and switch to login
            setTimeout(() => {
                clearForm();
                setIsRegistering(false);
                setSuccessMsg("");
            }, 3000);

        } catch (err) {
            console.error("Registration error:", err);
            setErr(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setErr("");
        setSuccessMsg("");
        
        try {
            const response = await fetch(`${API_URL}/api/auth/google-signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: credentialResponse.credential
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Google login failed");
            }

            authDispatch({
                type: "loginSuccess",
                payload: {
                    token: data.token,
                    role: data.role,
                    teamRole: data.teamRole,
                    email: data.email,
                }
            });
            
            navigate('/dashboard');

        } catch (err) {
            console.error("Google login error:", err);
            setErr(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("Google Sign-In Failed");
        setErr("Google Sign-In Failed. Please try again.");
    };

    const clearForm = () => {
        authDispatch({ type: "setEmail", payload: "" });
        setPassword("");
        setConfirmPassword("");
        setErr("");
        setSuccessMsg("");
    };

    const toggleFormMode = () => {
        clearForm();
        setErr("");
        setSuccessMsg("");
        setIsRegistering(!isRegistering);
    };

    return (
        <>
            <main 
                className="w-full min-h-screen flex justify-center items-center px-4 py-4 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: `url(${mainGate})` }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="w-full max-w-md relative z-10">
                    {/* Success Message Display */}
                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-white text-sm">
                            {successMsg}
                        </div>
                    )}

                    {/* Error Message Display */}
                    {err && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
                            {err}
                        </div>
                    )}

                    {/* Card Container - Glassmorphism */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-6 lg:p-8">

                        {/* Logo/Header Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/20">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                                EduProject
                            </h2>
                            <p className="text-white/70 text-sm mt-2">
                                {isRegistering ? "Create a new account" : "Sign in to your account"}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={isRegistering ? handleRegister : handleLogin}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        required
                                        className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200 pr-12"
                                        onChange={handlePasswordChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field (only for registration) */}
                            {isRegistering && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            required
                                            className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200 pr-12"
                                            onChange={handleConfirmPasswordChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Forgot Password Link (only for login) */}
                            {!isRegistering && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg transition-all duration-200 mt-2 flex justify-center items-center gap-2
                                    ${loading ? "cursor-wait opacity-80" : "hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5"}`}
                            >
                                {loading && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {loading
                                    ? isRegistering
                                        ? "Creating Account..."
                                        : "Signing In..."
                                    : isRegistering
                                        ? "Create Account"
                                        : "Sign In"}
                            </button>
                        </form>

                        {/* Divider with Google Button */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-white/30"></div>
                            <span className="px-4 text-sm text-white/60">or</span>
                            <div className="flex-1 h-px bg-white/30"></div>
                        </div>

                        {/* Google Sign-In Button */}
                        <div className="flex justify-center mb-6">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                                theme="filled_blue"
                                shape="rectangular"
                                size="large"
                                text="signin_with"
                                width={250}
                                disabled={loading}
                            />
                        </div>

                        {/* Toggle between Login and Register */}
                        <p className="text-center text-white/80">
                            {isRegistering ? "Already have an account?" : "Don't have an account?"}
                            <span
                                className="font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer ml-1 transition-colors"
                                onClick={toggleFormMode}
                            >
                                {isRegistering ? "Sign In" : "Create New Account"}
                            </span>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/80 text-xs mt-6 drop-shadow-md">
                        © 2026 EduProject. All rights reserved.
                    </p>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 z-50 cursor-wait bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </main>
        </>
    );
};

export default LoginPage;