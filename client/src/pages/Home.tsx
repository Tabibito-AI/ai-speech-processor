import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Mic, Globe, BookOpen, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Mic,
      title: "音声録音",
      description: "マイクから直接高品質の音声を録音できます",
    },
    {
      icon: Globe,
      title: "リアルタイム翻訳",
      description: "40以上の言語にリアルタイムで翻訳",
    },
    {
      icon: BookOpen,
      title: "AI要約",
      description: "短・中・詳細の3段階で自動要約を生成",
    },
    {
      icon: Zap,
      title: "高速処理",
      description: "最新のAI技術で瞬時に処理",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">AI Speech Processor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            音声をテキストに、<br />
            言語の壁を越える
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            最新のAI技術を使用して、音声をリアルタイムで文字起こし、翻訳、要約します。
            会議、講演、インタビューなど、あらゆる場面で活躍します。
          </p>
          <Button
            onClick={() => setLocation("/audio")}
            className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            今すぐ始める
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">40+</div>
            <p className="text-white/70">対応言語</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <p className="text-white/70">認識精度</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">リアルタイム</div>
            <p className="text-white/70">処理速度</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-md bg-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white/60 text-sm">
          <p>Powered by Manus AI • Built with React + Express + Manus LLM</p>
        </div>
      </footer>
    </div>
  );
}

