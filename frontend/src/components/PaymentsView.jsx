import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, Filter, QrCode, FileText, MessageCircle, Trash2, CheckCircle, Edit3, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { generateInvoicePDF, getWhatsAppUrl } from '../utils/helpers';

const ITEMS_PER_PAGE = 12;

const PaymentsView = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [monthFilter, setMonthFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('payments')
            .select(`*, residentId:resident_id (id, name, flat_no, email, phone, preferred_language)`)
            .order('created_at', { ascending: false });
        if (!error) setPayments(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchPayments(); }, []);

    const handleMarkPaid = async (payment) => {
        if (!window.confirm('Mark this payment as Paid?')) return;
        await supabase.from('payments').update({ status: 'Paid', payment_date: new Date().toISOString() }).eq('id', payment.id);
        fetchPayments();
    };

    const handleDelete = async (payment) => {
        if (!window.confirm('Delete this payment record?')) return;
        await supabase.from('payments').delete().eq('id', payment.id);
        fetchPayments();
    };

    const handleSaveAmount = async () => {
        const amt = Number(editAmount);
        if (isNaN(amt) || amt <= 0) return alert('Enter a valid amount');
        await supabase.from('payments').update({ amount: amt }).eq('id', editingPayment.id);
        setEditingPayment(null);
        fetchPayments();
    };

    // Unique months from payments
    const months = ['All', ...Array.from(new Set(payments.map(p => p.month).filter(Boolean)))];

    const filtered = payments.filter(p => {
        const matchSearch = p.residentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.residentId?.flat_no?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchMonth = monthFilter === 'All' || p.month === monthFilter;
        return matchSearch && matchStatus && matchMonth;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const statusBadge = (status) => {
        if (status === 'Paid') return 'bg-green-500/10 text-green-400 border-green-500/20';
        if (status === 'Verification Pending') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    const statusLabel = (s) => s === 'Paid' ? 'Paid' : s === 'Verification Pending' ? 'Verifying' : 'Pending';

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
    const rowVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                        <CreditCard size={18} />
                    </span>
                    Payments
                </h2>
                <p className="text-sm text-muted mt-1 ml-12">{payments.length} total payment records</p>
            </motion.div>

            {/* Filters Row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative group flex-1 max-w-xs">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#8B5CF6] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or flat..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2.5 pl-9 pr-4 bg-panel border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2.5 bg-panel border border-border text-secondary text-sm font-medium rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all cursor-pointer"
                    >
                        {['All', 'Pending', 'Verification Pending', 'Paid'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select
                        value={monthFilter}
                        onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2.5 bg-panel border border-border text-secondary text-sm font-medium rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all cursor-pointer"
                    >
                        {months.map(m => <option key={m}>{m}</option>)}
                    </select>
                </div>
            </motion.div>

            {/* Status Summary Pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-6">
                {[
                    { label: 'All', count: payments.length, color: 'bg-white/5 text-secondary border-border' },
                    { label: 'Pending', count: payments.filter(p => p.status === 'Pending').length, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                    { label: 'Verifying', count: payments.filter(p => p.status === 'Verification Pending').length, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                    { label: 'Paid', count: payments.filter(p => p.status === 'Paid').length, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
                ].map(pill => (
                    <span key={pill.label} className={`px-3 py-1 rounded-full text-xs font-bold border ${pill.color}`}>
                        {pill.label}: {pill.count}
                    </span>
                ))}
            </motion.div>

            {/* Table */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-[24px] border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-muted text-sm">
                        <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-3" />
                        Loading payments...
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted">
                        <CreditCard size={40} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium">No payments match your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-border bg-white/[0.02]">
                                        {['Resident', 'Flat', 'Month', 'Amount', 'Status', 'Actions'].map(h => (
                                            <th key={h} className={`px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-border/40">
                                    {paginated.map(p => (
                                        <motion.tr variants={rowVariants} key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-solid border border-border flex items-center justify-center text-secondary text-xs font-bold">
                                                        {p.residentId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary">{p.residentId?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded text-xs font-bold border border-[#8B5CF6]/20">{p.residentId?.flat_no}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-secondary font-medium">{p.month}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-primary">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusBadge(p.status)}`}>{statusLabel(p.status)}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex justify-end items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {p.status === 'Pending' && (
                                                        <button onClick={() => { setEditingPayment(p); setEditAmount(p.amount.toString()); }} className="p-1.5 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-secondary rounded-lg transition-colors" title="Edit Amount"><Edit3 size={14} /></button>
                                                    )}
                                                    {p.status === 'Verification Pending' && (
                                                        <button onClick={() => handleMarkPaid(p)} className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1">
                                                            <CheckCircle size={12} /> Verify
                                                        </button>
                                                    )}
                                                    {p.status === 'Paid' && (
                                                        <button onClick={() => generateInvoicePDF(p, p.residentId)} className="p-1.5 hover:text-zinc-300 hover:bg-zinc-500/10 text-secondary rounded-lg transition-colors" title="Download Receipt"><FileText size={14} /></button>
                                                    )}
                                                    {p.residentId?.phone && p.status !== 'Paid' && (
                                                        <a href={getWhatsAppUrl(p.residentId.phone, `Hello, your apartment maintenance for ${p.month} is ₹${p.amount}. Please pay at your earliest convenience.`)} target="_blank" rel="noreferrer" className="p-1.5 hover:text-emerald-400 hover:bg-emerald-500/10 text-secondary rounded-lg transition-colors" title="WhatsApp Reminder">
                                                            <MessageCircle size={14} />
                                                        </a>
                                                    )}
                                                    <button onClick={() => navigate(`/admin/edit-resident/${p.residentId?.id}`)} className="p-1.5 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-secondary rounded-lg transition-colors" title="Edit Resident"><Pencil size={14} /></button>
                                                    <button onClick={() => handleDelete(p)} className="p-1.5 hover:text-red-400 hover:bg-red-500/10 text-secondary rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="md:hidden flex flex-col divide-y divide-border/40">
                            {paginated.map(p => (
                                <motion.div variants={rowVariants} key={p.id} className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-solid border border-border text-secondary flex items-center justify-center font-bold text-sm">{p.residentId?.name?.charAt(0) || '?'}</div>
                                            <div>
                                                <p className="text-sm font-bold text-primary">{p.residentId?.name}</p>
                                                <p className="text-xs text-muted">Flat {p.residentId?.flat_no} · {p.month}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-base font-black text-primary">₹{(p.amount || 0).toLocaleString('en-IN')}</p>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge(p.status)}`}>{statusLabel(p.status)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {p.status === 'Verification Pending' && (
                                            <button onClick={() => handleMarkPaid(p)} className="flex-1 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex items-center justify-center gap-1">
                                                <CheckCircle size={12} /> Verify
                                            </button>
                                        )}
                                        {p.status === 'Paid' && (
                                            <button onClick={() => generateInvoicePDF(p, p.residentId)} className="flex-1 py-2 text-xs font-bold text-zinc-400 border border-zinc-500/20 bg-zinc-500/5 rounded-lg flex items-center justify-center gap-1">
                                                <FileText size={12} /> Receipt
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(p)} className="py-2 px-3 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-lg">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                                <span className="text-sm text-muted">Showing <strong className="text-secondary">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong className="text-secondary">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong className="text-secondary">{filtered.length}</strong></span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary disabled:opacity-30 transition-colors"><ChevronLeft size={15} /></button>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary disabled:opacity-30 transition-colors"><ChevronRight size={15} /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.section>

            {/* Edit Amount Modal */}
            <AnimatePresence>
                {editingPayment && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel border border-white/10 rounded-[28px] w-full max-w-sm p-8 shadow-2xl">
                            <h3 className="text-xl font-bold text-primary mb-4">Edit Payment Amount</h3>
                            <div className="bg-solid/50 rounded-2xl p-4 mb-6 space-y-2 border border-border text-sm">
                                <div className="flex justify-between"><span className="text-muted">Resident</span><span className="text-primary font-bold">{editingPayment.residentId?.name}</span></div>
                                <div className="flex justify-between"><span className="text-muted">Month</span><span className="text-primary font-bold">{editingPayment.month}</span></div>
                            </div>
                            <label className="block text-sm font-semibold text-secondary mb-2">Amount (₹)</label>
                            <input
                                type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} min="1"
                                className="w-full bg-solid border border-border rounded-xl p-4 text-primary text-2xl font-black text-center focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 mb-6"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setEditingPayment(null)} className="flex-1 py-3 bg-solid border border-border text-secondary rounded-xl text-sm font-semibold hover:text-primary transition-colors">Cancel</button>
                                <button onClick={handleSaveAmount} className="flex-1 py-3 bg-[#F43F5E] text-white rounded-xl text-sm font-bold hover:bg-[#BE123C] transition-colors">Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentsView;
