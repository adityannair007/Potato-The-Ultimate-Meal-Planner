"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChefHat, Flame, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

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
        <p className="italic text-muted-foreground">
          Based on your selection, we found {recipes.length} dishes.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="rounded-xl px-5 py-2 font-bold shadow-md shadow-black/5"
        >
          <RefreshCw size={18} className={isPending ? "animate-spin" : ""} />
          {isPending ? "Chef is cooking..." : "Generate New Recipes"}
        </Button>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="group flex flex-col gap-y-5 rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/5 transition-colors hover:border-ring/50"
          >
            {/* Header: Title & Calories */}
            <div className="flex justify-between items-start gap-x-2">
              <h3 className="text-xl font-extrabold text-card-foreground transition-colors group-hover:text-primary">
                {recipe.name}
              </h3>
              <div className="flex items-center gap-x-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                <Flame size={14} />
                {recipe.calories} kcal
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Content: Instructions */}
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-x-2 text-sm font-bold uppercase tracking-wider text-primary">
                <ChefHat size={18} />
                Instructions
              </div>
              <ol className="space-y-4">
                {recipe.recipe.map((step, stepIdx) => (
                  <li
                    key={stepIdx}
                    className="flex gap-x-4 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-foreground">
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
