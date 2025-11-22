//   setLoading(true);
//   setError(null);
//   try {
//     // Create a rich prompt for the image generator
//     const prompt = `${dish.originalName} (${dish.translatedName}). ${dish.description}`;
//     const url = await generateDishImage(prompt);
//     setImageUrl(url);
//   } catch (err: any) {
//     setError(err.message || "Unknown error");
//   } finally {
//     setLoading(false);
//   }
// }; // Removed

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
        <p className="text-xs text-gray-500 text-center mt-2">
          ※アプリ内での直接表示はできないため、Google検索結果を表示します
        </p>
      </div>
    </div>
  </div>
);
};
