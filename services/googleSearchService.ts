export const searchDishImage = async (query: string): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    console.warn("Google Search API key or Engine ID is missing.");
    return null;
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&cx=${engineId}&key=${apiKey}&searchType=image&num=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    }
    return null;
  } catch (error) {
    console.error("Failed to search dish image:", error);
    return null;
  }
};
