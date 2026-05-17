const cron = require('node-cron');
const supabase = require('../supabaseClient');
const { sendPaymentEmail } = require('./mailer');

const start = () => {
    // Run on the 1st of every month at 00:00 (midnight)
    cron.schedule('0 0 1 * *', async () => {
        console.log('--- CRON JOB: Generating Monthly Payments ---');
        try {
            const { data: residents, error: residentsError } = await supabase
                .from('residents')
                .select('*');

            if (residentsError) throw residentsError;

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            for (const resident of residents) {
                // Check if payment already generated
                const { data: existingPayment, error: checkError } = await supabase
                    .from('payments')
                    .select('id')
                    .eq('resident_id', resident.id)
                    .eq('month', currentMonth)
                    .single();

                // PGRST116 means no rows returned, which is what we want!
                if (checkError && checkError.code !== 'PGRST116') {
                    console.error(`Error checking payment for ${resident.name}:`, checkError);
                    continue;
                }

                if (!existingPayment) {
                    const { data: newPayment, error: insertError } = await supabase
                        .from('payments')
                        .insert([{
                            resident_id: resident.id,
                            month: currentMonth,
                            amount: resident.amount,
                            status: 'Pending'
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error(`Error inserting payment for ${resident.name}:`, insertError);
                        continue;
                    }

                    // Send Email
                    await sendPaymentEmail(resident, newPayment);
                    console.log(`Payment generated for resident: ${resident.name}`);
                }
            }
            console.log('--- CRON JOB COMPLETED ---');
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = { start };
