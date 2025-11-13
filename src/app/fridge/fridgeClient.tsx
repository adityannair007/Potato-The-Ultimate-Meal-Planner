"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteIngredient, saveIngredients } from "../main/actions";
import { useRouter } from "next/navigation";
import { type Item } from "./page";
import { Plus, Search } from "lucide-react";

type FridgeClientProps = {
  initialFridgeItems: Item[];
  initialAllergens: Item[];
  initialCuisines: Item[];
};

type DietPreference = "veg" | "non-veg" | null;

const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner"];
const CUISINE_OPTIONS = [
  "Indian",
  "Italian",
  "Chinese",
  "Moroccan",
  "Japanese",
  "Korean",
];

export default function FridgeClient({
  initialFridgeItems,
  initialAllergens,
  initialCuisines,
}: FridgeClientProps) {
  const router = useRouter();
  const [veggie, setVeggie] = useState<string>("");
  const [addedItem, setAddedItems] = useState<Item[]>([]);
  const [labels, setLabels] = useState<Item[]>(initialFridgeItems);

  const [allergen, setAllergen] = useState<Item[]>(initialAllergens);

  const [dietPreference, setDietPreference] = useState<DietPreference>(null);
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const handleAddedItems = async () => {
    const trimmed = veggie.trim();
    if (!trimmed) return;
    setAddedItems((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setVeggie("");
  };

  const deleteItem = async (id: number) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveIngredient = async () => {
    const itemsToSave = addedItem.map((item) => ({ name: item.name }));
    if (itemsToSave.length === 0) return;
    await saveIngredients(itemsToSave);
    const newItemsWithTempIds = addedItem.map((item) => ({
      ...item,
      id: Date.now(),
    }));
    setLabels((prev) => [...prev, ...newItemsWithTempIds]);
    setAddedItems([]);
  };

  const handleDeleteIngredient = async (id: number) => {
    await deleteIngredient(id);
    setLabels((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDietToggle = () => {
    setDietPreference((prev) => {
      if (prev === null) return "veg";
      if (prev === "veg") return "non-veg";
      return null;
    });
  };
  const handleToggle = (
    item: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setter((prev) => prev.filter((i) => i !== item));
    } else {
      setter((prev) => [...prev, item]);
    }
  };

  const handleFindRecipes = () => {
    const allIngredients = [
      ...labels.map((item) => item.name),
      ...addedItem.map((item) => item.name),
    ];
    const allAllergens = allergen.map((item) => item.name);

    const params = new URLSearchParams();

    allIngredients.forEach((item) => params.append("ingredients", item));
    allAllergens.forEach((item) => params.append("allergies", item));
    mealTypes.forEach((meal) => params.append("mealType", meal));
    selectedCuisines.forEach((cuisine) => params.append("cuisine", cuisine));

    if (dietPreference) {
      params.set("diet", dietPreference);
    }

    router.push(`/home?${params.toString()}`);
  };

  return (
    <div className="flex flex-row w-full min-h-full p-8 gap-x-8 bg-green-50">
      <div className="flex flex-col p-6 w-1/2 bg-white shadow-lg rounded-2xl gap-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
          Manage Your Fridge
        </h2>

        <div className="flex gap-x-2">
          <Input
            value={veggie}
            onChange={(e) => setVeggie(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddedItems();
            }}
            placeholder="Add an ingredient to your tray..."
            className="flex-grow"
          />
          <Button
            onClick={handleAddedItems}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tray (Items to add)
          </label>
          <div className="flex flex-wrap gap-2 p-4 min-h-[80px] w-full bg-gray-50 border rounded-lg">
            {addedItem.length === 0 && (
              <span className="text-gray-400">Your tray is empty.</span>
            )}
            {addedItem.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-x-2 px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium"
              >
                {item.name}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-green-700 hover:text-green-900 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {addedItem.length > 0 && (
            <Button
              onClick={handleSaveIngredient}
              variant="outline"
              className="w-full mt-2 text-amber-800 border-amber-800 hover:bg-amber-50"
            >
              Add Tray to Fridge
            </Button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items in Fridge
          </label>
          <div className="flex flex-wrap gap-2 p-4 min-h-[120px] w-full bg-gray-50 border rounded-lg">
            {labels.length === 0 && (
              <span className="text-gray-400">Your fridge is empty.</span>
            )}
            {labels.map((label) => (
              <span
                key={label.id}
                className="flex items-center gap-x-2 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-medium"
              >
                {label.name}
                <button
                  onClick={() => handleDeleteIngredient(label.id)}
                  className="text-amber-100 hover:text-white font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col p-6 w-1/2 bg-white shadow-lg rounded-2xl gap-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
          Find a Recipe
        </h2>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diet Preference
          </label>
          <Button
            onClick={handleDietToggle}
            className={`w-full h-12 flex items-center justify-center gap-x-3 text-lg font-semibold ${
              dietPreference === "veg"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : dietPreference === "non-veg"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                dietPreference ? "border-white" : "border-gray-400"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  dietPreference ? "bg-white" : "bg-gray-400"
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
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPE_OPTIONS.map((meal) => (
              <Button
                key={meal}
                onClick={() => handleToggle(meal, mealTypes, setMealTypes)}
                variant="outline"
                className={`flex-grow ${
                  mealTypes.includes(meal)
                    ? "bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                    ? "bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleFindRecipes}
          className="w-full bg-amber-600 text-white hover:bg-amber-700 p-6 text-lg font-bold mt-auto flex items-center gap-x-2" // Amber
        >
          <Search size={20} />
          Find Recipes
        </Button>
      </div>
    </div>
  );
}
