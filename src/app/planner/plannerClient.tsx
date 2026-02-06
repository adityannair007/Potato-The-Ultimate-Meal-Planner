"use client";

import * as React from "react";
import { type DateRange, type Mode } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Item } from "../fridge/page";
import { foodRecipe } from "../types/recipe";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DietPreference = "veg" | "non-veg" | null;

type PlannerClientProps = {
  initialFridgeItems: Item[];
  initialAllergens: Item[];
};

export default function PlannerClient({
  initialFridgeItems,
  initialAllergens,
}: PlannerClientProps) {
  const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner"];
  const CUISINE_OPTIONS = [
    "Indian",
    "Italian",
    "Chinese",
    "Moroccan",
    "Japanese",
    "Korean",
  ];
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("single");
  const [dietPreference, setDietPreference] = useState<DietPreference>(null);
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>({
    from: new Date(),
    to: new Date(),
  });
  const [recipes, setRecipes] = useState<foodRecipe[]>([]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSelected(undefined);
  };

  const handleToggle = (
    item: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.includes(item)) {
      setter((prev) => prev.filter((i) => i !== item));
    } else {
      setter((prev) => [...prev, item]);
    }
  };

  const handleDietToggle = () => {
    setDietPreference((prev) => {
      if (prev === null) return "veg";
      if (prev === "veg") return "non-veg";
      return null;
    });
  };

  async function handlePlan() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          ingredients: initialFridgeItems,
          allergies: initialAllergens,
          cuisine: selectedCuisines,
          mealType: mealTypes,
          diet: dietPreference,
        }),
      });

      if (!res.ok) {
        console.log("Recipes can't be generated!");
        return [];
      }

      const food = await res.json();

      const foodToAdd = Array.isArray(food.items) ? food.items : [];
      console.log(foodToAdd);
      setRecipes(foodToAdd);
      return foodToAdd;
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-row p-3 w-full h-screen gap-4 overflow-hidden">
      <div className="flex flex-col w-1/2 p-2 gap-4 overflow-y-auto">
        <div className="flex gap-2 mb-2">
          <Button
            variant={mode === "single" ? "default" : "outline"}
            onClick={() => handleModeChange("single")}
          >
            Single
          </Button>
          <Button
            variant={mode === "multiple" ? "default" : "outline"}
            onClick={() => handleModeChange("multiple")}
          >
            Multiple
          </Button>
          <Button
            variant={mode === "range" ? "default" : "outline"}
            onClick={() => handleModeChange("range")}
          >
            Range
          </Button>
        </div>

        <Calendar
          mode={mode as any}
          selected={selected}
          onSelect={setSelected}
          numberOfMonths={1}
          className="rounded-lg border shadow-sm w-full bg-amber-100"
          buttonVariant={"amber"}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diet Preference
          </label>
          <Button
            onClick={handleDietToggle}
            variant="outline"
            className={`w-full h-12 flex items-center justify-center gap-x-3 text-lg font-semibold ${
              dietPreference === "veg"
                ? "bg-amber-300 hover:bg-amber-400 hover:text-amber-700 text-amber-700 border-amber-600"
                : dietPreference === "non-veg"
                  ? "bg-amber-300 hover:bg-amber-400 hover:text-amber-700 text-amber-700 border-amber-600"
                  : "bg-amber-100 text-orange-300 hover:bg-amber-200 hover:text-amber-700"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                dietPreference == "veg"
                  ? "border-green-700 hover:border-amber-700"
                  : dietPreference == "non-veg"
                    ? "border-red-700 hover:border-amber-700"
                    : "border-orange-300 hover:border-amber-700"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  dietPreference == "veg"
                    ? "bg-green-700 hover:bg-amber-700"
                    : dietPreference == "non-veg"
                      ? "bg-red-700 hover:bg-amber-700"
                      : "bg-orange-300 hover:bg-amber-700"
                }`}
              ></div>
            </div>
            {dietPreference === "veg"
              ? "Veg"
              : dietPreference === "non-veg"
                ? "Non-Veg"
                : "Select Diet"}
          </Button>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </label>
          <div className="flex justify-between w-full gap-4">
            {MEAL_TYPE_OPTIONS.map((meal) => (
              <Button
                key={meal}
                onClick={() => handleToggle(meal, mealTypes, setMealTypes)}
                variant="outline"
                className={`flex-grow cursor-pointer ${
                  mealTypes.includes(meal)
                    ? "bg-amber-300 text-amber-700 hover:bg-amber-400 hover:text-amber-800 border-amber-600"
                    : "bg-amber-100 text-orange-400 hover:bg-amber-200 hover:text-amber-700"
                }`}
              >
                {meal}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <Button
                key={cuisine}
                onClick={() =>
                  handleToggle(cuisine, selectedCuisines, setSelectedCuisines)
                }
                variant="outline"
                className={`flex-grow ${
                  selectedCuisines.includes(cuisine)
                    ? "bg-amber-300 text-amber-700 hover:bg-amber-400 hover:text-amber-800 border-amber-600"
                    : "bg-amber-100 text-orange-400 hover:bg-amber-200 hover:text-amber-700"
                }`}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="w-full cursor-pointer bg-amber-600 text-white hover:bg-amber-700 p-6 text-lg font-semibold mt-auto flex items-center gap-x-2"
          onClick={handlePlan}
        >
          Plan Meal
        </Button>
      </div>

      <div className="flex flex-col w-1/2 p-2">
        <div className="flex flex-col gap-4 p-4 h-full rounded-xl bg-amber-300 shadow-lg overflow-hidden">
          {!loading && recipes.length == 0 && (
            <>
              <div className="flex flex-col justify-center h-1/3 items-center rounded-xl text-amber-500 bg-amber-200 border border-amber-400 shadow-lg">
                Breakfast
              </div>
              <div className="flex flex-col justify-center h-1/3 items-center rounded-xl text-amber-500 bg-amber-200 border border-amber-400 shadow-lg">
                Lunch
              </div>
              <div className="flex flex-col justify-center h-1/3 items-center rounded-xl text-amber-500 bg-amber-200 border border-amber-400 shadow-lg">
                Dinner
              </div>
            </>
          )}
          {loading &&
            Array(3)
              .fill(0)
              .map((_, ind) => (
                <Card
                  key={ind}
                  className="flex flex-row w-full h-1/3 p-6 gap-4 rounded-xl bg-amber-200 border border-amber-400 shadow-lg"
                >
                  <Skeleton className="size-20 shrink-0 rounded-half" />
                  <div className="flex flex-col gap-2 w-full">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </Card>
              ))}
          {!loading &&
            recipes.length > 0 &&
            recipes?.map((recipe, index) => (
              <div
                key={index}
                /* Added overflow-hidden to the parent to keep the rounded corners clean */
                className="flex flex-col h-1/3 w-full p-4 rounded-xl bg-amber-200 border border-amber-400 shadow-lg overflow-hidden"
              >
                <div className="flex flex-row h-full w-full gap-4">
                  {/* Name: Set a width so it doesn't get squashed */}
                  <div className="font-bold text-amber-900 w-1/4 break-words">
                    {recipe.name}
                  </div>

                  {/* Recipe Steps: The scrollable area */}
                  <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <ul className="list-none space-y-2">
                      {recipe.recipe.map((step, stepIdx) => (
                        <li
                          key={stepIdx}
                          className="flex gap-x-3 text-gray-700 text-xs leading-relaxed"
                        >
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-green-100 text-green-800 rounded font-bold text-[10px]">
                            {stepIdx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Calories: Fixed width on the right */}
                  <div className="text-xs font-semibold text-amber-800 w-16 text-right">
                    {recipe.calories}{" "}
                    <span className="block text-[10px]">kcal</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
