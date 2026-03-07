"use client";

import * as React from "react";
import { type DateRange, type Mode } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Item } from "../fridge/page";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { foodRecipe } from "@/app/types/recipe";
import { cn } from "@/lib/utils";

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

  const filterButtonClass = (selectedState: boolean) =>
    cn(
      "flex-grow border transition-colors",
      selectedState
        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
        : "border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
    );

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
    <div className="flex h-screen w-full flex-row gap-4 overflow-hidden bg-background p-3">
      <div className="flex w-1/2 flex-col gap-4 overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-lg shadow-black/5">
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
          className="w-full"
        />
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Diet Preference
          </label>
          <Button
            onClick={handleDietToggle}
            variant="outline"
            className={`w-full h-12 flex items-center justify-center gap-x-3 text-lg font-semibold ${
              dietPreference === "veg"
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : dietPreference === "non-veg"
                  ? "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:text-secondary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                dietPreference == "veg"
                  ? "border-emerald-700"
                  : dietPreference == "non-veg"
                    ? "border-rose-700"
                    : "border-muted-foreground/40"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  dietPreference == "veg"
                    ? "bg-emerald-700"
                    : dietPreference == "non-veg"
                      ? "bg-rose-700"
                      : "bg-muted-foreground/40"
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
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Meal Type
          </label>
          <div className="flex justify-between w-full gap-4">
            {MEAL_TYPE_OPTIONS.map((meal) => (
              <Button
                key={meal}
                onClick={() => handleToggle(meal, mealTypes, setMealTypes)}
                variant="outline"
                className={filterButtonClass(mealTypes.includes(meal))}
              >
                {meal}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
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
                className={filterButtonClass(
                  selectedCuisines.includes(cuisine),
                )}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="mt-auto flex w-full cursor-pointer items-center gap-x-2 p-6 text-lg font-semibold"
          onClick={handlePlan}
        >
          Plan Meal
        </Button>
      </div>

      <div className="flex w-1/2 flex-col p-2">
        <div className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-lg shadow-black/5">
          {!loading && recipes.length == 0 && (
            <>
              <div className="flex h-1/3 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground shadow-sm">
                Breakfast
              </div>
              <div className="flex h-1/3 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground shadow-sm">
                Lunch
              </div>
              <div className="flex h-1/3 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground shadow-sm">
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
                  className="flex h-1/3 w-full flex-row gap-4 rounded-xl border border-border bg-muted/30 p-6 shadow-sm"
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
                className="flex h-1/3 w-full flex-col overflow-hidden rounded-xl border border-border bg-muted/20 p-4 shadow-sm"
              >
                <div className="flex flex-row h-full w-full gap-4">
                  <div className="w-1/4 break-words font-bold text-card-foreground">
                    {recipe.name}
                  </div>

                  <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <ul className="list-none space-y-2">
                      {recipe.recipe.map((step, stepIdx) => (
                        <li
                          key={stepIdx}
                          className="flex gap-x-3 text-xs leading-relaxed text-muted-foreground"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-accent text-[10px] font-bold text-accent-foreground">
                            {stepIdx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-16 text-right text-xs font-semibold text-primary">
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
