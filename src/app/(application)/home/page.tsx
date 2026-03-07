import HomeClient from "./homeClient";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { foodRecipe } from "@/app/types/recipe";

let fetching = false;

// 2. Fetch function (Helper)
async function fetchRecipes(
  labels: string[],
  allergen: string[],
  cuisine: string[],
  mealType: string[],
  diet: string,
): Promise<foodRecipe[]> {
  if (labels.length === 0 || fetching) return [];

  fetching = true;

  try {
    // Note: process.env.NEXT_PUBLIC_URL must be defined or it defaults to localhost
    const apiUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const res = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        ingredients: labels,
        allergies: allergen,
        cuisine,
        mealType,
        diet,
      }),

      next: { revalidate: 60, tags: ["recipes"] },
    });

    if (!res.ok) {
      if (res.status == 429) {
        console.log("Gemini is overwhelmed! wait 2 seconds!");
      }
      return [];
    }

    const food = await res.json();
    return food.items || [];
  } catch (error) {
    console.error("Error in fetchRecipes: ", error);
    return [];
  } finally {
    setTimeout(() => {
      fetching = false;
    }, 2000);
  }
}

// 3. Helper for searchParams
const getParamAsArray = (param: string | string[] | undefined): string[] => {
  if (Array.isArray(param)) return param;
  if (typeof param === "string") return [param];
  return [];
};

// 4. THE FIX: Ensure this is "export default async function..."
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | any;
}) {
  // In Next.js 15, searchParams is a Promise. We must await it.
  const resolvedParams = await searchParams;

  const ingredients = getParamAsArray(resolvedParams?.ingredients);
  const allergies = getParamAsArray(resolvedParams?.allergies);
  const cuisines = getParamAsArray(resolvedParams?.cuisine);
  const mealTypes = getParamAsArray(resolvedParams?.mealType);
  const diet = (resolvedParams?.diet as string) || "";

  let recipes: foodRecipe[] = [];

  if (ingredients.length > 0) {
    recipes = await fetchRecipes(
      ingredients,
      allergies,
      cuisines,
      mealTypes,
      diet,
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-y-6 bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground">Your Recipes</h1>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-y-4 rounded-2xl border border-border bg-card p-10 shadow-lg shadow-black/5">
          <AlertTriangle size={48} className="text-primary" />
          <h2 className="text-xl font-semibold text-card-foreground">
            No Recipes Found
          </h2>
          <p className="text-center text-muted-foreground">
            Try adding more items from your{" "}
            <Link
              href="/fridge"
              className="font-medium text-primary hover:underline"
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
