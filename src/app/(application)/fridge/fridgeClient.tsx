"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteIngredient, saveIngredients } from "./actions";
import { Plus, Search } from "lucide-react";
import { useFridge } from "@/app/context/FridgeContext";
import { ingredient } from "@/app/types/fridge";

export default function FridgeClient() {
  const { ingredients, setIngredients, addIngredient, removeIngredient } =
    useFridge();
  console.log("Fridge data:", ingredients);
  const [veggie, setVeggie] = useState<string>("");
  const [addedItem, setAddedItems] = useState<ingredient[]>([]);
  const [labels, setLabels] = useState<ingredient[]>(ingredients);

  const handleAddedItems = async () => {
    const trimmed = veggie.trim();
    if (!trimmed) return;
    setAddedItems((prev) => [
      ...prev,
      { fridge_id: String(Date.now()), name: trimmed },
    ]);
    setVeggie("");
  };

  const deleteItem = async (id: string) => {
    setAddedItems((prev) => prev.filter((i) => i.fridge_id !== id));
  };

  const handleSaveIngredient = async () => {
    const itemsToSave = addedItem.map((item) => ({ name: item.name }));
    if (itemsToSave.length === 0) return;
    const res = await saveIngredients(itemsToSave);
    if (res.success) {
    }
    setIngredients(itemsToSave);
    setAddedItems([]);
  };

  const handleDeleteIngredient = async (id: string) => {
    await deleteIngredient(id);
    setLabels((prev) => prev.filter((item) => item.fridge_id !== id));
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
                key={item.fridge_id}
                className="flex items-center gap-x-2 px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium"
              >
                {item.name}
                <button
                  onClick={() => deleteItem(String(item.fridge_id))}
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
                key={label.fridge_id}
                className="flex items-center gap-x-2 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-medium"
              >
                {label.name}
                <button
                  onClick={() => handleDeleteIngredient(label.fridge_id)}
                  className="text-amber-100 hover:text-white font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
