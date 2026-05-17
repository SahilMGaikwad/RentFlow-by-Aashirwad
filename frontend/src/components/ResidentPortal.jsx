import React, { useEffect, useState } from 'react';
import { QrCode, CheckCircle, LogOut, History, User, Building, CreditCard, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/helpers';
import { motion } from 'framer-motion';

const ResidentPortal = () => {
    const { user, residentData, logout } = useAuth();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [pendingPayment, setPendingPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResidentData = async () => {
            if (!residentData?.id) return;
            try {
                const history = await paymentService.getPaymentHistoryByResident(residentData.id);
                setPayments(history);
                
                // Find most recent pending or verification pending payment
                const pending = history.find(p => p.status === 'Pending' || p.status === 'Verification Pending');
                setPendingPayment(pending);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchResidentData();
    }, [residentData]);

    const handleConfirmPayment = async () => {
        if (!pendingPayment) return;
        if (window.confirm("Are you sure you have completed the payment on your UPI app?")) {
            try {
                await paymentService.markAsVerificationPending(pendingPayment.id);
                alert("Payment marked for verification! The admin will review it shortly.");
                const history = await paymentService.getPaymentHistoryByResident(residentData.id);
                setPayments(history);
                setPendingPayment(history.find(p => p.status === 'Pending' || p.status === 'Verification Pending'));
            } catch (err) {
                console.error(err);
                alert("Failed to update status.");
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs">Loading Dashboard...</p>
        </div>
    );

    const upiLink = pendingPayment ? `upi://pay?pa=sneham271987@oksbi&pn=ApartmentMaintenance&am=${pendingPayment.amount}&tn=Maintenance ${residentData.flat_no.replace(/\s+/g, '')}_${pendingPayment.month}&cu=INR` : '';

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto" onError={(e) => e.target.style.display = 'none'} />
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-[#D4AF37]">RESIDENT PORTAL</h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aashirvad Apartments</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Column: Profile & Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl"
                    >
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={16} className="text-[#D4AF37]" /> Resident Profile
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Full Name</label>
                                <p className="text-lg font-bold text-white">{residentData.name}</p>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Flat Number</label>
                                    <p className="text-lg font-bold text-white flex items-center gap-2">
                                        <Building size={16} className="text-zinc-500" /> {residentData.flat_no}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Monthly Due</label>
                                    <p className="text-lg font-bold text-[#D4AF37]">₹{residentData.amount}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Total Payments</p>
                            <p className="text-xl font-bold text-white">{payments.filter(p => p.status === 'Paid').length}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Status</p>
                            <p className={`text-sm font-bold ${pendingPayment ? 'text-red-400' : 'text-green-400'}`}>
                                {pendingPayment ? 'Action Required' : 'All Clear'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Payment & History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Payment Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-black border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <CreditCard size={120} />
                        </div>

                        {pendingPayment ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">Pending Maintenance</h2>
                                    <p className="text-sm font-medium text-zinc-400 mb-6">Generated for {pendingPayment.month}</p>
                                    
                                    <div className="mb-8">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Amount to Pay</span>
                                        <span className="text-5xl font-black text-[#D4AF37]">₹{pendingPayment.amount}</span>
                                    </div>

                                    {pendingPayment.status === 'Verification Pending' ? (
                                        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                            <div className="flex items-center gap-2 mb-1">
                                                <History size={18} />
                                                <span className="font-bold">Wait for Verification</span>
                                            </div>
                                            <p className="text-xs opacity-80">Our admin team is reviewing your payment details. You'll see an update soon.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <a href={upiLink} className="w-full h-12 bg-[#DC2626] hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                                                <QrCode size={18} /> Pay with any UPI App
                                            </a>
                                            <button onClick={handleConfirmPayment} className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                                                <CheckCircle size={18} /> I Have Already Paid
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {pendingPayment.status !== 'Verification Pending' && (
                                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-white/20 shadow-2xl">
                                        <QRCodeSVG value={upiLink} size={180} level="H" />
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">Scan QR to Pay</p>
                                        <p className="text-xs font-bold text-black mt-1">sneham271987@oksbi</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">No Dues Found</h2>
                                <p className="text-zinc-400">You are all caught up with your maintenance payments!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Payment History Table */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <History size={16} className="text-[#D4AF37]" /> Payment History
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/20">
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {payments.length > 0 ? (
                                        payments.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-white">{p.month}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-white">₹{p.amount}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        p.status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        p.status === 'Verification Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.status === 'Paid' ? (
                                                        <button 
                                                            onClick={() => generateInvoicePDF(p, residentData)}
                                                            className="flex items-center gap-1 text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:text-white transition-colors"
                                                        >
                                                            <Download size={12} /> Receipt
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-zinc-700 uppercase">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-zinc-500 font-bold text-xs">No payment history available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ResidentPortal;
