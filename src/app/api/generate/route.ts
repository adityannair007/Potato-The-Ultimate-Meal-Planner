import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createClient } from "redis";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    console.log("VERSION 2.0 - DOCKER UPDATED");
    const { ingredients, allergies, cuisine, mealType, diet } =
      await req.json();

    const cacheKey = `recipe: ${JSON.stringify({
      ingredients: [...ingredients].sort(),
      allergies: [...allergies].sort(),
      cuisine,
      mealType,
      diet,
    })}`;

    const cacheRecipes = await redis.get(cacheKey);

    if (cacheRecipes) {
      console.log("Serving from redis cache!");
      return NextResponse.json({ items: JSON.parse(cacheRecipes) });
    }

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${Array.isArray(mealType) ? mealType.join(", ") : mealType} recipes as a JSON array. 
        Diet: ${diet || "Any"}
        Cuisines: ${Array.isArray(cuisine) ? cuisine.join(", ") : cuisine}
        Ingredients: ${ingredients.join(", ")}
        Exclude: ${allergies?.join(", ") || "None"}
        Format: [{"name": "string", "recipe": ["string"], "calories": number}]`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const items = JSON.parse(res.text || "[]");

    await redis.set(cacheKey, JSON.stringify(items), { EX: 86400 });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error:", error);

    if (error.status === 429 || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached" },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recipes", details: error.message },
      { status: 500 },
    );
  }
}
