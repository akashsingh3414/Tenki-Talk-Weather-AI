import React, { createContext, useState, ReactNode, useCallback } from "react";

export type Language = "ja-JP" | "en-US" | "hi-IN";

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    resetTrigger: number;
    triggerReset: () => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
    language: "ja-JP",
    setLanguage: () => { },
    resetTrigger: 0,
    triggerReset: () => { }
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>("ja-JP");
    const [resetTrigger, setResetTrigger] = useState(0);

    const triggerReset = useCallback(() => {
        setResetTrigger(prev => prev + 1);
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, resetTrigger, triggerReset }}>
            {children}
        </LanguageContext.Provider>
    );
};
