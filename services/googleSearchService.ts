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
    console.log('Google Search API Request:', url.replace(apiKey, 'REDACTED'));
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Search API HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return null;
    }

    const data = await response.json();
    console.log('Google Search API Response:', data);

    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    }

    console.warn('No image results found for query:', query);
    return null;
  } catch (error) {
    console.error("Failed to search dish image:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return null;
  }
};
