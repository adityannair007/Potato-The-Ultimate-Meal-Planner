import HomeClient from "./homeClient";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type foodRecipe = {
  name: string;
  recipe: string[];
  calories: number;
};

async function fetchRecipes(
  ingredients: string[],
  allergies: string[],
  cuisines: string[],
  mealTypes: string[],
  diet: string
): Promise<foodRecipe[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const response = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients,
        allergies,
        cuisines,
        mealType: mealTypes,
        diet,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch recipes:", errorText);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

const getParamAsArray = (param: string | string[] | undefined): string[] => {
  if (Array.isArray(param)) {
    return param;
  }
  if (typeof param === "string") {
    return [param];
  }
  return [];
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let recipes: foodRecipe[] = [];

  const ingredients = getParamAsArray(searchParams?.ingredients);
  const allergies = getParamAsArray(searchParams?.allergies);
  const cuisines = getParamAsArray(searchParams?.cuisine);
  const mealTypes = getParamAsArray(searchParams?.mealType);
  const diet = (searchParams?.diet as string) || "";

  // Fetch recipes if ingredients are provided
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
