import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { MenuAnalysisResult } from "../types";

// Validate API Key immediately
const apiKey = import.meta.env.VITE_API_KEY;

// Initialize Gemini Client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const analysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    cuisineType: {
      type: SchemaType.STRING,
      description: "The general cuisine type of the menu in Japanese (e.g., イタリア料理, タイ料理, 居酒屋). Do not use English."
    },
    dishes: {
      type: SchemaType.ARRAY,
      description: "List of identified dishes from the menu.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          originalName: { type: SchemaType.STRING, description: "The name of the dish as it appears on the menu (keep original language)." },
          translatedName: { type: SchemaType.STRING, description: "Natural Japanese translation of the dish name." },
          description: { type: SchemaType.STRING, description: "A brief, simple Japanese description of the dish (max 30 chars)." },
          price: {
            type: SchemaType.STRING,
            description: "The price string as found on the menu including symbol (e.g., '$15.00', '€12', '250 THB'). Return empty string if not found."
          },
          estimatedYen: {
            type: SchemaType.INTEGER,
            description: "Estimated price in Japanese Yen (JPY) calculated based on the currency and an approximate current exchange rate. Return 0 if price is not found."
          }
        },
        required: ["originalName", "translatedName", "description", "price", "estimatedYen"]
      }
    }
  },
  required: ["cuisineType", "dishes"]
};

export const analyzeMenuImage = async (base64Image: string): Promise<MenuAnalysisResult> => {
  if (!genAI || !apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  try {
    // Use gemini-2.5-flash for best performance and multimodal capabilities
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
      // Relax safety settings to prevent blocking food content
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      systemInstruction: "You are a fast travel food guide. Analyze the menu image. Output strictly in Japanese. \n1. Identify dishes, translate names to Japanese, and provide very brief Japanese descriptions.\n2. Ensure the cuisine type is a standard Japanese term.\n3. Extract the price for each dish.\n4. Convert the price to Japanese Yen (JPY) using an approximate current exchange rate."
    });

    // Remove the data:image/jpeg;base64, prefix if present for the SDK
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      "Analyze this menu image. Extract dishes. Output in JSON format."
    ]);

    const text = result.response.text();
    if (!text) throw new Error("No response from AI");

    // Robust JSON extraction: Find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Invalid JSON response: No JSON object found");
    }

    const cleanedText = text.substring(firstBrace, lastBrace + 1);

    return JSON.parse(cleanedText) as MenuAnalysisResult;
  } catch (error) {
    console.error("Error analyzing menu:", error);
    throw error;
  }
};

export const generateDishImage = async (dishDescription: string): Promise<string> => {
  if (!genAI || !apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  try {
    // Use gemini-2.5-flash-image which supports image generation and works with the SDK (solving CORS)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Generate a delicious, professional food photography shot of: ${dishDescription}. High resolution, appetizing lighting, centered composition, shallow depth of field.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check for inline image data in the response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const parts = candidates[0].content.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No content parts returned");
    }

    // Find the part with inlineData (image)
    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      // Fallback: Check if it returned text saying it can't generate
      const textPart = parts.find((part: any) => part.text);
      if (textPart && textPart.text) {
        throw new Error(`Model returned text instead of image: ${textPart.text.substring(0, 50)}...`);
      }
      throw new Error("No image data found in response");
    }

    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error generating dish image:", error);
    // Enhance error message for better debugging
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error("Model not found or not available. Please check API key permissions.");
    }
    throw error;
  }
};
