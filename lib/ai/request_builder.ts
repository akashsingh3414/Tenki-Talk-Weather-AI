import { type ModelMessage } from "ai";

interface HistoryEntry {
    role: string;
    content: string;
}

export function buildMessages(
    systemPrompt: string,
    history: HistoryEntry[] = [],
    userMessage: string
): ModelMessage[] {
    return [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
        { role: "user", content: userMessage || "Give me travel plans" },
    ];
}
