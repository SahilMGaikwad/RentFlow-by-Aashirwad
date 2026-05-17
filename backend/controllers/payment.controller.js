const supabase = require('../supabaseClient');
const { sendPaymentEmail } = require('../utils/mailer');

exports.getPayments = async (req, res) => {
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
          preferred_language
        )
      `)
            .order('generated_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;

        // Update the payment
        const { data: updatedPayment, error: updateError } = await supabase
            .from('payments')
            .update({ status: 'Paid', paid_at: new Date(), payment_date: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;
        if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });

        // Fetch resident manually to attach (mimicking Mongoose populate)
        const { data: resident, error: residentError } = await supabase
            .from('residents')
            .select('id, name, flat_no, email, preferred_language')
            .eq('id', updatedPayment.resident_id)
            .single();

        if (residentError && residentError.code !== 'PGRST116') throw residentError;
        updatedPayment.residentId = resident || null;

        res.json(updatedPayment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendReminder = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();

        if (paymentError || !payment) return res.status(404).json({ message: 'Payment not found' });
        if (payment.status === 'Paid') return res.status(400).json({ message: 'Payment already paid' });

        const { data: resident, error: residentError } = await supabase
            .from('residents')
            .select('*')
            .eq('id', payment.resident_id)
            .single();

        if (residentError || !resident) return res.status(404).json({ message: 'Resident not found' });

        const emailResult = await sendPaymentEmail(resident, payment);
        if (!emailResult.success) throw emailResult.error;

        res.json({ message: 'Reminder sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
