/**
 * Transcribe audio using Deepgram API
 * Note: Deepgram API key should be set in environment variables
 */

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "f15a08a21d03dfdb24a3ee8360ef0eeb79ffa921";
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

export async function transcribeAudioWithDeepgram(
  audioData: Buffer | Uint8Array | ArrayBuffer,
  language: string = "ja"
): Promise<string | null> {
  try {
    if (!DEEPGRAM_API_KEY) {
      console.error("[DEEPGRAM ERROR] API key not found in environment variables");
      console.error("[DEEPGRAM ERROR] Please set DEEPGRAM_API_KEY environment variable");
      return null;
    }

    // Calculate audio data size
    let audioLength = 0;
    if (Buffer.isBuffer(audioData)) {
      audioLength = audioData.length;
    } else if (audioData instanceof Uint8Array) {
      audioLength = audioData.length;
    } else if (audioData instanceof ArrayBuffer) {
      audioLength = audioData.byteLength;
    } else {
      audioLength = (audioData as any).length || 0;
    }

    console.log(`[DEEPGRAM] Audio data size: ${audioLength} bytes`);
    
    // Minimum audio size: 100 bytes (very short audio)
    if (audioLength < 100) {
      console.warn(
        `[DEEPGRAM WARNING] Audio data too small: ${audioLength} bytes`
      );
      return null;
    }

    // Convert to Buffer if needed
    let bodyData: Buffer;
    if (Buffer.isBuffer(audioData)) {
      bodyData = audioData;
    } else if (audioData instanceof Uint8Array) {
      bodyData = Buffer.from(audioData);
    } else if (audioData instanceof ArrayBuffer) {
      bodyData = Buffer.from(audioData);
    } else {
      bodyData = Buffer.from(audioData as any);
    }

    console.log(`[DEEPGRAM] Final buffer size: ${bodyData.length} bytes`);

    const headers = {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm",
    };

    const params = new URLSearchParams({
      model: "nova-2",
      smart_format: "true",
      language: language,
      punctuate: "true",
      diarize: "false",
    });

    console.log("[DEEPGRAM] Making API request...");
    console.log(`[DEEPGRAM] URL: ${DEEPGRAM_URL}?${params.toString()}`);

    const response = await fetch(`${DEEPGRAM_URL}?${params.toString()}`, {
      method: "POST",
      headers,
      body: bodyData as any,
    });

    console.log(`[DEEPGRAM] Response status: ${response.status}`);

    if (response.status === 200) {
      const result = await response.json();
      console.log("[DEEPGRAM] Response received successfully");
      console.log("[DEEPGRAM] Response:", JSON.stringify(result).substring(0, 200));

      // Extract transcript with better error handling
      try {
        const channels = result.results?.channels || [];
        if (!channels.length) {
          console.log("[DEEPGRAM] No channels in response");
          return null;
        }

        const alternatives = channels[0]?.alternatives || [];
        if (!alternatives.length) {
          console.log("[DEEPGRAM] No alternatives in response");
          return null;
        }

        const transcript = alternatives[0]?.transcript || "";
        const confidence = alternatives[0]?.confidence || 0;

        console.log(
          `[DEEPGRAM] Transcript: '${transcript}' (confidence: ${confidence})`
        );

        if (transcript && transcript.trim()) {
          console.log(
            `[DEEPGRAM SUCCESS] Transcribed: '${transcript}' (${transcript.length} chars)`
          );
          return transcript.trim();
        } else {
          console.log("[DEEPGRAM] Empty transcript returned");
          return null;
        }
      } catch (parseError) {
        console.error("[DEEPGRAM PARSE ERROR]", parseError);
        return null;
      }
    } else if (response.status === 401) {
      const errorText = await response.text();
      console.error(
        `[DEEPGRAM ERROR] Authentication failed (401): ${errorText}`
      );
      console.error("[DEEPGRAM ERROR] Please check your Deepgram API key");
      return null;
    } else {
      const errorText = await response.text();
      console.error(
        `[DEEPGRAM ERROR] Status: ${response.status}, Response: ${errorText}`
      );
      return null;
    }
  } catch (error) {
    console.error("[DEEPGRAM ERROR] Exception:", error);
    if (error instanceof Error) {
      console.error("[DEEPGRAM ERROR] Message:", error.message);
      console.error("[DEEPGRAM ERROR] Stack:", error.stack);
    }
    return null;
  }
}

