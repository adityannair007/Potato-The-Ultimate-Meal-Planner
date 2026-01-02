import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// 1. Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Optional: Simple in-memory cache to save your 15 RPM quota
const cache = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { ingredients, allergies, cuisine, mealType, diet } =
      await req.json();

    // Cache logic (Recommended for Free Tier)
    const cacheKey = JSON.stringify({
      ingredients,
      allergies,
      cuisine,
      mealType,
      diet,
    });
    if (cache.has(cacheKey)) {
      return NextResponse.json({ items: cache.get(cacheKey) });
    }

    // 2. Correct function call for @google/genai SDK
    // Notice: .models.generateContent takes an object with 'model' and 'contents'
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 recipes as a JSON array. 
        Diet: ${diet || "Any"}
        Meal Types: ${Array.isArray(mealType) ? mealType.join(", ") : mealType}
        Cuisines: ${Array.isArray(cuisine) ? cuisine.join(", ") : cuisine}
        Ingredients: ${ingredients.join(", ")}
        Exclude: ${allergies?.join(", ") || "None"}
        Format: [{"name": "string", "recipe": ["string"], "calories": number}]`,
      config: {
        responseMimeType: "application/json", // Native JSON mode
      },
    });

    // 3. The response text is accessed directly via .text
    const items = JSON.parse(res.text || "[]");

    cache.set(cacheKey, items);

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("SDK Error:", error);

    if (error.status === 429 || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recipes", details: error.message },
      { status: 500 }
    );
  }
}
