const supabase = require('../supabaseClient');

exports.createResident = async (req, res) => {
    try {
        const { name, flatNumber, email, phone, amount, preferredLanguage } = req.body;

        const { data, error } = await supabase
            .from('residents')
            .insert([
                {
                    name,
                    flat_no: flatNumber,
                    email,
                    phone,
                    amount,
                    preferred_language: preferredLanguage
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'Flat number already exists' });
        res.status(500).json({ error: err.message });
    }
};

exports.getResidents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('residents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateResident = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, flatNumber, email, phone, amount, preferredLanguage } = req.body;

        // Map camelCase explicitly to snake_case if payload contains camel
        const updatePayload = {};
        if (name) updatePayload.name = name;
        if (flatNumber) updatePayload.flat_no = flatNumber;
        if (email) updatePayload.email = email;
        if (phone) updatePayload.phone = phone;
        if (amount) updatePayload.amount = amount;
        if (preferredLanguage) updatePayload.preferred_language = preferredLanguage;

        const { data, error } = await supabase
            .from('residents')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteResident = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('residents')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Resident deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
