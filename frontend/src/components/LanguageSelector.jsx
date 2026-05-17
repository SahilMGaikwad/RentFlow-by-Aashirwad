import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '20px' }}>
            <Globe size={16} color="var(--text-muted)" />
            <select
                value={i18n.language}
                onChange={handleLanguageChange}
                style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)', cursor: 'pointer' }}
            >
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="mr">मराठी (MR)</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
