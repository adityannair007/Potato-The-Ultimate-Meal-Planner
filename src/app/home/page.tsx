// app/page.tsx (or app/home/page.tsx)
import HomeClient from "./homeClient";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// --- Types ---
type foodRecipe = {
  name: string;
  recipe: string[];
  calories: number;
};
// --- End Types ---

// --- Data Fetching (Updated) ---
async function fetchRecipes(
  labels: string[],
  allergen: string[],
  cuisine: string[],
  mealType: string[], // Changed to array
  diet: string
): Promise<foodRecipe[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const res = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ingredients: labels,
        allergies: allergen,
        cuisines: cuisine, // Note: your API needs to support an array
        mealType: mealType, // Note: your API needs to support an array
        diet: diet,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch recipes:", await res.text());
      return [];
    }

    const food = await res.json();
    return food.items || [];
  } catch (error) {
    console.error("Error in fetchRecipes: ", error);
    return [];
  }
}

// --- Helper Function ---
// This safely converts a search param (string or array) into an array
const getParamAsArray = (param: string | string[] | undefined): string[] => {
  if (Array.isArray(param)) {
    return param; // It's already an array
  }
  if (typeof param === "string") {
    return [param]; // It's a single string, put it in an array
  }
  return []; // It's undefined, return an empty array
};

// --- Server Component (Updated) ---
export default async function HomePage({
  searchParams,
}: {
  // This type is the standard for searchParams
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let recipes: foodRecipe[] = [];

  // --- THIS IS THE CORRECTED LOGIC ---
  const ingredients = getParamAsArray(searchParams?.ingredients);
  const allergies = getParamAsArray(searchParams?.allergies);
  const cuisines = getParamAsArray(searchParams?.cuisine); // Note: 'cuisine' (singular)
  const mealTypes = getParamAsArray(searchParams?.mealType); // Note: 'mealType'
  const diet = (searchParams?.diet as string) || ""; // Gets 'veg' or 'non-veg'
  // --- END OF FIX ---

  // Only fetch recipes if we have ingredients
  if (ingredients.length > 0) {
    recipes = await fetchRecipes(
      ingredients,
      allergies,
      cuisines,
      mealTypes,
      diet
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full p-8 bg-green-50 gap-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Your Recipes</h1>
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-lg gap-y-4">
          <AlertTriangle size={48} className="text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-700">
            No Recipes Found
          </h2>
          <p className="text-gray-500 text-center">
            We couldn't find any recipes with your selected ingredients.
            <br />
            Try adding more items from your{" "}
            <Link
              href="/fridge"
              className="text-amber-600 font-medium hover:underline"
            >
              Fridge
            </Link>
            !
          </p>
        </div>
      ) : (
        <HomeClient recipes={recipes} />
      )}
    </div>
  );
}
