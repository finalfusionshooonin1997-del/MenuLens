import React, { useState, useEffect } from 'react';
import { Dish } from '../types';
import { searchDishImage } from '../services/googleSearchService';

interface DishCardProps {
  dish: Dish;
  restaurantName?: string;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, restaurantName }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      setLoadingImage(true);
      const query = [dish.originalName, dish.translatedName, restaurantName, '料理'].filter(Boolean).join(' ');
      const url = await searchDishImage(query);
      if (isMounted) {
        setImageUrl(url);
        setLoadingImage(false);
      }
    };

    fetchImage();
    return () => { isMounted = false; };
  }, [dish, restaurantName]);

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

        <p className="text-gray-300 text-sm mb-4">{dish.description}</p>

        <div className="mb-3">
          {loadingImage ? (
            <div className="w-full h-48 bg-gray-700 animate-pulse rounded-lg flex items-center justify-center text-gray-500 mb-2">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : imageUrl ? (
            <div className="relative mb-2">
              <img
                src={imageUrl}
                alt={dish.translatedName}
                className="w-full h-48 object-cover rounded-lg"
                onError={() => setImageUrl(null)}
              />
            </div>
          ) : (
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors bg-gray-700 hover:bg-gray-600 text-teal-400 border border-gray-600 hover:border-teal-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Google画像検索で参考画像を見る
            </a>
          )}
          <p className="text-xs text-gray-500 text-center mt-2">
            ※アプリ内での直接表示はできないため、Google検索結果を表示します
          </p>
        </div>

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
