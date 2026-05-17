require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cronJob = require('./utils/cron');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const residentRoutes = require('./routes/resident.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/residents', residentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start Cron Job for generating payments on the 1st of every month
cronJob.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
