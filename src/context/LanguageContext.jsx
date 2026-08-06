import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('mangalam_lang') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('mangalam_lang', lang);
    }, [lang]);

    const toggleLanguage = () => {
        setLang(prev => (prev === 'en' ? 'ta' : 'en'));
    };

    const t = (key) => {
        if (translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        return translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
