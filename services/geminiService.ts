import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MenuAnalysisResult } from "../types";

// Initialize Gemini Client
// Note: API Key is injected via process.env.API_KEY automatically in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cuisineType: { 
      type: Type.STRING, 
      description: "The general cuisine type of the menu in Japanese (e.g., イタリア料理, タイ料理, 居酒屋). Do not use English." 
    },
    dishes: {
      type: Type.ARRAY,
      description: "List of identified dishes from the menu.",
      items: {
        type: Type.OBJECT,
        properties: {
          originalName: { type: Type.STRING, description: "The name of the dish as it appears on the menu (keep original language)." },
          translatedName: { type: Type.STRING, description: "Natural Japanese translation of the dish name." },
          description: { type: Type.STRING, description: "A short, appetizing description of the dish strictly in Japanese (approx 30-40 chars)." },
          ingredients: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of main ingredients in Japanese."
          },
          price: { 
            type: Type.STRING, 
            description: "The price string as found on the menu including symbol (e.g., '$15.00', '€12', '250 THB'). Return empty string if not found." 
          },
          estimatedYen: { 
            type: Type.INTEGER, 
            description: "Estimated price in Japanese Yen (JPY) calculated based on the currency and an approximate current exchange rate. Return 0 if price is not found." 
          }
        },
        required: ["originalName", "translatedName", "description", "ingredients", "price", "estimatedYen"]
      }
    }
  },
  required: ["cuisineType", "dishes"]
};

export const analyzeMenuImage = async (base64Image: string): Promise<MenuAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Fast and lightweight
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this menu image. Extract the dishes. If the text is blurry or not a menu, try your best to identify food items. Output in JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful travel food guide for Japanese tourists. Analyze the menu image. Output strictly in Japanese. \n1. Identify dishes, translate names to Japanese, and provide appetizing Japanese descriptions.\n2. Ensure the cuisine type is a standard Japanese term.\n3. Extract the price for each dish.\n4. Identify the currency based on the menu context (country symbols, language) and convert the price to Japanese Yen (JPY) using an approximate current exchange rate."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MenuAnalysisResult;
  } catch (error) {
    console.error("Error analyzing menu:", error);
    throw error;
  }
};

export const generateDishImage = async (dishDescription: string): Promise<string> => {
  try {
    // Using Imagen 3 (via gemini-2.5-flash-image or imagen-4.0-generate-001 recommended in docs)
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A delicious, professional food photography shot of: ${dishDescription}. High resolution, appetizing lighting.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) throw new Error("Failed to generate image");

    return `data:image/jpeg;base64,${imageBytes}`;
  } catch (error) {
    console.error("Error generating dish image:", error);
    throw error;
  }
};