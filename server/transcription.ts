/**
 * Transcribe audio using Deepgram API
 * Note: Deepgram API key is hardcoded
 */

const DEEPGRAM_API_KEY = "f15a08a21d03dfdb24a3ee8360ef0eeb79ffa921";

// Log API key status on startup
console.log("[DEEPGRAM] API key configured (hardcoded)");

const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

export async function transcribeAudioWithDeepgram(
  audioData: Buffer | Uint8Array | ArrayBuffer,
  language: string = "ja"
): Promise<string | null> {
  try {
    if (!DEEPGRAM_API_KEY) {
      console.error("[DEEPGRAM ERROR] API key not configured.");
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
    
    if (audioLength < 100) {
      console.warn(`[DEEPGRAM WARNING] Audio data too small: ${audioLength} bytes`);
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

    // Build query parameters
    const params = new URLSearchParams({
      model: "nova-2",
      language: language,
      punctuate: "true",
      smart_format: "true",
    });

    // Build headers with correct authentication format
    const headers: Record<string, string> = {
      "Authorization": `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm",
    };

    const url = `${DEEPGRAM_URL}?${params.toString()}`;
    console.log(`[DEEPGRAM] Request URL: ${url}`);
    console.log(`[DEEPGRAM] Headers: Authorization: Token ${DEEPGRAM_API_KEY.substring(0, 10)}...`);
    console.log(`[DEEPGRAM] Content-Type: audio/webm`);
    console.log(`[DEEPGRAM] Audio size: ${bodyData.length} bytes`);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: bodyData as any,
    });

    console.log(`[DEEPGRAM] Response status: ${response.status}`);

    if (response.status === 200) {
      const result = await response.json();
      console.log("[DEEPGRAM] Response received successfully");

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

        console.log(`[DEEPGRAM] Transcript: '${transcript}' (confidence: ${confidence})`);

        if (transcript && transcript.trim()) {
          console.log(`[DEEPGRAM SUCCESS] Transcribed: '${transcript}' (${transcript.length} chars)`);
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
      console.error(`[DEEPGRAM ERROR] Authentication failed (401)`);
      console.error(`[DEEPGRAM ERROR] Response: ${errorText}`);
      console.error("[DEEPGRAM ERROR] Please verify your Deepgram API key is valid");
      return null;
    } else if (response.status === 400) {
      const errorText = await response.text();
      console.error(`[DEEPGRAM ERROR] Bad Request (400)`);
      console.error(`[DEEPGRAM ERROR] Response: ${errorText}`);
      console.error("[DEEPGRAM ERROR] This usually means the audio format is not supported or parameters are invalid");
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[DEEPGRAM ERROR] Error details:`, errorJson);
      } catch (e) {
        // Not JSON
      }
      return null;
    } else if (response.status === 500) {
      const errorText = await response.text();
      console.error(`[DEEPGRAM ERROR] Internal Server Error (500)`);
      console.error(`[DEEPGRAM ERROR] Response: ${errorText}`);
      console.error(`[DEEPGRAM ERROR] Audio size: ${bodyData.length} bytes`);
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[DEEPGRAM ERROR] Error details:`, errorJson);
      } catch (e) {
        // Not JSON
      }
      return null;
    } else {
      const errorText = await response.text();
      console.error(`[DEEPGRAM ERROR] Status: ${response.status}`);
      console.error(`[DEEPGRAM ERROR] Response: ${errorText}`);
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[DEEPGRAM ERROR] Error JSON:`, errorJson);
      } catch (e) {
        // Not JSON
      }
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

