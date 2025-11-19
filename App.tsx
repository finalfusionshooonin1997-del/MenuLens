import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { DishCard } from './components/DishCard';
import { Spinner } from './components/Spinner';
import { analyzeMenuImage } from './services/geminiService';
import { AppState, MenuAnalysisResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<MenuAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCapture = async (base64Image: string) => {
    setAppState(AppState.PROCESSING_MENU);
    setErrorMessage(""); // Reset error
    try {
      const analysis = await analyzeMenuImage(base64Image);
      setResult(analysis);
      setAppState(AppState.RESULTS);
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      
      // Handle specific errors
      if (error.message === 'API_KEY_MISSING') {
        setErrorMessage("設定エラー: APIキーが見つかりません。GitHubのSecretsに「VITE_API_KEY」を設定し、Actionを再実行してください。");
      } else if (error.message?.includes('429') || error.message?.includes('Quota') || error.status === 429) {
        setErrorMessage("短時間に利用しすぎたようです。1分ほど待ってから再度お試しください。");
      } else if (error.message?.includes('503')) {
        setErrorMessage("サーバーが混み合っています。少し待ってから再度お試しください。");
      } else if (error.message?.includes('403') || error.message?.includes('permission')) {
        setErrorMessage("APIキーの権限エラーです。Google Cloud Consoleでウェブサイトの制限設定（URL）を確認してください。");
      } else {
        setErrorMessage("メニューの解析に失敗しました。インターネット接続を確認するか、写真が鮮明か確認してください。");
      }
    }
  };

  const handleRetry = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden flex flex-col font-sans">
      {/* Header - Only show on results or error to allow full screen camera */}
      {appState !== AppState.IDLE && (
        <header className="bg-gray-800 border-b border-gray-700 p-4 z-10 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-teal-500 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h1 className="font-bold text-lg tracking-tight">MenuLens</h1>
          </div>
          <button 
            onClick={handleRetry}
            className="text-sm text-gray-400 hover:text-white"
          >
            トップへ戻る
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto relative">
        {appState === AppState.IDLE && (
          <CameraView onCapture={handleCapture} />
        )}

        {appState === AppState.PROCESSING_MENU && (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center space-y-6">
            <Spinner />
            <div>
              <h2 className="text-xl font-bold text-teal-400 mb-2">メニューを解析中...</h2>
              <p className="text-gray-400 text-sm">
                AIが文字を読み取り、料理を識別しています。<br/>
                数秒お待ちください...
              </p>
            </div>
            {/* Visual decoration */}
            <div className="w-full max-w-xs h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        )}

        {appState === AppState.RESULTS && result && (
          <div className="p-4 pb-10 max-w-xl mx-auto">
            <div className="mb-6">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">料理ジャンル</span>
              <h2 className="text-3xl font-extrabold text-white">{result.cuisineType}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {result.dishes.length} 個の料理が見つかりました
              </p>
            </div>

            <div className="space-y-6">
              {result.dishes.map((dish, index) => (
                <DishCard key={index} dish={dish} />
              ))}
            </div>

            <div className="mt-8 text-center">
               <button 
                onClick={handleRetry}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium transition shadow-lg"
              >
                別のメニューを撮る
              </button>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-900/30 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">エラーが発生しました</h2>
            <p className="text-gray-400 mb-8 text-sm max-w-xs">
              {errorMessage || "メニューの解析に失敗しました。インターネット接続を確認するか、写真が鮮明か確認してください。"}
            </p>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-500"
            >
              もう一度試す
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
