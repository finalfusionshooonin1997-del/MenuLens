import React, { useRef, useState, useCallback, useEffect } from 'react';
import { compressImage } from '../services/imageUtils';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  // Start camera automatically on mount with fallback logic
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // First, try to get the environment (rear) camera
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 } },
            audio: false,
          });
        } catch (envError) {
          console.warn("Environment camera not found, falling back to any video device.", envError);
          // Fallback: Try any available video device (e.g., webcam or front camera)
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        setStream(currentStream);
        setPermissionError(false);
        
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera access denied or device not found:", err);
        setPermissionError(true);
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCaptureClick = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      // Compress immediately
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
      onCapture(dataUrl.split(',')[1]);
    }
  }, [onCapture]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        onCapture(base64);
      } catch (err) {
        console.error("Compression failed", err);
        alert("画像の読み込みに失敗しました");
      }
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      {/* Viewfinder Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {!permissionError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-6 max-w-xs mx-auto">
            <div className="bg-gray-800/80 p-6 rounded-xl backdrop-blur-sm">
              <p className="mb-4 font-medium">カメラが見つからないか、アクセスが許可されていません。</p>
              <p className="text-sm text-gray-400 mb-6">
                下のボタンから撮影済みの写真を選択することもできます。
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-600 text-white px-6 py-3 rounded-full w-full font-bold active:scale-95 transition-transform"
              >
                写真を選択する
              </button>
            </div>
          </div>
        )}
        
        {/* Overlay Guides - Only show if camera is active */}
        {!permissionError && (
          <div className="absolute inset-0 border-2 border-white/20 pointer-events-none">
            <div className="absolute top-1/4 left-8 right-8 bottom-1/4 border border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            <p className="absolute top-[20%] w-full text-center text-white/90 text-sm font-medium drop-shadow-md px-4">
              メニューを枠内に入れてください
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-6 pb-8 safe-area-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Gallery Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition active:bg-gray-600"
            aria-label="ギャラリーからアップロード"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCaptureClick}
            disabled={permissionError}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-150
              ${permissionError ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 active:bg-white/20'}`}
            aria-label="写真を撮る"
          >
            <div className="w-16 h-16 rounded-full bg-white shadow-lg"></div>
          </button>
          
          {/* Placeholder for spacing balance (empty div for flex alignment) */}
          <div className="w-12 h-12"></div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        // Capture environment meant for mobile to open camera directly, but standard file picker allows gallery too
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};