import { useContext } from "react";
import { AuthContext } from "../Context/AtuhContext";
import mainGate from "../assets/mainGate.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const {isloggedIn,email,password,role,token,authDispatch} = useContext(AuthContext);
    const navigate= useNavigate();

    
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

    const handleLogin =(e) =>{
        e.preventDefault();
        console.log("login button clicked");
        // console.log(email,password);
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
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-10">
                        
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
                            <p className="text-white/70 text-sm mt-2">Sign in to your account</p>
                        </div>

                        <form className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                    Email
                                </label>
                                <input id="email" type="email" placeholder="Enter your email" onChange={handleEmailChange} required
                                    className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200" 
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">Password</label>
                                <input
                                 id="password" 
                                 type="password" 
                                 placeholder="••••••••"
                                 required 
                                 className="block w-full rounded-lg px-4 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 focus:border-emerald-400 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all duration-200" 
                                 onChange={handlePasswordChange}
                                 />
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors">Forgot password?</a>
                            </div>

                            {/* Submit Button */}
                            <button className="w-full font-semibold px-4 py-3.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
                             onClick={handleLogin} >
                                Sign In
                            </button>

                            {/* Divider */}
                            <div className="flex items-center my-6">
                                <div className="flex-1 h-px bg-white/30"></div>
                                <span className="px-4 text-sm text-white/60">or</span>
                                <div className="flex-1 h-px bg-white/30"></div>
                            </div>

                            {/* Create Account Link */}
                            <p className="text-center text-white/80">
                                Don't have an account? 
                                <span className="font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer ml-1 transition-colors">Create New Account</span>
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