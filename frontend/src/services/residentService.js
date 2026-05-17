import { supabase } from '../supabaseClient';

export const residentService = {
    getStats: async () => {
        const isMockMode = localStorage.getItem('adminUser') !== null;
        if (isMockMode) {
            const mockData = JSON.parse(localStorage.getItem('mockResidents') || '[]');
            return { totalResidents: mockData.length };
        }

        // Get total residents count
        const { count: totalResidents, error: resErr } = await supabase
            .from('residents')
            .select('*', { count: 'exact', head: true });
        if (resErr) throw resErr;

        return { totalResidents: totalResidents || 0 };
    },

    addResident: async (residentData) => {
        const { data, error } = await supabase
            .from('residents')
            .insert([residentData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteResident: async (residentId) => {
        // 1. Delete all related payment records first
        const { error: payErr } = await supabase
            .from('payments')
            .delete()
            .eq('resident_id', residentId);

        if (payErr) throw payErr;

        // 2. Delete the resident
        const { error: resErr } = await supabase
            .from('residents')
            .delete()
            .eq('id', residentId);

        if (resErr) throw resErr;
    }
};
