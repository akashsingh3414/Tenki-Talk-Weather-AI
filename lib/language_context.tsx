import React, { createContext, useState, ReactNode } from "react";

export type Language = "ja-JP" | "en-US" | "hi-IN";

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
    language: "ja-JP",
    setLanguage: () => { }
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>("ja-JP");
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
