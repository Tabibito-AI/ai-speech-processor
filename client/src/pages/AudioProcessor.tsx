import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Mic,
  Square,
  Copy,
  Download,
  Volume2,
  Loader,
  ArrowLeft,
} from "lucide-react";

export default function AudioProcessor() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [summary, setSummary] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [summaryType, setSummaryType] = useState<"short" | "medium" | "detailed">(
    "medium"
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const transcribeMutation = trpc.audio.transcribe.useMutation();
  const translateMutation = trpc.audio.translate.useMutation();
  const summarizeMutation = trpc.audio.summarize.useMutation();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("[RECORDING] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      console.log("[RECORDING] Microphone access granted");
      streamRef.current = stream;

      // Check supported MIME types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav',
      ];
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      console.log(`[RECORDING] Using MIME type: ${selectedMimeType}`);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioChunks([]);
      setRecordingTime(0);

      // Collect audio chunks every 100ms for real-time processing
      mediaRecorder.ondataavailable = (event) => {
        console.log(`[RECORDING] Data available: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioChunks([...audioChunksRef.current]);
          console.log(`[RECORDING] Total chunks: ${audioChunksRef.current.length}, Total size: ${audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)} bytes`);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("[RECORDING ERROR]", event.error);
      };

      // Start recording and request data every 100ms for real-time processing
      mediaRecorder.start(100);
      console.log("[RECORDING] Started recording with 100ms timeslice");
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("[RECORDING ERROR] Error accessing microphone:", error);
      alert("マイクへのアクセスが拒否されました。");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      console.log("[RECORDING] Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = async () => {
        console.log(`[RECORDING] Recording stopped. Total chunks: ${audioChunksRef.current.length}`);
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log(`[RECORDING] Total audio size: ${totalSize} bytes`);
        
        if (audioChunksRef.current.length === 0) {
          console.error("[RECORDING ERROR] No audio chunks collected");
          alert("音声が記録されません。もう一度試してください。");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log(`[RECORDING] Created Blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        await processAudio(audioBlob);
      };
    }

    if (streamRef.current) {
      console.log("[RECORDING] Stopping microphone stream");
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Validate audio blob
      console.log(`[AUDIO] Blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      if (audioBlob.size < 1000) {
        alert("音声が短すぎます。もっと長く録音してください。");
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(",")[1];
          console.log(`[AUDIO] Base64 size: ${base64Audio.length} characters`);

          console.log("[TRANSCRIBE] Starting transcription...");
          const transcribeResult = await transcribeMutation.mutateAsync({
            audioData: base64Audio,
            language: "ja",
          });

          console.log(`[TRANSCRIBE] Success: ${transcribeResult.transcription}`);
          setTranscription(transcribeResult.transcription);
        } catch (error: any) {
          console.error("[TRANSCRIBE ERROR]", error);
          const errorMessage = error?.message || "不明なエラー";
          alert(`トランスクリプションエラー: ${errorMessage}`);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("[AUDIO ERROR] Error processing audio:", error);
      alert("音声処理エラー");
    }
  };

  const handleTranslate = async () => {
    if (!transcription) {
      alert("トランスクリプションを先に取得してください。");
      return;
    }

    try {
      console.log("[TRANSLATE] Starting translation...");
      const result = await translateMutation.mutateAsync({
        text: transcription,
        targetLanguage: targetLanguage,
      });
      console.log(`[TRANSLATE] Success: ${result.translation}`);
      setTranslation(result.translation);
    } catch (error: any) {
      console.error("[TRANSLATE ERROR]", error);
      const errorMessage = error?.message || "不明なエラー";
      alert(`翻訳エラー: ${errorMessage}`);
    }
  };

  const handleSummarize = async () => {
    if (!transcription) {
      alert("トランスクリプションを先に取得してください。");
      return;
    }

    try {
      console.log("[SUMMARIZE] Starting summarization...");
      const result = await summarizeMutation.mutateAsync({
        transcript: transcription,
        summaryType: summaryType,
      });
      console.log(`[SUMMARIZE] Success: ${result.summary}`);
      setSummary(result.summary);
    } catch (error: any) {
      console.error("[SUMMARIZE ERROR]", error);
      const errorMessage = error?.message || "不明なエラー";
      alert(`要約エラー: ${errorMessage}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("コピーしました！");
  };

  const downloadAsJSON = () => {
    const data = {
      transcription,
      translation,
      summary,
      timestamp: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio-processing-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/20"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">音声処理</h1>
          <p className="text-gray-600 mb-6">
            音声を録音して、テキストに変換、翻訳、要約できます。
          </p>

          {/* Recording Section */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">音声録音</h2>
            <div className="flex gap-4 mb-4">
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                {isRecording ? "録音中..." : "録音開始"}
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                録音停止
              </Button>
            </div>
            <p className="text-gray-600">
              録音時間: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              チャンク数: {audioChunks.length} | 合計サイズ: {audioChunks.reduce((sum, chunk) => sum + chunk.size, 0)} bytes
            </p>
          </Card>

          {/* Transcription Section */}
          {transcription && (
            <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">トランスクリプション</h2>
              <Textarea
                value={transcription}
                readOnly
                className="w-full h-32 mb-4 p-3 border border-gray-300 rounded"
              />
              <Button
                onClick={() => copyToClipboard(transcription)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                コピー
              </Button>
            </Card>
          )}

          {/* Translation Section */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">翻訳</h2>
            <div className="flex gap-4 mb-4">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
              <Button
                onClick={handleTranslate}
                disabled={!transcription || translateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {translateMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    翻訳中...
                  </>
                ) : (
                  "翻訳"
                )}
              </Button>
            </div>
            {translation && (
              <>
                <Textarea
                  value={translation}
                  readOnly
                  className="w-full h-32 mb-4 p-3 border border-gray-300 rounded"
                />
                <Button
                  onClick={() => copyToClipboard(translation)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </>
            )}
          </Card>

          {/* Summary Section */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-purple-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">要約</h2>
            <div className="flex gap-4 mb-4">
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as "short" | "medium" | "detailed")}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                <option value="short">短い要約</option>
                <option value="medium">中程度の要約</option>
                <option value="detailed">詳細な要約</option>
              </select>
              <Button
                onClick={handleSummarize}
                disabled={!transcription || summarizeMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {summarizeMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    要約中...
                  </>
                ) : (
                  "要約生成"
                )}
              </Button>
            </div>
            {summary && (
              <>
                <Textarea
                  value={summary}
                  readOnly
                  className="w-full h-32 mb-4 p-3 border border-gray-300 rounded"
                />
                <Button
                  onClick={() => copyToClipboard(summary)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </>
            )}
          </Card>

          {/* Export Section */}
          {(transcription || translation || summary) && (
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">エクスポート</h2>
              <Button
                onClick={downloadAsJSON}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON としてダウンロード
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
