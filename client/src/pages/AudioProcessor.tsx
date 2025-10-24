import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export default function AudioProcessor() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [summary, setSummary] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [summaryType, setSummaryType] = useState<"short" | "medium" | "detailed">(
    "medium"
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const transcribeMutation = trpc.audio.transcribe.useMutation();
  const translateMutation = trpc.audio.translate.useMutation();
  const summarizeMutation = trpc.audio.summarize.useMutation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("マイクへのアクセスが拒否されました。");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

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
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        // Transcribe
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
        summaryLanguage: "ja",
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization error:", error);
      alert("要約エラー");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          AI Speech Processor
        </h1>
        <p className="text-center text-gray-600 mb-8">
          音声を録音して、トランスクリプション、翻訳、要約を自動生成します
        </p>

        {/* Recording Section */}
        <Card className="mb-8 p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ステップ 1: 音声録音
          </h2>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="bg-red-500 hover:bg-red-600"
            >
              {isRecording ? "録音中..." : "録音開始"}
            </Button>
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              className="bg-gray-500 hover:bg-gray-600"
            >
              録音停止
            </Button>
          </div>
          {isRecording && (
            <p className="text-red-500 font-semibold">● 録音中...</p>
          )}
        </Card>

        {/* Transcription Section */}
        {transcription && (
          <Card className="mb-8 p-6 bg-white shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              ステップ 2: トランスクリプション
            </h2>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg"
              placeholder="トランスクリプションがここに表示されます"
            />
          </Card>
        )}

        {/* Translation Section */}
        <Card className="mb-8 p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ステップ 3: 翻訳
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              翻訳先言語
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <Button
            onClick={handleTranslate}
            disabled={!transcription || translateMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 mb-4"
          >
            {translateMutation.isPending ? "翻訳中..." : "翻訳"}
          </Button>
          {translation && (
            <Textarea
              value={translation}
              readOnly
              className="w-full h-32 p-4 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="翻訳結果がここに表示されます"
            />
          )}
        </Card>

        {/* Summary Section */}
        <Card className="mb-8 p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ステップ 4: 要約
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              要約タイプ
            </label>
            <select
              value={summaryType}
              onChange={(e) =>
                setSummaryType(
                  e.target.value as "short" | "medium" | "detailed"
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="short">短い (4-5行)</option>
              <option value="medium">中程度 (3-4段落)</option>
              <option value="detailed">詳細 (複数セクション)</option>
            </select>
          </div>
          <Button
            onClick={handleSummarize}
            disabled={!transcription || summarizeMutation.isPending}
            className="bg-green-500 hover:bg-green-600 mb-4"
          >
            {summarizeMutation.isPending ? "要約中..." : "要約生成"}
          </Button>
          {summary && (
            <Textarea
              value={summary}
              readOnly
              className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="要約がここに表示されます"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

