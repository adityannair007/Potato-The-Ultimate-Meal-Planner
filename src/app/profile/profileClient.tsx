// app/home/profile/ProfileClient.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import shadcn Input
import { deleteAllergy, saveAllergies, logout } from "../main/actions";
import { type Item } from "./page";
import { LogOut } from "lucide-react"; // Optional: for an icon

type ProfileClientProps = {
  initialAllergies: Item[];
};

export default function ProfileClient({
  initialAllergies,
}: ProfileClientProps) {
  const [allergy, setAllergy] = useState<string>("");
  const [addedAllergy, setAddedAllergies] = useState<Item[]>([]);
  const [savedAllergies, setSavedAllergies] =
    useState<Item[]>(initialAllergies);

  const handleAddedAllergies = () => {
    const trimmed = allergy.trim();
    if (!trimmed) return;
    setAddedAllergies((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setAllergy("");
  };

  const handleSaveToDb = async () => {
    const allergyNames = addedAllergy.map((item) => ({ name: item.name }));
    if (allergyNames.length === 0) return;
    await saveAllergies(allergyNames);
    setSavedAllergies((prev) => [...prev, ...addedAllergy]);
    setAddedAllergies([]);
  };

  const handleDeleteFromDb = async (id: number) => {
    await deleteAllergy(id);
    setSavedAllergies((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    // Main container with a soft, neutral background
    <div className="flex w-full h-full items-center justify-center p-8 bg-amber-50">
      {/* Profile Card */}
      <div className="flex flex-col items-center w-full max-w-md p-8 bg-white shadow-lg rounded-2xl gap-y-6">
        {/* Avatar Placeholder */}
        <div className="w-28 h-28 rounded-full bg-amber-600 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">U</span>{" "}
          {/* Placeholder */}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">Your Profile</h2>

        {/* Add Allergy Section */}
        <div className="w-full">
          <label
            htmlFor="allergy-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Add Allergy
          </label>
          <div className="flex gap-x-2">
            <Input
              id="allergy-input"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddedAllergies();
              }}
              placeholder="e.g., Peanuts"
              className="flex-grow"
            />
            <Button
              onClick={handleAddedAllergies}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Allergies List Section */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Allergies
          </label>
          {/* This box will contain all the allergy tags */}
          <div className="flex flex-wrap gap-2 p-4 min-h-[80px] w-full bg-gray-50 border rounded-lg">
            {savedAllergies.length === 0 && addedAllergy.length === 0 && (
              <span className="text-gray-400">No allergies added yet.</span>
            )}

            {/* Saved Allergies (from DB) - solid color */}
            {savedAllergies.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-x-2 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-medium"
              >
                {item.name}
                <button
                  onClick={() => handleDeleteFromDb(item.id)}
                  className="text-amber-100 hover:text-white font-bold"
                >
                  &times;
                </button>
              </span>
            ))}

            {/* "Tray" of new allergies - lighter color */}
            {addedAllergy.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-x-2 px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium"
              >
                {item.name}
                <button
                  onClick={() =>
                    setAddedAllergies((prev) =>
                      prev.filter((a) => a.id !== item.id)
                    )
                  }
                  className="text-amber-700 hover:text-amber-900 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-y-3 mt-4">
          <Button
            onClick={handleSaveToDb}
            className="w-full bg-amber-900 text-amber-100 hover:bg-amber-800"
            disabled={addedAllergy.length === 0} // Disable if nothing to save
          >
            Save New Allergies
          </Button>

          <Button
            onClick={() => logout()}
            variant="outline" // Use shadcn outline style
            className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-x-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
