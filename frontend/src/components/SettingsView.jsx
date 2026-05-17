import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, CreditCard, Globe, Bell, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

const SettingsView = () => {
    const { user } = useAuth();

    // UPI & QR settings stored in localStorage
    const [upiId, setUpiId] = useState(() => localStorage.getItem('admin_upi_id') || '');
    const [upiName, setUpiName] = useState(() => localStorage.getItem('admin_upi_name') || 'Aashirvad Apartments');
    const [notifyEmail, setNotifyEmail] = useState(() => localStorage.getItem('admin_notify_email') !== 'false');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('admin_upi_id', upiId);
        localStorage.setItem('admin_upi_name', upiName);
        localStorage.setItem('admin_notify_email', notifyEmail.toString());
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10 pb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                        <Settings size={18} />
                    </span>
                    Settings
                </h2>
                <p className="text-sm text-muted mt-1 ml-12">Manage admin preferences and configurations</p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
                {/* Admin Profile */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                    <div className="flex items-center gap-2 mb-5">
                        <User size={15} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Admin Profile</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F43F5E] to-[#BE123C] flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10">
                            {user?.email?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="text-base font-bold text-primary">{user?.email || 'Admin'}</p>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-full uppercase tracking-wider">Administrator</span>
                        </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email" value={user?.email || ''} readOnly
                                className="w-full py-2.5 px-3.5 bg-solid border border-border rounded-xl text-sm text-secondary font-medium focus:outline-none cursor-default opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Role</label>
                            <input
                                type="text" value="Administrator" readOnly
                                className="w-full py-2.5 px-3.5 bg-solid border border-border rounded-xl text-sm text-secondary font-medium focus:outline-none cursor-default opacity-70"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Payment Settings */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                    <div className="flex items-center gap-2 mb-5">
                        <CreditCard size={15} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Payment Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">UPI ID</label>
                            <input
                                type="text" value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                                placeholder="e.g. aashirvad@upi"
                                className="w-full py-2.5 px-3.5 bg-solid border border-border rounded-xl text-sm text-primary focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all placeholder-muted"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Payee Name</label>
                            <input
                                type="text" value={upiName}
                                onChange={e => setUpiName(e.target.value)}
                                placeholder="e.g. Aashirvad Apartments"
                                className="w-full py-2.5 px-3.5 bg-solid border border-border rounded-xl text-sm text-primary focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all placeholder-muted"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted mt-3">These details are used when generating QR codes for residents to scan and pay.</p>
                </motion.div>

                {/* Language */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                    <div className="flex items-center gap-2 mb-5">
                        <Globe size={15} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Language & Region</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Interface Language</label>
                        <LanguageSelector />
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                    <div className="flex items-center gap-2 mb-5">
                        <Bell size={15} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Notifications</h3>
                    </div>
                    <div className="flex items-center justify-between py-3 border border-border rounded-xl px-4 bg-solid/50">
                        <div>
                            <p className="text-sm font-semibold text-primary">Email Reminders</p>
                            <p className="text-xs text-muted mt-0.5">Send payment reminder emails to residents</p>
                        </div>
                        <button
                            onClick={() => setNotifyEmail(v => !v)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifyEmail ? 'bg-[#8B5CF6]' : 'bg-solid border border-border'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifyEmail ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </motion.div>

                {/* Security Info */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={15} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Security</h3>
                    </div>
                    <p className="text-sm text-muted mb-3">Password and account security are managed via Supabase Auth. To change your password:</p>
                    <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
                        <li>Go to <span className="text-[#8B5CF6] font-semibold">supabase.com/dashboard</span></li>
                        <li>Navigate to <strong className="text-secondary">Authentication → Users</strong></li>
                        <li>Click on your user and use "Send password reset" or update directly</li>
                    </ol>
                </motion.div>

                {/* Save Button */}
                <motion.div variants={itemVariants} className="flex justify-end">
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                            saved
                                ? 'bg-green-500 text-white shadow-green-900/20'
                                : 'bg-[#F43F5E] hover:bg-[#BE123C] text-white shadow-red-900/20'
                        }`}
                    >
                        {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SettingsView;
