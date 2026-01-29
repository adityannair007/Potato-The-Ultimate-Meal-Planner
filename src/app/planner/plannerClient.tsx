"use client";

import * as React from "react";
import { type DateRange, type Mode } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PlannerClient() {
  const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner"];
  const CUISINE_OPTIONS = [
    "Indian",
    "Italian",
    "Chinese",
    "Moroccan",
    "Japanese",
    "Korean",
  ];
  const [mode, setMode] = useState<Mode>("single");
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>({
    from: new Date(),
    to: new Date(),
  });

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
                    ? "bg-amber-600 text-white hover:bg-amber-700 hover:text-white border-amber-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                    ? "bg-amber-600 text-white hover:bg-amber-700 hover:text-white border-amber-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>
        <Button className="w-full cursor-pointer bg-amber-600 text-white hover:bg-amber-700 p-6 text-lg font-semibold mt-auto flex items-center gap-x-2">
          Plan Meal
        </Button>
      </div>

      <div className="flex flex-col w-1/2 p-2">
        <div className="flex flex-col gap-4 p-4 h-full rounded-xl bg-amber-300 shadow-lg overflow-hidden">
          <div className="flex flex-col justify-center h-1/3 items-center rounded-xl bg-amber-200 border border-amber-400 shadow-lg"></div>
          <div className="flex h-1/3 rounded-xl bg-amber-200 shadow-lg border border-amber-400"></div>
          <div className="flex h-1/3 rounded-xl bg-amber-200 shadow-lg border border-amber-400"></div>
        </div>
      </div>
    </div>
  );
}
