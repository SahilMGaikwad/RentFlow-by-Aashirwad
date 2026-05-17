import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, EyeOff, Plus, Search, FileDown, LogOut, Settings, Users, CreditCard, LayoutDashboard, LineChart, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import { residentService } from '../services/residentService';
import { paymentService } from '../services/paymentService';
import PaymentTable from './PaymentTable';
import QRPayment from './QRPayment';
import { useAuth } from '../contexts/AuthContext';
import ResidentsView from './ResidentsView';
import PaymentsView from './PaymentsView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// Animated Number Counter Component
const AnimatedNumber = ({ value, prefix = "", isHidden = false }) => {
    if (isHidden) return <span>••••••••</span>;
    return (
        <motion.span
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {prefix}{value.toLocaleString('en-IN')}
        </motion.span>
    );
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalCollected: 0, pendingPaymentsCount: 0, awaitingVerificationCount: 0, totalResidents: 0, totalPendingAmount: 0 });
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [revenueData, setRevenueData] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [showBalance, setShowBalance] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                await paymentService.generateMonthlyPayments();
                await fetchDashboardData();
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        initDashboard();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { totalResidents } = await residentService.getStats();
            const recentPayments = await paymentService.getRecentPayments();
            const statsData = await paymentService.getDashboardStats();

            setPayments(recentPayments);

            setStats({
                totalResidents,
                totalPendingAmount: statsData.totalPendingAmount,
                totalCollected: statsData.totalCollected,
                pendingPaymentsCount: statsData.pendingPaymentsCount,
                awaitingVerificationCount: statsData.awaitingVerificationCount
            });

            setRevenueData(statsData.revenueData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    const handleExport = () => {
        if (payments.length === 0) return alert(t('noResidentsFound'));
        let csv = `Resident Name,Flat Number,Amount,Status,Month\n`;
        payments.forEach(p => {
            csv += `"${p.residentId?.name}","${p.residentId?.flat_no}",${p.amount},${p.status},${p.month}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const handleMarkPaid = async (payment) => {
        try {
            await paymentService.markAsPaid(payment.id);
            await fetchDashboardData();
            setSelectedPayment(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const handleDeletePayment = async (payment) => {
        if (window.confirm("Are you sure you want to delete this payment record?")) {
            try {
                await paymentService.deletePayment(payment.id);
                await fetchDashboardData();
            } catch (err) {
                console.error(err);
                alert("Failed to delete payment");
            }
        }
    };

    const openEditModal = (payment) => {
        setEditingPayment(payment);
        setEditAmount(payment.amount.toString());
    };

    const handleSaveAmount = async () => {
        const amountNum = Number(editAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return alert("Please enter a valid amount greater than 0");
        }
        try {
            await paymentService.updateAmount(editingPayment.id, amountNum);
            await fetchDashboardData();
            setEditingPayment(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update amount");
        }
    };

    const filteredPayments = payments.filter(p =>
        p.residentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.residentId?.flat_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-transparent text-primary pb-10 font-sans selection:bg-[#8B5CF6]/30 overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 bg-app/40 border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-3xl transition-all">
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 md:gap-3 cursor-pointer group"
                >
                    <img
                        src="/logo.png"
                        alt="Aashirvad Apartments Logo"
                        className="h-8 md:h-10 lg:h-12 w-auto object-contain bg-white/5 rounded-lg p-1 group-hover:bg-white/10 transition-colors"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            document.getElementById('fallback-text-logo').style.display = 'flex';
                        }}
                    />
                    <div id="fallback-text-logo" className="hidden flex-col justify-center">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-[#F43F5E] leading-none drop-shadow-sm">AASHIRVAD</span>
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#8B5CF6] uppercase leading-none mt-1">APARTMENTS</span>
                    </div>
                    {/* Default Text shown if image loads but user wants text too */}
                    <div className="hidden sm:flex flex-col justify-center ml-1">
                        <span className="text-xl font-black tracking-tight text-[#F43F5E] leading-none drop-shadow-[0_2px_4px_rgba(220,38,38,0.2)]">AASHIRVAD</span>
                        <span className="text-[10px] font-bold tracking-widest text-[#8B5CF6] uppercase leading-none mt-1 drop-shadow-sm">APARTMENTS</span>
                    </div>
                </motion.div>

                {/* Navigation Links (Desktop/Tablet) */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 pill-nav shadow-glass">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                        { id: 'residents', label: 'Residents', icon: <Users size={16} /> },
                        { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
                        { id: 'analytics', label: 'Analytics', icon: <LineChart size={16} /> },
                        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-2 py-1.5 px-4 rounded-xl transition-colors text-sm font-medium ${
                                activeTab === tab.id
                                    ? 'text-primary font-bold bg-white/5'
                                    : 'text-muted hover:text-primary'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-[#8B5CF6]' : ''}>{tab.icon}</span>
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3 lg:gap-6">
                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-border">
                        <Bell className="text-secondary hover:text-primary" size={20} />
                        <span className="absolute top-1 right-2 w-2 h-2 bg-[#F43F5E] rounded-full border border-app shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F43F5E] to-[#BE123C] flex items-center justify-center text-white font-bold shadow-sm cursor-pointer border border-white/10 hover:border-white/30 transition-all text-sm">
                        A
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={async () => { await logout(); navigate('/login'); }}
                        className="hidden sm:flex text-muted hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </motion.button>

                    {/* Mobile Hamburger Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-secondary hover:text-primary transition-colors focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Non-dashboard Tab Views */}
            {activeTab === 'residents' && <ResidentsView />}
            {activeTab === 'payments' && <PaymentsView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'settings' && <SettingsView />}

            {/* Dashboard Content — only shown on dashboard tab */}
            <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 top-[72px] bg-app/95 backdrop-blur-3xl z-40 lg:hidden border-t border-border flex flex-col p-4 w-full sm:w-80 shadow-2xl h-[calc(100vh-72px)] overflow-y-auto"
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2 mt-4">Main Menu</h3>
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                                { id: 'residents', label: 'Residents', icon: <Users size={18} /> },
                                { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
                                { id: 'analytics', label: 'Analytics', icon: <LineChart size={18} /> },
                                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                                    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors w-full text-left text-sm ${
                                        activeTab === tab.id
                                            ? 'text-primary font-bold bg-white/5'
                                            : 'text-muted font-medium hover:text-primary hover:bg-white/5'
                                    }`}
                                >
                                    <span className={activeTab === tab.id ? 'text-[#8B5CF6]' : ''}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}

                            <hr className="border-border my-2" />

                            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2 mt-2">Preferences</h3>
                            <div className="md:hidden mb-2 px-2">
                                <LanguageSelector />
                            </div>

                            <button onClick={async () => { await logout(); navigate('/login'); }} className="flex items-center gap-3 text-[#F43F5E] font-medium hover:bg-[#F43F5E]/10 py-3 px-4 rounded-xl transition-colors w-full text-left mt-auto">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8"
            >
                {/* Hero Statistics Card */}
                <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6 relative group">
                    <motion.div
                        className="relative overflow-hidden rounded-[24px] p-8 glass-panel cursor-default transition-shadow duration-300 border-t border-t-[#8B5CF6]/20"
                    >
                        {/* Subtle Card Background overlay */}
                        <div className="absolute inset-0 bg-[#8B5CF6]/5 transition-opacity duration-300 group-hover:bg-[#8B5CF6]/10"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-secondary text-xs font-bold tracking-wider uppercase">Maintenance Overview</h2>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowBalance(!showBalance)} className="text-muted hover:text-primary transition bg-solid/50 hover:bg-solid p-1.5 rounded-lg border border-border">
                                    <AnimatePresence mode="wait">
                                        <motion.div key={showBalance ? "eye" : "eyeOff"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.button>
                            </div>

                            <div>
                                <p className="text-muted text-sm font-medium mb-1">Total Collected This Month</p>
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                                    <AnimatedNumber value={stats.totalCollected} prefix="₹" isHidden={!showBalance} />
                                </h1>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted text-[11px] font-bold tracking-wider uppercase mb-1">Pending</p>
                                    <p className="text-xl font-bold text-white"><AnimatedNumber value={stats.totalPendingAmount} prefix="₹" /></p>
                                </div>
                                <div>
                                    <p className="text-muted text-[11px] font-bold tracking-wider uppercase mb-1">Residents</p>
                                    <p className="text-xl font-bold text-white"><AnimatedNumber value={stats.totalResidents} /></p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Access Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/add')} className="glass-panel overflow-hidden relative group hover:bg-solid transition-all rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 border border-border">
                            <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E] group-hover:bg-[#F43F5E] group-hover:text-white flex items-center justify-center transition-colors">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">Add Resident</span>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleExport} className="glass-panel overflow-hidden relative group hover:bg-solid transition-all rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 border border-border">
                            <div className="w-10 h-10 rounded-xl bg-zinc-500/10 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white flex items-center justify-center transition-colors">
                                <FileDown size={20} />
                            </div>
                            <span className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">Export CSV</span>
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Dashboard Analytics Section */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <motion.section
                        className="glass-panel rounded-[24px] p-8 h-full flex flex-col transition-shadow duration-300 border border-border"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-primary flex items-center gap-3">
                                    Monthly Revenue
                                </h3>
                                <p className="text-xs text-muted mt-1">Payment collections over time</p>
                            </div>
                            <div className="relative group">
                                <select className="px-3 py-2 bg-solid rounded-lg text-xs font-bold text-secondary border border-border hover:border-white/10 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-[#8B5CF6] appearance-none drop-shadow-sm">
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-[280px] relative">
                            {revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} tickFormatter={(val) => `₹${val / 1000}k`} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1c1c24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', color: '#fff', padding: '12px' }}
                                            itemStyle={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '16px' }}
                                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        />
                                        {/* Chart Animation happens automatically by Recharts on mount */}
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="url(#colorRevenueDark)"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenueDark)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6', style: { filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.5))' } }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-muted font-medium text-sm flex flex-col items-center gap-2">
                                        <LineChart size={32} className="opacity-20" />
                                        <span>No revenue data available yet</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.section>
                </motion.div>
            </motion.div>

            {/* Payments Table Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8 relative z-20"
            >
                <section className="glass-panel rounded-[24px] p-6 md:p-8 min-h-[400px] border border-border">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-primary flex items-center gap-3">
                                Recent Payments
                            </h3>
                            <p className="text-xs text-muted mt-1">Manage and track latest resident transactions</p>
                        </div>
                        <div className="relative w-full sm:w-auto group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#8B5CF6] transition-colors" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full sm:w-64 py-2 px-3 pl-10 bg-solid border border-border rounded-lg text-sm font-medium text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <PaymentTable
                        payments={paginatedPayments}
                        onOpenQR={(p) => setSelectedPayment(p)}
                        onMarkPaid={handleMarkPaid}
                        onDelete={handleDeletePayment}
                        onEditAmount={openEditModal}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                            <span className="text-sm font-medium text-muted">
                                Showing <strong className="text-secondary">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to <strong className="text-secondary">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)}</strong> of <strong className="text-secondary">{filteredPayments.length}</strong> payments
                            </span>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </motion.button>
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                                        Math.max(0, currentPage - 2),
                                        Math.min(totalPages, currentPage + 1)
                                    ).map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === pageNum
                                                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                                                    : 'text-muted hover:text-secondary hover:bg-solid'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </section>
            </motion.div>

            <AnimatePresence>
                {selectedPayment && (
                    <QRPayment
                        key="qr-modal"
                        selectedPayment={selectedPayment}
                        onCancel={() => setSelectedPayment(null)}
                        onConfirmPaid={handleMarkPaid}
                    />
                )}

                {/* Edit Amount Modal */}
                {editingPayment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="glass-panel border border-white/10 rounded-[28px] w-full max-w-sm p-8 shadow-2xl relative"
                        >
                            <h3 className="text-xl font-bold text-primary mb-6">Edit Payment</h3>

                            <div className="bg-solid/50 rounded-2xl p-4 mb-6 space-y-3 border border-border">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Resident</span>
                                    <span className="text-primary font-bold">{editingPayment.residentId?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Flat No.</span>
                                    <span className="text-primary font-bold">{editingPayment.residentId?.flat_no}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Month</span>
                                    <span className="text-primary font-bold">{editingPayment.month}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-secondary mb-3">Amount Due (₹)</label>
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    min="1"
                                    className="w-full bg-solid border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] text-primary text-2xl font-black text-center transition-all shadow-inner"
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditingPayment(null)}
                                    className="flex-1 px-4 py-3 bg-solid border border-border text-secondary rounded-lg text-sm font-semibold hover:bg-white/5 hover:text-primary transition-all"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveAmount}
                                    className="flex-1 px-4 py-3 bg-[#F43F5E] text-white rounded-lg text-sm font-semibold hover:bg-[#BE123C] transition-all border border-[#BE123C]"
                                >
                                    Save Changes
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>{/* end dashboard-only content */}
        </div>
    );
};

export default Dashboard;
