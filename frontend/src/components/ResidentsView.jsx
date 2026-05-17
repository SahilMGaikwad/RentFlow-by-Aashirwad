import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Pencil, Users, Phone, Mail, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ITEMS_PER_PAGE = 10;

const ResidentsView = () => {
    const navigate = useNavigate();
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);

    const fetchResidents = async () => {
        setLoading(true);
        const isMockMode = localStorage.getItem('adminUser') !== null;
        if (isMockMode) {
            setTimeout(() => {
                const mockData = JSON.parse(localStorage.getItem('mockResidents') || '[]');
                setResidents(mockData.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
                setLoading(false);
            }, 500);
            return;
        }

        const { data, error } = await supabase
            .from('residents')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setResidents(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchResidents(); }, []);

    const handleDelete = async (resident) => {
        if (!window.confirm(`Delete ${resident.name} (Flat ${resident.flat_no})? This will also remove all their payment records.`)) return;
        setDeletingId(resident.id);
        
        const isMockMode = localStorage.getItem('adminUser') !== null;
        if (isMockMode) {
            setTimeout(() => {
                const currentMock = JSON.parse(localStorage.getItem('mockResidents') || '[]');
                const filteredMock = currentMock.filter(r => r.id !== resident.id);
                localStorage.setItem('mockResidents', JSON.stringify(filteredMock));
                setDeletingId(null);
                fetchResidents();
            }, 600);
            return;
        }

        // Delete payments first
        await supabase.from('payments').delete().eq('resident_id', resident.id);
        await supabase.from('residents').delete().eq('id', resident.id);
        setDeletingId(null);
        fetchResidents();
    };

    const filtered = residents.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.flat_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const rowVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                            <Users size={18} />
                        </span>
                        Residents
                    </h2>
                    <p className="text-sm text-muted mt-1 ml-12">{residents.length} total residents registered</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/admin/add')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#F43F5E] hover:bg-[#BE123C] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-900/20"
                >
                    <Plus size={16} /> Add Resident
                </motion.button>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative mb-6 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#8B5CF6] transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name, flat, email or phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full sm:w-80 py-2.5 px-4 pl-10 bg-panel border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all"
                />
            </motion.div>

            {/* Table */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel rounded-[24px] border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-muted text-sm font-medium">
                        <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-3" />
                        Loading residents...
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted">
                        <Users size={40} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium">{searchTerm ? 'No residents match your search' : 'No residents added yet'}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-white/[0.02]">
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Resident</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Flat</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Monthly Amt</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Language</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-border/40">
                                    {paginated.map(r => (
                                        <motion.tr variants={rowVariants} key={r.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F43F5E]/20 to-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold text-sm border border-white/5">
                                                        {r.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary">{r.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-lg text-xs font-bold border border-[#8B5CF6]/20">{r.flat_no}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary font-medium">{r.phone || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-secondary font-medium">{r.email || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-primary">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-sm text-secondary capitalize">{r.preferred_language || 'English'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigate(`/admin/edit-resident/${r.id}`)}
                                                        className="p-1.5 text-secondary hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-lg transition-colors"
                                                        title="Edit Resident"
                                                    >
                                                        <Pencil size={15} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(r)}
                                                        disabled={deletingId === r.id}
                                                        className="p-1.5 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                                                        title="Delete Resident"
                                                    >
                                                        {deletingId === r.id
                                                            ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                                            : <Trash2 size={15} />
                                                        }
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="md:hidden flex flex-col divide-y divide-border/40">
                            {paginated.map(r => (
                                <motion.div variants={rowVariants} key={r.id} className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F43F5E]/20 to-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold border border-white/5">
                                                {r.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-primary">{r.name}</p>
                                                <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded text-[10px] font-bold border border-[#8B5CF6]/20">{r.flat_no}</span>
                                            </div>
                                        </div>
                                        <p className="text-base font-black text-primary">₹{(r.amount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs text-secondary">
                                        {r.phone && <span className="flex items-center gap-1.5"><Phone size={11} />{r.phone}</span>}
                                        {r.email && <span className="flex items-center gap-1.5"><Mail size={11} />{r.email}</span>}
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => navigate(`/admin/edit-resident/${r.id}`)} className="flex-1 py-2 text-xs font-bold text-[#8B5CF6] border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 rounded-lg flex items-center justify-center gap-1.5">
                                            <Pencil size={12} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(r)} className="flex-1 py-2 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-center gap-1.5">
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                                <span className="text-sm text-muted font-medium">
                                    Showing <strong className="text-secondary">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong className="text-secondary">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong className="text-secondary">{filtered.length}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary disabled:opacity-30 transition-colors">
                                        <ChevronLeft size={15} />
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-primary disabled:opacity-30 transition-colors">
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.section>
        </div>
    );
};

export default ResidentsView;
