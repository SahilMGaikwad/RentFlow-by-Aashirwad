import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const QRPayment = ({ selectedPayment, onCancel, onConfirmPaid }) => {
    const [copied, setCopied] = useState(false);

    if (!selectedPayment) return null;

    const upiId = "sneham271987@oksbi";
    const upiUrl = `upi://pay?pa=${upiId}&pn=ApartmentMaintenance&am=${selectedPayment.amount}&cu=INR`;

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="glass-panel rounded-2xl w-full max-w-sm p-8 text-center shadow-xl border border-[#27272a]"
            >
                <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">Scan & Pay</h3>
                <p className="text-secondary text-sm font-medium mb-6">UPI Payment for {selectedPayment.residentId?.name}</p>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="bg-white p-4 rounded-xl inline-block mb-6 shadow-sm relative"
                >
                    {/* QR Code Container */}

                    <QRCodeSVG
                        value={upiUrl}
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </motion.div>

                <div className="bg-solid/50 border border-border p-4 rounded-lg mb-4 flex items-center justify-between">
                    <span className="text-secondary text-sm font-semibold">UPI ID: <span className="text-primary font-mono ml-1">{upiId}</span></span>
                    <button
                        onClick={handleCopy}
                        className="text-[#D4AF37] hover:text-yellow-300 p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>

                <div className="flex justify-between items-center bg-solid border border-border p-4 rounded-lg mb-8">
                    <span className="text-sm font-semibold text-secondary">Amount Due</span>
                    <span className="text-2xl font-bold text-white">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-solid border border-border text-secondary rounded-lg text-sm font-semibold hover:bg-white/5 hover:text-primary transition-all"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onConfirmPaid(selectedPayment)}
                        className="flex-[2] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} /> Confirm Paid
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default QRPayment;
