import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QrCode, FileText, MessageCircle, Trash2, CheckCircle, Edit3, Pencil } from 'lucide-react';
import { generateInvoicePDF, getWhatsAppUrl } from '../utils/helpers';
import { motion } from 'framer-motion';

const PaymentTable = ({ payments, onMarkPaid, onOpenQR, onDelete, onEditAmount }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (!payments || payments.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 bg-solid/30 rounded-2xl border border-white/5">
                <FileText size={40} className="text-secondary/30 mb-4" />
                <div className="text-center text-muted text-sm font-medium">No payments yet</div>
            </motion.div>
        );
    }

    return (
        <div className="w-full pb-4">
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Resident Name</th>
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Flat Number</th>
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Month</th>
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Amount</th>
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                            <th className="pb-4 px-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="divide-y divide-border/50"
                    >
                        {payments.map((p) => (
                            <motion.tr variants={rowVariants} key={p.id} className="hover:bg-white/5 transition-colors group cursor-default">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-solid border border-border text-secondary flex items-center justify-center font-bold text-sm shadow-sm transition-colors group-hover:border-white/10 group-hover:text-primary">
                                            {p.residentId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-sm font-semibold text-primary">{p.residentId?.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm font-medium text-secondary">{p.residentId?.flat_no}</td>
                                <td className="py-4 px-4 text-sm text-secondary font-medium">{p.month}</td>
                                <td className="py-4 px-4 text-sm font-bold text-primary">₹{p.amount.toLocaleString('en-IN')}</td>
                                <td className="py-4 px-4">
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${p.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        p.status === 'Verification Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {p.status === 'Paid' ? t('statusPaid') :
                                            p.status === 'Verification Pending' ? 'Verifying' :
                                                t('statusPending')}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {p.status === 'Pending' ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => onOpenQR(p)}
                                                className="px-3 py-1.5 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#DC2626] hover:text-white transition-all shadow-sm"
                                            >
                                                <QrCode size={14} /> Pay
                                            </motion.button>
                                        ) : p.status === 'Verification Pending' ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    if (window.confirm("Verify that this payment was received?")) {
                                                        onMarkPaid(p);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <CheckCircle size={14} /> Verify
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => generateInvoicePDF(p, p.residentId)}
                                                className="px-3 py-1.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FileText size={14} /> Receipt
                                            </motion.button>
                                        )}

                                        {/* Action Buttons */}
                                        {p.status === 'Pending' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => onEditAmount(p)}
                                                className="p-1.5 text-secondary hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                                                title="Edit Amount"
                                            >
                                                <Edit3 size={16} />
                                            </motion.button>
                                        )}

                                        {p.residentId?.phone && p.status !== 'Paid' && (
                                            <motion.a
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                href={getWhatsAppUrl(p.residentId.phone, `Hello Your apartment maintenance for this month is ₹${p.amount}. Please pay using the link.`)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-secondary hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border-none block"
                                                title="WhatsApp Reminder"
                                            >
                                                <MessageCircle size={16} />
                                            </motion.a>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/admin/edit-resident/${p.residentId.id}`)}
                                            className="p-1.5 text-secondary hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                                            title="Edit Resident"
                                        >
                                            <Pencil size={16} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => onDelete(p)}
                                            className="p-1.5 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="md:hidden flex flex-col gap-4 mt-2"
            >
                {payments.map((p) => (
                    <motion.div variants={rowVariants} key={p.id} className="p-4 rounded-[16px] border border-border bg-white/5 flex flex-col gap-4 shadow-sm relative overflow-hidden group">
                        {/* Resident Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-solid border border-border text-secondary flex items-center justify-center font-bold shadow-sm transition-colors group-hover:border-white/10 group-hover:text-primary">
                                    {p.residentId?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-primary">{p.residentId?.name}</span>
                                    <span className="text-xs font-semibold text-secondary">Flat {p.residentId?.flat_no}</span>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${p.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                p.status === 'Verification Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                {p.status === 'Paid' ? t('statusPaid') :
                                    p.status === 'Verification Pending' ? 'Verifying' :
                                        t('statusPending')}
                            </span>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/50 pt-4 mt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">Amount Due ({p.month})</span>
                                <span className="text-lg font-black text-primary">₹{p.amount.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                                {p.status === 'Pending' ? (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onOpenQR(p)}
                                        className="px-3 py-2 flex-1 sm:flex-none bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[11px] font-bold flex justify-center items-center gap-1.5 active:bg-red-500 active:text-white transition-colors"
                                    >
                                        <QrCode size={14} /> Pay
                                    </motion.button>
                                ) : p.status === 'Verification Pending' ? (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            if (window.confirm("Verify that this payment was received?")) {
                                                onMarkPaid(p);
                                            }
                                        }}
                                        className="px-3 py-2 flex-1 sm:flex-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold flex justify-center items-center gap-1.5 active:bg-emerald-500 active:text-white transition-colors"
                                    >
                                        <CheckCircle size={14} /> Verify
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => generateInvoicePDF(p, p.residentId)}
                                        className="px-3 py-2 flex-1 sm:flex-none bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-lg text-[11px] font-bold flex justify-center items-center gap-1.5 active:bg-zinc-500 active:text-white transition-colors"
                                    >
                                        <FileText size={14} /> Receipt
                                    </motion.button>
                                )}

                                {/* Secondary Action Buttons */}
                                <div className="flex justify-end gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                                    {p.status === 'Pending' && (
                                        <button onClick={() => onEditAmount(p)} className="p-2 bg-solid border border-border text-secondary rounded-lg active:bg-white/10 transition-colors">
                                            <Edit3 size={14} />
                                        </button>
                                    )}
                                    {p.residentId?.phone && p.status !== 'Paid' && (
                                        <a href={getWhatsAppUrl(p.residentId.phone, `Hello Your apartment maintenance for this month is ₹${p.amount}. Please pay using the link.`)} target="_blank" rel="noreferrer" className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg active:bg-emerald-500/30 transition-colors">
                                            <MessageCircle size={14} />
                                        </a>
                                    )}
                                    <button onClick={() => navigate(`/admin/edit-resident/${p.residentId.id}`)} className="p-2 bg-solid border border-border text-secondary rounded-lg hover:text-[#D4AF37] active:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-colors hidden sm:block">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => onDelete(p)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg active:bg-red-500/30 transition-colors hidden sm:block">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default PaymentTable;
