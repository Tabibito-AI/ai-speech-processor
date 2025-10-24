import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50">
      <header className="bg-white shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800">{APP_TITLE}</h1>
        <p className="text-gray-600">
          AI-powered speech transcription, translation, and summarization
        </p>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Welcome to AI Speech Processor
          </h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            This application allows you to record audio, automatically transcribe
            it, translate to different languages, and generate summaries using
            advanced AI technology.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => setLocation("/audio")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              Start Processing Audio
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

