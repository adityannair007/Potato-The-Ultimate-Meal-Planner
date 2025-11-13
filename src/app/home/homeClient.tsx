"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type foodRecipe = {
  name: string;
  recipe: string[];
  calories: number;
};

type HomeClientProps = {
  recipes: foodRecipe[];
};

export default function HomeClient({ recipes }: HomeClientProps) {
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const toggleVisibility = (index: number) => {
    setVisibleIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex flex-col gap-y-4">
      {recipes.map((food, index) => {
        const isVisible = visibleIndexes.includes(index);
        return (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300"
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleVisibility(index)}
            >
              <h2 className="text-2xl font-bold text-amber-900">{food.name}</h2>

              {isVisible ? (
                <ChevronDown className="text-amber-900" />
              ) : (
                <ChevronRight className="text-amber-900" />
              )}
            </div>

            {isVisible && (
              <div className="p-6 border-t border-gray-200 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Recipe Steps:
                </h3>

                <ol className="list-decimal list-inside flex flex-col gap-y-2 text-gray-600">
                  {food.recipe.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>

                <div className="mt-6">
                  <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium">
                    {food.calories} Calories
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
