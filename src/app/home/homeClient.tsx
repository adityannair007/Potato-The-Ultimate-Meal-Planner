"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChefHat, Flame, Utensils, RefreshCw } from "lucide-react";

// Assuming foodRecipe is imported or defined locally
type foodRecipe = {
  name: string;
  recipe: string[];
  calories: number;
};

export default function HomeClient({ recipes }: { recipes: foodRecipe[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      // Re-pushing to the same route triggers the Server Component's fetchRecipes
      router.push(`/home?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-y-8 animate-in fade-in duration-500">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <p className="text-gray-500 italic">
          Based on your selection, we found {recipes.length} dishes.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="flex items-center gap-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isPending ? "animate-spin" : ""} />
          {isPending ? "Chef is cooking..." : "Generate New Recipes"}
        </button>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="group bg-white rounded-3xl shadow-lg border border-green-100 p-6 flex flex-col gap-y-5 hover:border-amber-200 transition-colors"
          >
            {/* Header: Title & Calories */}
            <div className="flex justify-between items-start gap-x-2">
              <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-amber-700 transition-colors">
                {recipe.name}
              </h3>
              <div className="flex items-center gap-x-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                <Flame size={14} />
                {recipe.calories} kcal
              </div>
            </div>

            <hr className="border-green-50" />

            {/* Content: Instructions */}
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-x-2 text-green-700 font-bold text-sm uppercase tracking-wider">
                <ChefHat size={18} />
                Instructions
              </div>
              <ol className="space-y-4">
                {recipe.recipe.map((step, stepIdx) => (
                  <li
                    key={stepIdx}
                    className="flex gap-x-4 text-gray-600 text-sm leading-relaxed"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-800 rounded-lg font-bold text-xs">
                      {stepIdx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
