import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const dashboardService = {
    getStats: async () => {
        const res = await axios.get(`${API_BASE}/dashboard/stats`);
        return res.data;
    }
};

export const paymentService = {
    getPayments: async () => {
        const res = await axios.get(`${API_BASE}/payments`);
        return res.data;
    },
    markAsPaid: async (id) => {
        const res = await axios.put(`${API_BASE}/payments/${id}/paid`);
        return res.data;
    },
    sendReminder: async (id) => {
        const res = await axios.post(`${API_BASE}/payments/${id}/remind`);
        return res.data;
    }
};

export const residentService = {
    addResident: async (residentData) => {
        const res = await axios.post(`${API_BASE}/residents`, residentData);
        return res.data;
    },
    getResidents: async () => {
        const res = await axios.get(`${API_BASE}/residents`);
        return res.data;
    },
    updateResident: async (id, updateData) => {
        const res = await axios.put(`${API_BASE}/residents/${id}`, updateData);
        return res.data;
    },
    deleteResident: async (id) => {
        const res = await axios.delete(`${API_BASE}/residents/${id}`);
        return res.data;
    }
};
