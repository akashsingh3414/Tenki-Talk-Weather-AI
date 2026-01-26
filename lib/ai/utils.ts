export function cleanAIJson<T>(text: string): T {
    try {
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const startBracket = cleanText.indexOf('[');
        const startBrace = cleanText.indexOf('{');

        let start = -1;
        let end = -1;

        if (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) {
            start = startBracket;
            end = cleanText.lastIndexOf(']');
        } else if (startBrace !== -1) {
            start = startBrace;
            end = cleanText.lastIndexOf('}');
        }

        if (start !== -1 && end !== -1 && end > start) {
            const jsonStr = cleanText.substring(start, end + 1);
            return JSON.parse(jsonStr) as T;
        }

        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("Failed to parse AI JSON:", text, e);
        throw e;
    }
}
