import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, Building, Phone, Mail, IndianRupee, Globe, Search, Save, Trash2, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const Detail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams(); // If present, edit mode

    const [formData, setFormData] = useState({
        name: '',
        flatNumber: '',
        email: '',
        phone: '',
        amount: '',
        preferredLanguage: 'en'
    });
    const [residentId, setResidentId] = useState(id);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchResident = async () => {
                const { data } = await supabase.from('residents').select('*').eq('id', id).single();
                if (data) {
                    setFormData({
                        name: data.name,
                        flatNumber: data.flat_no,
                        email: data.email,
                        phone: data.phone,
                        amount: data.amount,
                        preferredLanguage: data.preferred_language || 'en'
                    });
                }
            };
            fetchResident();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Check if we are in offline/mock mode (adminUser in localStorage)
            const isMockMode = localStorage.getItem('adminUser') !== null;
            if (isMockMode) {
                console.log("Mock Mode Active: Simulating save operation...");
                
                // MOCK SAVE LOGIC
                const currentMock = JSON.parse(localStorage.getItem('mockResidents') || '[]');
                const newResident = {
                    id: residentId || Date.now().toString(),
                    name: formData.name,
                    flat_no: formData.flatNumber,
                    email: formData.email,
                    phone: formData.phone,
                    amount: Number(formData.amount),
                    preferred_language: formData.preferredLanguage,
                    created_at: new Date().toISOString()
                };
                
                if (residentId) {
                    const index = currentMock.findIndex(r => r.id === residentId);
                    if (index > -1) currentMock[index] = newResident;
                } else {
                    currentMock.push(newResident);
                }
                localStorage.setItem('mockResidents', JSON.stringify(currentMock));

                setTimeout(() => {
                    setIsSaving(false);
                    alert(residentId ? "Resident updated successfully (Mock Mode)!" : "Resident saved successfully (Mock Mode)!");
                    navigate('/admin');
                }, 800);
                return;
            }

            // Edit Existing Resident Flow
            if (residentId) {
                const { error: updateErr } = await supabase
                    .from("residents")
                    .update({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        amount: Number(formData.amount),
                        preferred_language: formData.preferredLanguage
                    })
                    .eq("id", residentId);

                if (updateErr) throw updateErr;

                setIsSaving(false);
                alert("Resident updated successfully");
                navigate('/admin');
                return;
            }

            // Add New Resident Flow
            // Check if resident exists with same flat number
            const { data: existingResident } = await supabase
                .from("residents")
                .select("*")
                .eq("flat_no", formData.flatNumber)
                .single();

            if (existingResident) {
                // Update existing resident (fallback collision handling)
                const { error: updateErr } = await supabase
                    .from("residents")
                    .update({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        amount: Number(formData.amount),
                        preferred_language: formData.preferredLanguage
                    })
                    .eq("flat_no", formData.flatNumber);

                if (updateErr) throw updateErr;
                setIsSaving(false);
                alert("This flat number already exists. Resident details updated.");
                navigate('/admin');
            } else {
                // Insert New Resident Normally
                const { data: newRes, error: resErr } = await supabase
                    .from('residents')
                    .insert([{
                        name: formData.name,
                        flat_no: formData.flatNumber,
                        email: formData.email,
                        phone: formData.phone,
                        amount: Number(formData.amount),
                        preferred_language: formData.preferredLanguage
                    }])
                    .select()
                    .single();

                if (resErr) throw resErr;

                // Add initial pending payment for current month
                const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
                const { error: payErr } = await supabase
                    .from('payments')
                    .insert([{
                        resident_id: newRes.id,
                        month: currentMonth,
                        amount: Number(formData.amount),
                        status: 'Pending'
                    }]);

                if (payErr) console.error("Initial payment creation failed:", payErr);

                setIsSaving(false);
                alert('Resident saved successfully!');
                navigate('/admin');
            }
        } catch (err) {
            setIsSaving(false);
            console.error("Error saving data:", err);
            alert(`Error saving data: ${err.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this resident and all their payment records?")) return;
        try {
            // Delete all payments first
            await supabase.from("payments").delete().eq("resident_id", residentId);
            // Delete resident
            await supabase.from("residents").delete().eq("id", residentId);

            alert("Resident and all associated payments deleted successfully.");
            navigate('/admin');
        } catch (err) {
            console.error(err);
            alert("Failed to delete resident.");
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-app text-primary font-sans relative selection:bg-[#DC2626]/30 overflow-hidden">
            {/* Top Navigation Bar */}
            <nav className="flex items-center justify-between px-6 lg:px-10 py-5 bg-app/80 border-b border-border shadow-sm sticky top-0 z-40 backdrop-blur-xl transition-all relative">
                <div className="flex items-center gap-4 text-white">
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-lg bg-solid border border-border flex items-center justify-center hover:bg-white/5 transition shadow-sm text-secondary hover:text-primary"
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <h2 className="text-lg font-bold tracking-tight text-primary">Dashboard Overview</h2>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10 w-full">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="glass-panel border border-border rounded-2xl shadow-xl overflow-hidden bg-panel"
                >
                    {/* Header Section */}
                    <div className="p-6 md:p-8 lg:p-12 border-b border-border relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">{residentId ? 'Edit Resident Profile' : 'Add New Resident'}</h1>
                            </div>
                        </div>
                        <p className="text-secondary font-medium md:max-w-xl">
                            {residentId
                                ? 'Update the details and maintenance configuration for this resident.'
                                : 'Register a new apartment resident and assign their monthly maintenance amount.'}
                        </p>
                    </div>

                    {/* Form Constraints Section */}
                    <div className="p-6 md:p-8 lg:p-12 bg-app/50">
                        <form id="residentForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-6 lg:gap-y-8">

                            {/* Left Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="text" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="E.g. Sahil Gaikwad"
                                        className="w-full h-11 pl-10 pr-4 bg-solid border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="email" required
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="resident@example.com"
                                        className="w-full h-11 pl-10 pr-4 bg-solid border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </motion.div>

                            {/* Left Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">Flat Number</label>
                                <div className="relative group">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="text" required
                                        readOnly={!!residentId}
                                        value={formData.flatNumber} onChange={e => setFormData({ ...formData, flatNumber: e.target.value })}
                                        placeholder="E.g. A-101"
                                        className={`w-full h-11 pl-10 pr-4 bg-solid border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all text-sm uppercase shadow-inner ${residentId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">Maintenance Amount Due (₹)</label>
                                <div className="relative group">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="number" required min="1"
                                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="2500"
                                        className="w-full h-11 pl-10 pr-4 bg-solid border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all text-sm font-semibold shadow-inner"
                                    />
                                </div>
                            </motion.div>

                            {/* Left Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">WhatsApp Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="tel" required
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                        className="w-full h-11 pl-10 pr-4 bg-solid border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-secondary">Preferred Language</label>
                                <div className="relative group">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#D4AF37] transition-colors z-10" size={18} />
                                    <select
                                        value={formData.preferredLanguage} onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                        className="w-full h-11 pl-10 pr-8 bg-solid border border-border rounded-lg text-primary text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all appearance-none cursor-pointer shadow-inner relative"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">हिंदी</option>
                                        <option value="ta">தமிழ்</option>
                                        <option value="mr">मराठी</option>
                                    </select>
                                    {/* Custom Dropdown Arrow */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
                                </div>
                            </motion.div>

                        </form>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-6 md:p-8 lg:px-12 lg:py-6 border-t border-border bg-panel flex flex-col md:flex-row items-center gap-4 mt-auto">
                        {residentId && (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                type="button" onClick={handleDelete}
                                className="w-full md:w-auto px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={16} /> Delete Profile
                            </motion.button>
                        )}

                        <div className="flex-1 w-full flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                form="residentForm" type="submit" disabled={isSaving}
                                className="w-full md:w-auto px-8 py-3 bg-[#DC2626] text-white rounded-lg text-sm font-semibold hover:bg-[#b91c1c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-[#b91c1c]"
                            >
                                {isSaving ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <Save size={16} /> {residentId ? "Update Resident" : "Save Resident"}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
};

export default Detail;
