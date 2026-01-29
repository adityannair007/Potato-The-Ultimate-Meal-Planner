import { redis } from "@/lib/redis";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { ingredients, allergies, cuisine, mealType, diet } =
      await req.json();

    const cacheKey = `recipe: ${JSON.stringify({
      ingredients: [...ingredients].sort(),
      allergies: [...allergies].sort(),
      cuisine,
      mealType,
      diet,
    })}`;

    const cachedRecipes = await redis.get(cacheKey);
    if (cachedRecipes) {
      console.log("Serving recipes from redis cache!");
      return NextResponse.json({ items: cachedRecipes });
    }

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
        responseMimeType: "application/json",
      },
    });

    const items = JSON.parse(res.text || "[]");

    await redis.set(cacheKey, items, { ex: 86400 });

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
