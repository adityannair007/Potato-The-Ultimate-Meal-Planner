"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAllergy, saveAllergies, logout } from "../home/actions";
import { type Item } from "./page";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProfileClientProps = {
  initialAllergies: Item[];
};

export default function ProfileClient({
  initialAllergies,
}: ProfileClientProps) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState<number>();
  const [haveGoal, setHaveGoal] = useState<boolean>(false);
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 p-10 bg-amber-900 text-amber-50 flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-amber-700 flex items-center justify-center border-4 border-amber-600 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <span className="text-5xl font-black text-amber-100 -rotate-3 group-hover:rotate-0 transition-transform">
                  U
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-amber-900 rounded-full"></div>
            </div>

            <div className="mt-8 w-full space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  DisplayName
                </label>
                <Input
                  className="bg-amber-800/50 border-none text-white placeholder:text-amber-600 h-12 text-lg focus-visible:ring-amber-400"
                  placeholder="Enter Username"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Weight
                  </label>
                  <div className="flex bg-amber-800/50 rounded-md overflow-hidden">
                    <Input
                      type="number"
                      className="bg-transparent border-none text-amber focus-visible:ring-0"
                      placeholder="68"
                    />
                    <Select defaultValue="kg">
                      <SelectTrigger className="w-20 bg-amber-700 border-none text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Height
                  </label>
                  <div className="flex items-center bg-amber-800/50 rounded-md pr-3">
                    <Input
                      type="number"
                      className="bg-transparent border-none text-white focus-visible:ring-0"
                      placeholder="175"
                    />
                    <span className="text-xs font-bold text-amber-500">CM</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Gender
                  </label>
                  <Select>
                    <SelectTrigger className="w-39 bg-amber-700 border-none text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Age
                  </label>
                  <Input
                    type="number"
                    className="bg-amber-800/50 border-none text-white"
                    placeholder="23"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Goals & Lifestyle */}
          <div className="flex-1 p-10 flex flex-col justify-between space-y-10">
            {/* Goal Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                Fitness Objective
              </h3>
              <div className="flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    defaultValue="maintain"
                    onValueChange={(value) => setHaveGoal(value === "goal")}
                  >
                    <SelectTrigger className="h-12 border-2 focus:ring-amber-500">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintain">
                        Maintain Current Weight
                      </SelectItem>
                      <SelectItem value="goal">Reach Target Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {haveGoal && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-24 h-12 border-2 text-center text-xl font-bold"
                      placeholder="70"
                    />
                    <span className="font-bold text-gray-400">KG</span>
                  </div>
                )}
              </div>
            </section>

            {/* Allergy Management */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                Dietary Constraints
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Peanuts, Shellfish..."
                    className="h-12 border-2 focus-visible:ring-orange-500"
                    value={allergy}
                    onChange={(e) => setAllergy(e.target.value)}
                  />
                  <Button
                    onClick={handleAddedAllergies}
                    className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600 hover:shadow-amber-700"
                  >
                    Add
                  </Button>
                </div>

                <div className="w-full h-40 p-6 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl overflow-y-auto">
                  <div className="flex flex-wrap gap-3">
                    {savedAllergies.length === 0 &&
                      addedAllergy.length === 0 && (
                        <p className="text-orange-300 italic text-sm">
                          No restrictions listed. Eat safe!
                        </p>
                      )}

                    {savedAllergies.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold text-orange-800 shadow-sm transition-all hover:border-orange-400"
                      >
                        {item.name}
                        <button
                          onClick={() => handleDeleteFromDb(item.id)}
                          className="text-orange-300 hover:text-red-500 transition-colors"
                        >
                          x
                        </button>
                      </div>
                    ))}

                    {addedAllergy.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-200 rounded-xl text-sm font-bold text-orange-900 animate-in fade-in zoom-in duration-300"
                      >
                        {item.name}
                        <button
                          onClick={() =>
                            setAddedAllergies((prev) =>
                              prev.filter((a) => a.id !== item.id),
                            )
                          }
                          className="hover:text-red-600"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all px-6"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
              <Button
                onClick={handleSaveToDb}
                className="px-10 h-14 bg-amber-900 text-white text-lg font-bold rounded-2xl shadow-lg shadow-amber-700 hover:bg-amber-800 hover:-translate-y-1 transition-all"
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
