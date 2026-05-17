import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (payment, resident) => {
    const doc = new jsPDF();
    const invoiceId = payment.id.substring(0, 8).toUpperCase();
    const dateStr = payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString()
        : new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(67, 56, 202); // Primary Blue
    doc.text("Apartment Maintenance Receipt", 105, 20, { align: "center" });

    // Details section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);

    doc.text(`Resident Name: ${resident.name}`, 20, 40);
    doc.text(`Flat Number: ${resident.flat_no}`, 20, 50);
    doc.text(`Month: ${payment.month}`, 20, 60);
    doc.text(`Amount Paid: Rs. ${payment.amount}`, 20, 70);
    doc.text(`Payment Date: ${dateStr}`, 20, 80);
    doc.text(`UPI Transaction Ref: ${payment.upi_ref || 'N/A'}`, 20, 90);

    doc.save(`receipt-${resident.flat_no}.pdf`);
};

export const getWhatsAppUrl = (phone, text) => {
    if (!phone) return null;
    // Strip non-numeric
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};
