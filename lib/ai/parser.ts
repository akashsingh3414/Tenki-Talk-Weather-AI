export function extractJSON(text: string): any | null {
    try {
        return JSON.parse(text.trim());
    } catch { /* continue */ }

    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
    }

    const start = text.indexOf('{');
    if (start === -1) {
        console.warn("[parser] No JSON object found in response:", text.slice(0, 300));
        return null;
    }

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) {
                try {
                    return JSON.parse(text.slice(start, i + 1));
                } catch (e) {
                    console.error("[parser] Balanced extraction parse failed:", e);
                    return null;
                }
            }
        }
    }

    console.warn("[parser] Could not find balanced JSON in response:", text.slice(0, 300));
    return null;
}

export const FALLBACK_PLAN = {
    explanation: "I encountered a technical issue while generating your plan. Please try again with a different city or query.",
    places: [],
    closing: "Safe travels!"
};
