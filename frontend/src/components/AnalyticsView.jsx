import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../supabaseClient';

const AnalyticsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('payments').select('amount, status, month, created_at');
            if (error || !data) { setLoading(false); return; }

            let totalCollected = 0, totalPending = 0, totalVerifying = 0;
            const monthlyMap = {};
            const statusCounts = { Paid: 0, Pending: 0, 'Verification Pending': 0 };

            data.forEach(p => {
                statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
                if (p.status === 'Paid') {
                    totalCollected += p.amount;
                    const mo = p.month ? p.month.substring(0, 3) : 'N/A';
                    if (!monthlyMap[mo]) monthlyMap[mo] = { month: mo, collected: 0, pending: 0 };
                    monthlyMap[mo].collected += p.amount;
                } else {
                    totalPending += p.amount;
                    if (p.status === 'Verification Pending') totalVerifying += p.amount;
                    const mo = p.month ? p.month.substring(0, 3) : 'N/A';
                    if (!monthlyMap[mo]) monthlyMap[mo] = { month: mo, collected: 0, pending: 0 };
                    monthlyMap[mo].pending += p.amount;
                }
            });

            const total = data.length;
            const collectionRate = total > 0 ? Math.round((statusCounts['Paid'] / total) * 100) : 0;
            const revenueData = Object.values(monthlyMap);

            setStats({ totalCollected, totalPending, totalVerifying, statusCounts, collectionRate, revenueData, total });
            setLoading(false);
        };
        fetchData();
    }, []);

    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-[#1c1c24] border border-white/10 rounded-2xl p-3 shadow-xl text-xs">
                <p className="text-muted mb-1 font-semibold">{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }} className="font-bold">
                        {p.name}: ₹{(p.value || 0).toLocaleString('en-IN')}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10 pb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                        <LineChartIcon size={18} />
                    </span>
                    Analytics
                </h2>
                <p className="text-sm text-muted mt-1 ml-12">Financial overview and payment insights</p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-32 text-muted text-sm">
                    <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-3" />
                    Loading analytics...
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Collected', value: `₹${(stats.totalCollected || 0).toLocaleString('en-IN')}`,
                                sub: `${stats.statusCounts['Paid']} payments`, icon: <TrendingUp size={18} />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20'
                            },
                            {
                                label: 'Total Pending', value: `₹${(stats.totalPending || 0).toLocaleString('en-IN')}`,
                                sub: `${stats.statusCounts['Pending']} payments`, icon: <TrendingDown size={18} />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20'
                            },
                            {
                                label: 'Awaiting Verify', value: `₹${(stats.totalVerifying || 0).toLocaleString('en-IN')}`,
                                sub: `${stats.statusCounts['Verification Pending']} payments`, icon: <AlertCircle size={18} />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20'
                            },
                            {
                                label: 'Collection Rate', value: `${stats.collectionRate}%`,
                                sub: `${stats.statusCounts['Paid']} of ${stats.total} paid`, icon: <CheckCircle size={18} />, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20'
                            },
                        ].map((card) => (
                            <motion.div key={card.label} variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border flex flex-col gap-3">
                                <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center border`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{card.label}</p>
                                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                                    <p className="text-xs text-muted mt-1">{card.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Collection Rate Progress Bar */}
                    <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-primary">Overall Collection Rate</p>
                            <span className="text-lg font-black text-[#8B5CF6]">{stats.collectionRate}%</span>
                        </div>
                        <div className="w-full bg-solid rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.collectionRate}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-[#F43F5E] to-[#8B5CF6]"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted mt-2">
                            <span>{stats.statusCounts['Paid']} Paid</span>
                            <span>{stats.statusCounts['Pending'] + stats.statusCounts['Verification Pending']} Remaining</span>
                        </div>
                    </motion.div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Area Chart */}
                        <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                            <h3 className="text-sm font-bold text-primary mb-1">Monthly Revenue Trend</h3>
                            <p className="text-xs text-muted mb-6">Collected vs pending by month</p>
                            {stats.revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={stats.revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `₹${v / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="collected" name="Collected" stroke="#8B5CF6" strokeWidth={2} fill="url(#collectedGrad)" />
                                        <Area type="monotone" dataKey="pending" name="Pending" stroke="#F43F5E" strokeWidth={2} fill="url(#pendingGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[220px] text-muted text-sm">No revenue data yet</div>
                            )}
                        </motion.div>

                        {/* Status Bar Chart */}
                        <motion.div variants={itemVariants} className="glass-panel rounded-[20px] p-6 border border-border">
                            <h3 className="text-sm font-bold text-primary mb-1">Payment Status Breakdown</h3>
                            <p className="text-xs text-muted mb-6">Number of payments per status</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={[
                                        { name: 'Paid', value: stats.statusCounts['Paid'], fill: '#22c55e' },
                                        { name: 'Pending', value: stats.statusCounts['Pending'], fill: '#ef4444' },
                                        { name: 'Verifying', value: stats.statusCounts['Verification Pending'], fill: '#f97316' },
                                    ]}
                                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                    <Bar dataKey="value" name="Payments" radius={[6, 6, 0, 0]}>
                                        {[
                                            { fill: '#22c55e' },
                                            { fill: '#ef4444' },
                                            { fill: '#f97316' },
                                        ].map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AnalyticsView;
