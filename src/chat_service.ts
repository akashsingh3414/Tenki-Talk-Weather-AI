import { Message } from "./types";

export const chatService = {
    async saveMessage(_userId: string, _message: Message): Promise<void> { },
    async getMessages(_userId: string): Promise<Message[]> { return []; },
};
