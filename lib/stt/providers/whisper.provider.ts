import { HuggingFaceSTTProvider } from "./hf_base.provider";

export class WhisperSTTProvider extends HuggingFaceSTTProvider {
    constructor() {
        super("openai/whisper-large-v3");
    }

    getName(): string {
        return "Whisper Large V3 (Global)";
    }
}
