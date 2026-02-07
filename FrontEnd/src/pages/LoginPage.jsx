import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import mainGate from "../assets/mainGate.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const {isloggedIn,email,password,role,token,authDispatch} = useContext(AuthContext);
    const navigate= useNavigate();
    
    // State for form mode and form fields
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const handleEmailChange =(e) =>{
        console.log(e.target.value);
        authDispatch(
            {
               type:"setEmail",
               payload:e.target.value,
            }
        )
    }

    const handlePasswordChange =(e) =>{
        console.log(e.target.value);
        authDispatch({
            type:"setPassword",
            payload:e.target.value,
        })
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }

    const handleLogin =(e) =>{
        e.preventDefault();
        console.log("login button clicked");
        authDispatch({
            type:"loginSuccess",
            payload:{
                token:"this is a dummy token",
                role:"home",
            }
        })
        console.log(role);
        navigate(`/${role}`);
    }

    const handleRegister = (e) => {
        e.preventDefault();
        console.log("register button clicked");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Confirm Password:", confirmPassword);
        
        // Add your registration logic here
        // For now, we'll simulate successful registration and switch to login
        alert("We have sent a verification link to your email. Please verify to login.");
        
        // Clear form and switch to login
        clearForm();
        setIsRegistering(false);
    }

    const clearForm = () => {
        authDispatch({ type: "setEmail", payload: "" });
        authDispatch({ type: "setPassword", payload: "" });
        setConfirmPassword("");
    }

    const toggleFormMode = () => {
        clearForm();
        setIsRegistering(!isRegistering);
    }

    return (
        <>
            <main 
                className="w-full min-h-screen flex justify-center items-center px-4 py-4 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: `url(${mainGate})` }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
                
                <div className="w-full max-w-md relative z-10">
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

                        <form className="space-y-5">
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
                                    <a href="#" className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors">Forgot password?</a>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button 
                                className="w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
                                onClick={isRegistering ? handleRegister : handleLogin}
                            >
                                {isRegistering ? "Create Account" : "Sign In"}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center my-6">
                                <div className="flex-1 h-px bg-white/30"></div>
                                <span className="px-4 text-sm text-white/60">or</span>
                                <div className="flex-1 h-px bg-white/30"></div>
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
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/80 text-xs mt-6 drop-shadow-md">© 2026 EduProject. All rights reserved.</p>
                </div>
            </main>
        </>
    )
}

export default LoginPage;