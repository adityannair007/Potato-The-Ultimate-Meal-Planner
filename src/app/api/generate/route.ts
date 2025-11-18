import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Constants
// ============================================================================

const INDIAN_RECIPE_API_URL =
  "https://rohit4242-kuldeep-project--indian-recipe-llm-api-fastapi-app.modal.run/generate-recipe";

// ============================================================================
// Types
// ============================================================================

/**
 * Request payload from the frontend
 */
interface GenerateRecipeRequest {
  ingredients: string[];
  allergies: string[];
  cuisines: string[];
  mealType: string[];
  diet: string;
}

/**
 * Request payload for the custom Indian Recipe API
 */
interface IndianRecipeAPIRequest {
  ingredients: string[];
  cuisine: string;
  mealType: string;
  diet: string;
  allergies?: string[];
}

/**
 * Expected recipe item from custom API (with recipeName and steps)
 */
interface CustomAPIRecipe {
  recipeName: string;
  steps: string[];
  calories: string;
}

/**
 * Recipe item format expected by frontend (with name and recipe)
 */
interface FrontendRecipe {
  name: string;
  recipe: string[];
  calories: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transforms frontend request to custom API request format
 */
function transformToAPIRequest(
  data: GenerateRecipeRequest
): IndianRecipeAPIRequest {
  const requestBody: IndianRecipeAPIRequest = {
    ingredients: data.ingredients,
    cuisine: Array.isArray(data.cuisines) ? data.cuisines[0] : data.cuisines,
    mealType: Array.isArray(data.mealType) ? data.mealType[0] : data.mealType,
    diet: data.diet,
  };

  // Add allergies only if provided
  if (data.allergies && data.allergies.length > 0) {
    requestBody.allergies = data.allergies;
  }

  return requestBody;
}

/**
 * Transforms custom API response to frontend-expected format
 * Handles both { recipeName, steps } and { name, recipe } formats
 */
function transformToFrontendRecipes(data: any): FrontendRecipe[] {
  // Extract items array from response
  let items: any[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data.recipes || data.items) {
    items = data.recipes || data.items;
  } else if (typeof data === "string") {
    // Handle string responses (might be JSON wrapped in markdown)
    const cleaned = data.replace(/```json|```/g, "").trim();
    items = JSON.parse(cleaned);
  } else {
    items = [data];
  }

  // Transform each item to frontend format
  return items.map((item: any) => ({
    name: item.recipeName || item.name || "Untitled Recipe",
    recipe: item.steps || item.recipe || [],
    calories: item.calories || "0",
  }));
}

/**
 * Validates the incoming request data
 */
function validateRequest(data: GenerateRecipeRequest): string | null {
  if (!data.ingredients || data.ingredients.length === 0) {
    return "Ingredients are required";
  }

  if (!data.diet) {
    return "Diet preference is required";
  }

  if (!data.cuisines || data.cuisines.length === 0) {
    return "At least one cuisine is required";
  }

  if (!data.mealType || data.mealType.length === 0) {
    return "At least one meal type is required";
  }

  return null;
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const requestData = (await req.json()) as GenerateRecipeRequest;
    console.log("📝 Parsed request data:", requestData);

    console.log("📥 Received request:", {
      ingredients: requestData.ingredients.length,
      cuisines: requestData.cuisines,
      mealTypes: requestData.mealType,
      diet: requestData.diet,
    });

    // Validate input
    const validationError = validateRequest(requestData);
    if (validationError) {
      console.error("❌ Validation error:", validationError);
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Transform request for custom API
    const apiRequestBody = transformToAPIRequest(requestData);
    console.log("🔄 Sending to custom API:", apiRequestBody);

    // Call custom Indian Recipe API
    const response = await fetch(INDIAN_RECIPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    console.log("📡 API Response status:", response.status);

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API error response:", errorText);
      throw new Error(
        `Custom API request failed with status ${response.status}: ${errorText}`
      );
    }

    // Parse API response
    const apiData = await response.json();
    console.log("✅ API Response received:", {
      type: typeof apiData,
      isArray: Array.isArray(apiData),
      keys: typeof apiData === "object" ? Object.keys(apiData) : [],
    });

    // Transform response to frontend format
    const recipes = transformToFrontendRecipes(apiData);
    console.log(`📦 Returning ${recipes.length} transformed recipe(s)`);

    return NextResponse.json({ items: recipes });
  } catch (error) {
    // Handle any errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("💥 Error in generate route:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to generate recipes",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
