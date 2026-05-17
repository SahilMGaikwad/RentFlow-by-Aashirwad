const supabase = require('../supabaseClient');

exports.getStats = async (req, res) => {
    try {
        // Get total residents (using count)
        const { count: totalResidents, error: residentError } = await supabase
            .from('residents')
            .select('*', { count: 'exact', head: true });

        if (residentError) throw residentError;

        // Get payments to calculate totals
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, status');

        if (paymentsError) throw paymentsError;

        let totalCollected = 0;
        let pendingPaymentsCount = 0;
        let totalPendingAmount = 0;

        payments.forEach(payment => {
            if (payment.status === 'Paid') {
                totalCollected += payment.amount;
            } else {
                pendingPaymentsCount += 1;
                totalPendingAmount += payment.amount;
            }
        });

        res.json({
            totalResidents: totalResidents || 0,
            totalCollected,
            pendingPaymentsCount,
            totalPendingAmount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
