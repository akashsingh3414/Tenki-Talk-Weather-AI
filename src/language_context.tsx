import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import { BrowserAI } from "./translation_utils";
import { i18n, type Language } from "./i18n";


interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    dictionary: any;
    isTranslating: boolean;
    resetTrigger: number;
    triggerReset: () => void;
    translate: (text: string, target?: Language) => Promise<string>;
    translateObject: (obj: any, targetTag: string, translator?: any) => Promise<any>;
    prepareTranslator: (target: Language) => Promise<void>;
    isAutoDetectEnabled: boolean;
    setIsAutoDetectEnabled: (enabled: boolean) => void;
    availability: { detector: string; translator: string };
    checkAvailability: () => Promise<void>;
}

export const LanguageContext = createContext<LanguageContextProps>({
    language: "en-US",
    setLanguage: () => { },
    dictionary: i18n["en-US"],
    isTranslating: false,
    resetTrigger: 0,
    triggerReset: () => { },
    translate: async (text) => text,
    translateObject: async (obj) => obj,
    prepareTranslator: async () => { },
    isAutoDetectEnabled: true,
    setIsAutoDetectEnabled: () => { },
    availability: { detector: "unavailable", translator: "unavailable" },
    checkAvailability: async () => { }
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en-US");
    const [resetTrigger, setResetTrigger] = useState(0);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);
    const [dynamicI18n, setDynamicI18n] = useState<any>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [availability, setAvailability] = useState({ detector: "unavailable", translator: "unavailable" });

    const currentLangCode = useMemo(() => {
        const map: { [key: string]: string } = { "ja-JP": "ja", "en-US": "en", "hi-IN": "hi" };
        return map[language] || language.split("-")[0];
    }, [language]);

    const triggerReset = useCallback(() => {
        setResetTrigger(prev => prev + 1);
    }, []);

    const prepareTranslator = useCallback(async (target: Language) => {
        const targetTag = target.includes("-") ? target.split("-")[0] : target;
        await BrowserAI.createTranslator("en", targetTag, true);
    }, []);

    const translate = useCallback(async (text: string, target?: Language) => {
        const targetLang = target || language;
        const targetTag = targetLang.includes("-") ? targetLang.split("-")[0] : targetLang;

        const detectedSource = await BrowserAI.detectLanguage(text);
        if (!detectedSource || detectedSource === targetTag) return text;

        const translator = await BrowserAI.createTranslator(detectedSource, targetTag);
        if (!translator) return text;

        try {
            const result = await translator.translate(text);
            translator.destroy();
            return result;
        } catch (e) {
            console.error("Translation error:", e);
            return text;
        }
    }, [language]);

    const translateObject = useCallback(async (obj: any, targetTag: string, translator?: any): Promise<any> => {
        if (typeof obj === "string") {
            let activeTranslator = translator;
            let localTranslatorCreated = false;

            if (!activeTranslator) {
                const detectedSource = await BrowserAI.detectLanguage(obj);
                if (detectedSource === targetTag) return obj;

                activeTranslator = await BrowserAI.createTranslator(detectedSource || "en", targetTag);
                localTranslatorCreated = true;
            }

            if (!activeTranslator) return obj;

            try {
                const result = await activeTranslator.translate(obj);
                if (localTranslatorCreated) activeTranslator.destroy();
                return result;
            } catch {
                if (localTranslatorCreated) activeTranslator.destroy();
                return obj;
            }
        }
        if (Array.isArray(obj)) {
            const results = [];
            for (const item of obj) {
                results.push(await translateObject(item, targetTag, translator));
            }
            return results;
        }
        if (typeof obj === "object" && obj !== null) {
            const result: any = {};
            for (const key in obj) {
                result[key] = await translateObject(obj[key], targetTag, translator);
            }
            return result;
        }
        return obj;
    }, []);

    useEffect(() => {
        const updateDictionary = async () => {
            if (language === "ja-JP" || language === "en-US" || language === "hi-IN") {
                setDynamicI18n(null);
                return;
            }

            const targetTag = language.includes("-") ? language.split("-")[0] : language;

            const translatorAvailability = await BrowserAI.getTranslatorAvailability("en", targetTag);
            if (translatorAvailability === "downloadable" || translatorAvailability === "downloading") {
                console.log("[LanguageContext] Dictionary translation requires user gesture. Falling back to English.");
                setIsTranslating(false);
                return;
            }

            setIsTranslating(true);
            try {
                const translator = await BrowserAI.createTranslator("en", targetTag);
                if (!translator) {
                    setIsTranslating(false);
                    return;
                }
                const translated = await translateObject(i18n["en-US"], targetTag, translator);
                if (translator) translator.destroy();
                setDynamicI18n(translated);
            } catch (e) {
                console.error("Full page translation failed", e);
            } finally {
                setIsTranslating(false);
            }
        };

        updateDictionary();
    }, [language, translateObject]);

    const dictionary = useMemo(() => {
        if (language === "ja-JP" || language === "en-US" || language === "hi-IN") {
            return i18n[language as keyof typeof i18n];
        }
        return dynamicI18n || i18n["en-US"];
    }, [language, dynamicI18n]);

    const checkAvailability = useCallback(async () => {
        const d = await BrowserAI.getDetectorAvailability();
        const targetTag = language.includes("-") ? language.split("-")[0] : language;
        const t = await BrowserAI.getTranslatorAvailability("en", targetTag);
        setAvailability({ detector: d, translator: t });
    }, [language]);

    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            dictionary,
            isTranslating,
            resetTrigger,
            triggerReset,
            translate,
            translateObject,
            prepareTranslator,
            isAutoDetectEnabled,
            setIsAutoDetectEnabled,
            availability,
            checkAvailability
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
