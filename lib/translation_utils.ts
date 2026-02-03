/**
 * Experimental Browser AI APIs Type Definitions
 * These are not yet in the standard lib.dom.d.ts
 */

export interface LanguageDetector {
    detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
    destroy(): void;
}

export interface Translator {
    translate(text: string): Promise<string>;
    translateStreaming(text: string): ReadableStream<string>;
    destroy(): void;
}

export type Availability = "available" | "downloadable" | "downloading" | "unavailable";

export interface AIModelManager {
    availability(options?: any): Promise<Availability>;
    create(options?: any): Promise<any>;
}

declare global {
    interface Window {
        translation?: {
            canDetect(options?: any): Promise<Availability>;
            createDetector(options?: any): Promise<LanguageDetector>;
            canTranslate(options: { sourceLanguage: string; targetLanguage: string }): Promise<Availability>;
            createTranslator(options: { sourceLanguage: string; targetLanguage: string }): Promise<Translator>;
        };
        LanguageDetector?: AIModelManager;
        Translator?: AIModelManager;
    }
}

/**
 * Utility to check and interface with Browser AI APIs
 */
export const BrowserAI = {
    async getDetectorAvailability(): Promise<Availability> {
        if (typeof window === "undefined") return "unavailable";

        if (window.LanguageDetector) {
            try {
                return await window.LanguageDetector.availability();
            } catch (e) {
                console.warn("LanguageDetector.availability() failed", e);
            }
        }

        if (window.translation?.canDetect) {
            return await window.translation.canDetect();
        }

        return "unavailable";
    },

    async getTranslatorAvailability(source: string, target: string): Promise<Availability> {
        if (typeof window === "undefined") return "unavailable";

        if (window.Translator) {
            try {
                return await window.Translator.availability({ sourceLanguage: source, targetLanguage: target });
            } catch (e) {
                console.warn("Translator.availability() failed", e);
            }
        }

        if (window.translation?.canTranslate) {
            return await window.translation.canTranslate({ sourceLanguage: source, targetLanguage: target });
        }

        return "unavailable";
    },

    async createDetector(forceGesture = false): Promise<LanguageDetector | null> {
        const availability = await this.getDetectorAvailability();
        if (availability === "unavailable") return null;
        if ((availability === "downloadable" || availability === "downloading") && !forceGesture) {
            console.warn("LanguageDetector requires user gesture for download/init. Skipping automatic call.");
            return null;
        }

        try {
            if (window.LanguageDetector) {
                return await (window.LanguageDetector as any).create();
            }
            if (window.translation?.createDetector) {
                return await window.translation.createDetector();
            }
        } catch (e) {
            console.error("Failed to create LanguageDetector", e);
        }
        return null;
    },

    async createTranslator(source: string, target: string, forceGesture = false): Promise<Translator | null> {
        const availability = await this.getTranslatorAvailability(source, target);
        if (availability === "unavailable") return null;
        if ((availability === "downloadable" || availability === "downloading") && !forceGesture) {
            console.warn("Translator requires user gesture for download/init. Skipping automatic call.");
            return null;
        }

        try {
            if (window.Translator) {
                return await (window.Translator as any).create({ sourceLanguage: source, targetLanguage: target });
            }
            if (window.translation?.createTranslator) {
                return await window.translation.createTranslator({ sourceLanguage: source, targetLanguage: target });
            }
        } catch (e) {
            console.error("Failed to create Translator", e);
        }
        return null;
    },

    /**
     * Detects language and returns the BCP 47 tag
     */
    async detectLanguage(text: string): Promise<string | null> {
        const detector = await this.createDetector();
        if (!detector) return null;

        try {
            const results = await detector.detect(text);
            detector.destroy();
            if (results && results.length > 0) {
                // Return top result if confidence is reasonable
                const top = results[0];
                if (top.confidence > 0.5 && top.detectedLanguage !== "und") {
                    return top.detectedLanguage;
                }
            }
        } catch (e) {
            console.error("Language detection failed", e);
        }
        return null;
    }
};
