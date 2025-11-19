import React, { useState } from 'react';
import { Dish } from '../types';
import { generateDishImage } from '../services/geminiService';
import { Spinner } from './Spinner';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleVisualize = async () => {
    if (imageUrl || loading) return;
    setLoading(true);
    setError(false);
    try {
      // Create a rich prompt for the image generator
      const prompt = `${dish.originalName} (${dish.translatedName}). ${dish.description}`;
      const url = await generateDishImage(prompt);
      setImageUrl(url);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(dish.originalName + ' ' + dish.translatedName + ' 料理')}&tbm=isch`;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg mb-4 transition-transform duration-200 hover:scale-[1.01]">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight break-words">{dish.translatedName}</h3>
            <span className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded mt-1 inline-block break-all">
              {dish.originalName}
            </span>
          </div>
          
          {dish.estimatedYen && dish.estimatedYen > 0 && (
            <div className="text-right shrink-0 flex flex-col items-end">
              <div className="text-lg font-bold text-teal-400 whitespace-nowrap">
                ¥{dish.estimatedYen.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {dish.price}
              </div>
            </div>
          )}
        </div>
        
        <p className="text-gray-300 text-sm mb-3">{dish.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {dish.ingredients.map((ing, idx) => (
            <span key={idx} className="text-[10px] uppercase tracking-wider text-teal-200 bg-teal-900/30 px-2 py-0.5 rounded-full border border-teal-900/50">
              {ing}
            </span>
          ))}
        </div>

        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-3">
            <img src={imageUrl} alt={dish.translatedName} className="w-full h-full object-cover fade-in" />
          </div>
        ) : (
          <div className="mb-3">
            <button
              onClick={handleVisualize}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors
                ${loading 
                  ? 'bg-gray-700 cursor-wait' 
                  : 'bg-teal-600 hover:bg-teal-500 text-white active:bg-teal-700'
                }`}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  画像を表示 (データ節約モード)
                </>
              )}
            </button>
            {error && <p className="text-red-400 text-xs text-center mt-2">画像の生成に失敗しました。</p>}
          </div>
        )}

        <div className="text-right">
          <a 
            href={googleSearchUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-gray-400 hover:text-teal-400 transition-colors gap-1"
          >
            Google画像検索で見る
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};