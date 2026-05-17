import { supabase } from '../supabaseClient';

export const paymentService = {
    getRecentPayments: async () => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    residentId:resident_id (
                        id,
                        name,
                        flat_no,
                        email,
                        phone,
                        preferred_language
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log("Fetched Recent 5 Payments successfully:", data);
            return data || [];
        } catch (err) {
            console.error("Supabase error (getRecentPayments):", err);
            return [];
        }
    },

    getDashboardStats: async () => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('amount, status, month');

            if (error) throw error;

            let totalPendingAmount = 0;
            let totalCollected = 0;
            let pendingPaymentsCount = 0;
            let awaitingVerificationCount = 0;
            const monthlyTotalsMap = {};

            data.forEach(p => {
                if (p.status === 'Pending') {
                    totalPendingAmount += p.amount;
                    pendingPaymentsCount++;
                } else if (p.status === 'Verification Pending') {
                    totalPendingAmount += p.amount;
                    awaitingVerificationCount++;
                } else if (p.status === 'Paid') {
                    totalCollected += p.amount;
                    const mo = p.month.substring(0, 3);
                    if (!monthlyTotalsMap[mo]) monthlyTotalsMap[mo] = { month: mo, revenue: 0 };
                    monthlyTotalsMap[mo].revenue += p.amount;
                }
            });

            console.log("Dashboard Payment stats securely aggregated.");

            return {
                totalPendingAmount,
                totalCollected,
                pendingPaymentsCount,
                awaitingVerificationCount,
                revenueData: Object.values(monthlyTotalsMap)
            };
        } catch (err) {
            console.error("Supabase error (getDashboardStats):", err);
            return {
                totalPendingAmount: 0,
                totalCollected: 0,
                pendingPaymentsCount: 0,
                awaitingVerificationCount: 0,
                revenueData: []
            };
        }
    },

    markAsPaid: async (paymentId) => {
        const { error } = await supabase
            .from('payments')
            .update({ status: 'Paid', payment_date: new Date().toISOString() })
            .eq('id', paymentId);
        if (error) throw error;
    },

    deletePayment: async (paymentId) => {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId);
        if (error) throw error;
    },

    updateAmount: async (paymentId, newAmount) => {
        const { error } = await supabase
            .from('payments')
            .update({ amount: newAmount })
            .eq('id', paymentId);
        if (error) throw error;
    },

    getPendingPaymentByFlat: async (flat_no) => {
        // Find resident
        const { data: residentData, error: resErr } = await supabase
            .from('residents')
            .select('id')
            .eq('flat_no', flat_no)
            .single();

        if (resErr || !residentData) return null;

        // Find pending or verification pending payment
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                residentId:resident_id (
                    id,
                    name,
                    flat_no
                )
            `)
            .eq('resident_id', residentData.id)
            .in('status', ['Pending', 'Verification Pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data;
    },

    markAsVerificationPending: async (paymentId) => {
        const { error } = await supabase
            .from('payments')
            .update({ status: 'Verification Pending' })
            .eq('id', paymentId);
        if (error) throw error;
    },

    getPaymentHistoryByResident: async (residentId) => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('resident_id', residentId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Supabase error (getPaymentHistoryByResident):", err);
            return [];
        }
    },

    generateMonthlyPayments: async () => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        // Fetch all residents
        const { data: residents, error: resErr } = await supabase
            .from('residents')
            .select('id, amount');

        if (resErr) throw resErr;

        if (!residents || residents.length === 0) return;

        // Check if payments for current month already exist
        const { data: existingPayments, error: payErr } = await supabase
            .from('payments')
            .select('resident_id')
            .eq('month', currentMonth);

        if (payErr) throw payErr;

        const existingIds = new Set(existingPayments.map(p => p.resident_id));

        const newPayments = residents
            .filter(r => !existingIds.has(r.id))
            .map(r => ({
                resident_id: r.id,
                month: currentMonth,
                amount: r.amount,
                status: 'Pending'
            }));

        if (newPayments.length > 0) {
            const { error } = await supabase
                .from('payments')
                .insert(newPayments);
            if (error) throw error;
        }
    }
};
