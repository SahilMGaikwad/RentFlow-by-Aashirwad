const nodemailer = require('nodemailer');

// Setup your transporter (Use environment variables in production)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another service like sendgrid
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password',
    },
});

const getEmailTemplate = (language, residentName, amount, month, flatNo) => {
    const fn = (flatNo || "").replace(/\s+/g, '');
    const upiLink = `upi://pay?pa=sneham271987@oksbi&pn=ApartmentMaintenance&am=${amount}&tn=Maintenance ${fn}_${month}&cu=INR`;

    const templates = {
        en: {
            subject: 'Apartment Maintenance Payment Due',
            text: `Dear ${residentName},\n\nYour apartment maintenance payment of ₹${amount} for ${month} is generated and currently pending.\n\nPlease pay at your earliest convenience using this UPI Link:\n${upiLink}\n\nThank you,\nAdmin`,
        },
        hi: {
            subject: 'अपार्टमेंट मेंटेनेंस भुगतान देय है',
            text: `प्रिय ${residentName},\n\n${month} के लिए आपका ₹${amount} का अपार्टमेंट मेंटेनेंस भुगतान उत्पन्न हो गया है और वर्तमान में लंबित है।\n\nकृपया अपनी सुविधानुसार जल्द से जल्द इस UPI लिंक का उपयोग करके भुगतान करें:\n${upiLink}\n\nधन्यवाद,\nएडमिन`,
        },
        ta: {
            subject: 'அடுக்குமாடி பராமரிப்பு கட்டணம் நிலுவையில் உள்ளது',
            text: `அன்புள்ள ${residentName},\n\n${month} மாதத்திற்கான உங்கள் அடுக்குமாடி பராமரிப்பு கட்டணம் ₹${amount} உருவாக்கப்பட்டுள்ளது மற்றும் தற்போது நிலுவையில் உள்ளது.\n\nதயவுசெய்து இந்த UPI இணைப்பைப் பயன்படுத்தி விரைவில் செலுத்தவும்:\n${upiLink}\n\nநன்றி,\nநிர்வாகி`,
        },
        mr: {
            subject: 'अपार्टमेंट देखभाल पेमेंट बाकी आहे',
            text: `प्रिय ${residentName},\n\n${month} साठी तुमचे ₹${amount} चे अपार्टमेंट देखभाल पेमेंट तयार झाले आहे आणि सध्या प्रलंबित आहे.\n\nकृपया या UPI लिंकचा वापर करून लवकरात लवकर पेमेंट करा:\n${upiLink}\n\nधन्यवाद,\nअॅडमिन`,
        }
    };

    return templates[language] || templates['en'];
};

const sendPaymentEmail = async (resident, payment) => {
    try {
        const template = getEmailTemplate(
            resident.preferredLanguage || resident.preferred_language,
            resident.name,
            payment.amount,
            payment.month,
            resident.flat_no
        );

        const mailOptions = {
            from: `"Apartment Admin" <${process.env.EMAIL_USER}>`,
            to: resident.email,
            subject: template.subject,
            text: template.text,
        };

        // If no real credentials, log the simulated email
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log(`\n[SIMULATED EMAIL TO: ${resident.email}]`);
            console.log(`Subject: ${template.subject}`);
            console.log(`Body:\n${template.text}\n`);
            return { success: true, simulated: true };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, simulated: false };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

module.exports = { sendPaymentEmail };
