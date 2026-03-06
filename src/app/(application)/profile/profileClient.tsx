"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GiPotato } from "react-icons/gi";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { user } from "../../types/user";
import * as motion from "motion/react-client";
import { logout, updateUserDetails, uploadAvatar } from "./actions";
import Image from "next/image";
import { useUser } from "../../context/UserContext";
import { allergy } from "@/app/types/allergy";

export default function ProfileClient() {
  const { user, setUser } = useUser();

  //draft implementation
  const [draft, setDraft] = useState<Partial<user>>({});
  const getInputValue = (key: keyof Omit<user, "allergies">) => {
    const value = draft[key] ?? user?.[key];
    return value ?? "";
  };
  const [tempPicture, setTempPicture] = useState<{
    tempFile: File | null;
    previewUrl: string | null;
  }>({
    tempFile: null,
    previewUrl: null,
  });
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const hasGoal = getInputValue("weight") !== getInputValue("weight_goal");
  const [allergy, setAllergy] = useState<string>("");
  const [addedAllergy, setAddedAllergies] = useState<allergy[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  console.log("User allergies:", user?.allergies);
  const currentAllergies = useMemo(() => {
    const saved =
      user?.allergies.filter((a) => !removedIds.includes(a.allergy_id)) || [];
    return [...saved, ...addedAllergy];
  }, [user, removedIds, addedAllergy]);

  const handleSaveDraft = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setDraft((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const kgToLbs = (unit: "kg" | "lbs") => {
    const weight = Number(getInputValue("weight")) ?? null;
    if (unit === "lbs" && weight) {
      const weightInLbs = Math.round(weight * 2.204);
      setDraft((p) => ({ ...p, weight: weightInLbs }));
      setUnit("lbs");
    } else if (unit === "kg" && weight) {
      const weightInKg = Math.round(weight / 2.204);
      setDraft((p) => ({ ...p, weight: weightInKg }));
      setUnit("kg");
    }
  };

  const handleSaveToDb = async () => {
    setIsUpdating(true);
    try {
      let current_avatar = user?.avatar_url || "";
      if (tempPicture.tempFile) {
        const formData = new FormData();
        formData.append("avatar", tempPicture.tempFile);
        const res = await uploadAvatar(formData);
        if (res.success) {
          current_avatar = res.url;
        }
      }

      const isLbs = unit === "lbs";

      const payload = {
        ...user,
        ...draft,
        avatar_url: current_avatar,
        weight: isLbs
          ? Math.round(Number(getInputValue("weight")) / 2.204)
          : getInputValue("weight"),
        newAllergies: addedAllergy.map((a) => a.name.toLowerCase()),
        toDelete: removedIds,
      };

      const res = await updateUserDetails(payload);
      if (res.success) {
        setUser({
          ...payload,
          allergies: currentAllergies,
        } as user);
        setDraft({});
        setAddedAllergies([]);
        setRemovedIds([]);
        setTempPicture({ tempFile: null, previewUrl: null });
        setUnit("kg");
        console.log("Profile update successful!!");
      }
      console.log("end of handle fucntion!!!");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const capitalize = (allergy: string): string => {
    return allergy.charAt(0).toUpperCase() + allergy.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 p-10 bg-amber-900 text-amber-50 flex flex-col items-center">
            <div className="relative group">
              <motion.div
                whileHover={{ rotate: 7, scale: 1.1 }}
                whileTap={{
                  scale: 0.9,
                }}
                className="w-32 h-32 rounded-3xl bg-amber-700 flex items-center justify-center border-4 border-amber-600 shadow-xl"
              >
                {tempPicture.previewUrl || user?.avatar_url ? (
                  <Image
                    src={tempPicture.previewUrl || (user?.avatar_url as string)}
                    fill
                    className="object-cover p-2 border-2 border-amber-600 bg-amber-600 rounded-3xl"
                    alt="Profile Picture"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-6xl text-amber-200">
                    <GiPotato />
                  </div>
                )}
                <input
                  type="file"
                  id="avatar"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setTempPicture({
                        tempFile: file,
                        previewUrl: URL.createObjectURL(file),
                      });
                  }}
                />

                <label
                  htmlFor="avatar"
                  className="absolute inset-0 cursor-pointer flex items-center justify-center rounded-3xl"
                ></label>
              </motion.div>
            </div>

            <div className="mt-8 w-full space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  DisplayName
                </label>
                <Input
                  className="bg-amber-800/50 border-none text-white placeholder:text-amber-600 h-12 text-lg focus-visible:ring-amber-600"
                  placeholder="Enter Username"
                  name="username"
                  value={getInputValue("username") || ""}
                  onChange={handleSaveDraft}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Weight
                  </label>
                  <div className="flex bg-amber-800/50 rounded-md overflow-hidden border-none">
                    <Input
                      type="number"
                      name="weight"
                      className="bg-transparent border-none text-amber focus-visible:ring-1 focus-visible:ring-amber-600"
                      placeholder="68"
                      value={getInputValue("weight")}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          weight: Number(e.target.value),
                        }))
                      }
                    />
                    <Select value={unit} onValueChange={kgToLbs}>
                      <SelectTrigger className="w-20 bg-transparent border-none text-xs font-bold tracking-wide text-amber-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">KG</SelectItem>
                        <SelectItem value="lbs">LBS</SelectItem>
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
                      name="height"
                      value={getInputValue("height")}
                      className="bg-transparent border-none text-white focus-visible:ring-1 focus-visible:ring-amber-600"
                      placeholder="175"
                      onChange={handleSaveDraft}
                    />
                    <span className="text-xs font-bold pl-1 text-amber-500">
                      CM
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Gender
                  </label>
                  <Select
                    value={String(getInputValue("gender"))}
                    onValueChange={(value) =>
                      setDraft((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger className="w-39 bg-amber-700 border-none text-xs focus-visible:ring-1 focus-visible:ring-amber-600">
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
                    name="age"
                    value={getInputValue("age")}
                    onChange={handleSaveDraft}
                    className="bg-amber-800/50 border-none text-white focus-visible:ring-1 focus-visible:ring-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-10 flex flex-col justify-between space-y-10">
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                Fitness Objective
              </h3>
              <div className="flex flex-wrap items-end gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={hasGoal ? "goal" : "maintain"}
                    onValueChange={(v) =>
                      setDraft((prev) => ({
                        ...prev,
                        weight_goal:
                          v === "maintain"
                            ? Number(getInputValue("weight"))
                            : 0,
                      }))
                    }
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

                {hasGoal && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      name="weight_goal"
                      className="w-24 h-12 border-2 text-center text-xl font-bold"
                      placeholder="70"
                      onChange={handleSaveDraft}
                      value={getInputValue("weight_goal") || ""}
                    />
                    <span className="font-bold text-gray-400">KG</span>
                  </div>
                )}
              </div>
            </section>

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
                    onClick={() => {
                      if (allergy) {
                        setAddedAllergies((prev) => [
                          ...prev,
                          { allergy_id: `temp-${Date.now()}`, name: allergy },
                        ]);
                        setAllergy("");
                      }
                    }}
                    className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600 hover:shadow-amber-700 cursor-pointer"
                  >
                    Add
                  </Button>
                </div>

                {/* <div className="w-full h-40 p-6 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl overflow-y-auto">
                  <div className="flex flex-wrap gap-3">
                    {currentAllergies.length === 0 &&
                      currentAllergies.map((a) => (
                        <div
                        key={item.id}
                        className="group flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold text-orange-800 shadow-sm transition-all hover:border-orange-400"
                      >
                        {capitalize(item.name)}
                        <button
                          onClick={() => handleDeleteFromDb(item.id)}
                          className="text-orange-300 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          x
                        </button>
                      </div>
                      )) === 0 && (
                        <p className="text-orange-300 italic text-sm">
                          No restrictions listed. Eat safe!
                        </p>
                      )}
                    {savedAllergies.map((item) => (
                      
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
                          className="hover:text-red-600 cursor-pointer"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div> */}
                <div className="flex flex-wrap gap-2 p-4 bg-orange-50/30 rounded-2xl min-h-[100px] border-2 border-dashed border-orange-100">
                  {currentAllergies.map((a) => (
                    <span
                      key={a.allergy_id}
                      className="group flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold text-orange-800 shadow-sm transition-all hover:border-orange-400"
                    >
                      {capitalize(a.name)}
                      <Button
                        variant="ghost"
                        className="hover:text-red-600 cursor-pointer w-5 h-5"
                        onClick={() => {
                          if (a.allergy_id.startsWith("temp-"))
                            setAddedAllergies((p) =>
                              p.filter((na) => na.allergy_id !== a.allergy_id),
                            );
                          else setRemovedIds((p) => [...p, a.allergy_id]);
                        }}
                      >
                        x
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all px-6"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
              <motion.button
                whileHover={{ scale: 1.1, transition: { duration: 0.1 } }}
                whileTap={{
                  scale: 0.8,
                }}
                onClick={handleSaveToDb}
                className="px-10 h-14 bg-amber-900 text-white text-lg font-bold rounded-2xl shadow-lg shadow-amber-700 hover:bg-amber-800 hover:-translate-y-1 transition-all cursor-pointer"
              >
                Update Profile
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
