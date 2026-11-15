export async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onloadend = async () => {
            try {
                const audioCTX = new AudioContext({ sampleRate: 16000 });
                const arrayBuffer = fileReader.result as ArrayBuffer;
                const decoded = await audioCTX.decodeAudioData(arrayBuffer);
                resolve(decoded);
            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(blob);
    });
}
