import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, ShieldCheck, Mail, Lock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const { loginAsResident, loginAsAdmin } = useAuth();
    const [view, setView] = useState('resident'); // 'resident' or 'admin'

    // Resident State
    const [residentEmail, setResidentEmail] = useState('');
    const [residentPassword, setResidentPassword] = useState('');

    // Admin State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Shared State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ---- Resident Flow (Email + Phone) ----
    const handleResidentLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Step 1: Search the residents table where email = entered_email
            const { data: resident, error: fetchErr } = await supabase
                .from('residents')
                .select('*')
                .eq('email', residentEmail)
                .limit(1)
                .maybeSingle();

            if (fetchErr) {
                console.error('Supabase fetch error:', fetchErr);
                setError('An error occurred. Please try again.');
                return;
            }

            if (!resident) {
                setError('Resident not registered');
                return;
            }

            // Step 2: Compare entered password with the resident phone number
            if (residentPassword === resident.phone) {
                // Allow login
                loginAsResident(resident);
                navigate('/resident');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    // ---- Admin Flow (Password) ----
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Mock/Fallback Check for Offline/Connection Issues
        if (email === 'sahil3032p@gmail.com' && password === 'oneplus11R...') {
            console.log("Mock Admin Login Success");
            loginAsAdmin(email);
            navigate('/admin');
            setLoading(false);
            return;
        }

        try {
            const { data, error: loginErr } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (loginErr) throw loginErr;
            if (data?.session) navigate('/admin');
        } catch (err) {
            console.error(err);
            setError('Invalid email or password. (Database may be offline)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-[#D4AF37]/30 bg-gradient-to-br from-[#09090b] via-[#09090b] to-[#1a0b2e]">

            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* Centered Logo Header Block */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center mb-6 w-full max-w-sm pointer-events-none z-10 pt-4"
            >
                <img
                    src="/logo.png"
                    alt="Aashirvad Apartments Logo"
                    className="h-[60px] md:h-[80px] lg:h-[100px] w-auto object-contain drop-shadow-2xl mb-3 pointer-events-auto transition-all"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />

                <div className="flex flex-col items-center mb-2">
                    <span className="text-xl md:text-2xl font-black tracking-widest text-[#D4AF37] uppercase leading-none drop-shadow-sm text-center">AASHIRVAD APARTMENTS</span>
                </div>

                <h2 className="text-xs md:text-sm font-bold tracking-widest text-zinc-400 uppercase text-center">
                    Apartment Maintenance Portal
                </h2>
            </motion.div>

            {/* Login Card Container */}
            <div className="w-full flex justify-center relative z-10 px-4 sm:px-0">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-[420px] p-6 md:p-8 rounded-[18px] border border-white/5 shadow-2xl relative backdrop-blur-xl bg-[rgba(30,30,40,0.8)]"
                >
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-white mb-1.5 tracking-tight">Welcome Back</h2>
                        <p className="text-zinc-400 font-medium text-sm">Sign in to continue to your dashboard</p>
                    </div>

                    {/* View Toggles - Pill Style */}
                    <div className="flex bg-black/40 p-1 rounded-full mb-8 border border-white/5 relative">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setView('resident'); setError(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors relative z-10 ${view === 'resident' ? 'text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        >
                            {view === 'resident' && (
                                <motion.div layoutId="activeTabLogin" className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-yellow-500 rounded-full -z-10 shadow-[0_0_10px_rgba(212,175,55,0.3)]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                            )}
                            Resident
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setView('admin'); setError(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors relative z-10 ${view === 'admin' ? 'text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        >
                            {view === 'admin' && (
                                <motion.div layoutId="activeTabLogin" className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-yellow-500 rounded-full -z-10 shadow-[0_0_10px_rgba(212,175,55,0.3)]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                            )}
                            Admin
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-2xl text-center overflow-hidden"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Resident Login Form */}
                    <AnimatePresence mode="wait">
                        {view === 'resident' && (
                            <motion.form
                                key="resident-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleResidentLogin}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider">Resident Email</label>
                                    <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={residentEmail}
                                            onChange={(e) => setResidentEmail(e.target.value)}
                                            placeholder="resident@example.com"
                                            className="w-full h-12 pl-11 pr-4 border border-[#2a2a2a] rounded-xl bg-black/20 text-white placeholder-zinc-600 focus:bg-black/40 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm shadow-inner focus:shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                                        />
                                    </motion.div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                                    <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={residentPassword}
                                            onChange={(e) => setResidentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-11 pr-4 border border-[#2a2a2a] rounded-xl bg-black/20 text-white placeholder-zinc-600 focus:bg-black/40 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm shadow-inner focus:shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                                        />
                                    </motion.div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="w-full h-[50px] bg-gradient-to-r from-[#DC2626] to-[#8A151B] text-white font-bold rounded-[14px] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2 group border border-[#DC2626]/50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}

                        {/* Admin Login Form */}
                        {view === 'admin' && (
                            <motion.form
                                key="admin-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleAdminLogin}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider">Admin Email</label>
                                    <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@aashirvad.com"
                                            className="w-full h-12 pl-11 pr-4 border border-[#2a2a2a] rounded-xl bg-black/20 text-white placeholder-zinc-600 focus:bg-black/40 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm shadow-inner focus:shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                                        />
                                    </motion.div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider">Security Key</label>
                                    <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-11 pr-4 border border-[#2a2a2a] rounded-xl bg-black/20 text-white placeholder-zinc-600 focus:bg-black/40 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm shadow-inner focus:shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                                        />
                                    </motion.div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="w-full h-[50px] bg-gradient-to-r from-[#DC2626] to-[#8A151B] text-white font-bold rounded-[14px] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2 group border border-[#DC2626]/50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Access Dashboard
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                        <button className="text-zinc-500 hover:text-white text-xs font-semibold transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
