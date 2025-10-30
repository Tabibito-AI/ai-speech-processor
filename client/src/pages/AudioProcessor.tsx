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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("マイクへのアクセスが拒否されました。");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        await processAudio(audioBlob);
      };
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        const transcribeResult = await transcribeMutation.mutateAsync({
          audioData: base64Audio,
          language: "ja",
        });

        setTranscription(transcribeResult.transcription);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("音声処理エラー");
    }
  };

  const handleTranslate = async () => {
    if (!transcription) {
      alert("トランスクリプションを先に取得してください。");
      return;
    }

    try {
      const result = await translateMutation.mutateAsync({
        text: transcription,
        targetLanguage: targetLanguage,
      });
      setTranslation(result.translation);
    } catch (error) {
      console.error("Translation error:", error);
      alert("翻訳エラー");
    }
  };

  const handleSummarize = async () => {
    if (!transcription) {
      alert("トランスクリプションを先に取得してください。");
      return;
    }

    try {
      const result = await summarizeMutation.mutateAsync({
        transcript: transcription,
        summaryType: summaryType,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization error:", error);
      alert("要約エラー");
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
      targetLanguage,
      summaryType,
      timestamp: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speech-processor-${Date.now()}.json`;
    a.click();
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "ja", name: "日本語" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文" },
    { code: "ko", name: "한국어" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-white">Audio Processor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recording Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">音声録音</h2>

              <div className="space-y-4">
                {/* Recording Timer */}
                {isRecording && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {Math.floor(recordingTime / 60)}:
                      {String(recordingTime % 60).padStart(2, "0")}
                    </div>
                    <p className="text-red-300 text-sm mt-2">録音中...</p>
                  </div>
                )}

                {/* Record Button */}
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full py-6 text-lg font-semibold rounded-lg transition-all ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white text-purple-600 hover:bg-white/90"
                  }`}
                  disabled={transcribeMutation.isPending}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      停止
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      録音開始
                    </>
                  )}
                </Button>

                {/* Loading State */}
                {transcribeMutation.isPending && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
                    <Loader className="w-5 h-5 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-300 text-sm">処理中...</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Content Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transcription */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">トランスクリプション</h2>
                {transcription && (
                  <Button
                    onClick={() => copyToClipboard(transcription)}
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Textarea
                value={transcription}
                readOnly
                placeholder="録音してください..."
                className="bg-white/5 border-white/20 text-white placeholder-white/50 min-h-24"
              />
            </Card>

            {/* Translation */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">翻訳</h2>
                <div className="flex gap-2">
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-purple-900">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleTranslate}
                    disabled={!transcription || translateMutation.isPending}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm"
                  >
                    {translateMutation.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "翻訳"
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                value={translation}
                readOnly
                placeholder="翻訳結果がここに表示されます..."
                className="bg-white/5 border-white/20 text-white placeholder-white/50 min-h-24"
              />
            </Card>

            {/* Summary */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">要約</h2>
                <div className="flex gap-2">
                  <select
                    value={summaryType}
                    onChange={(e) =>
                      setSummaryType(e.target.value as "short" | "medium" | "detailed")
                    }
                    className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm"
                  >
                    <option value="short" className="bg-purple-900">
                      短
                    </option>
                    <option value="medium" className="bg-purple-900">
                      中
                    </option>
                    <option value="detailed" className="bg-purple-900">
                      詳細
                    </option>
                  </select>
                  <Button
                    onClick={handleSummarize}
                    disabled={!transcription || summarizeMutation.isPending}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm"
                  >
                    {summarizeMutation.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "生成"
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                value={summary}
                readOnly
                placeholder="要約がここに表示されます..."
                className="bg-white/5 border-white/20 text-white placeholder-white/50 min-h-24"
              />
            </Card>

            {/* Action Buttons */}
            {(transcription || translation || summary) && (
              <div className="flex gap-4">
                <Button
                  onClick={downloadAsJSON}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
                {translation && (
                  <Button
                    onClick={() => speakText(translation)}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    再生
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

