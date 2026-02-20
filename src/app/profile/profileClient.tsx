"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GiPotato } from "react-icons/gi";

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
import { user } from "../types/user";

import * as motion from "motion/react-client";
import {
  deleteAllergy,
  logout,
  updateUserDetails,
  uploadAvatar,
} from "./actions";
import Image from "next/image";
import { useUser } from "../context/UserContext";

type ProfileClientProps = {
  initialData: user;
};

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const [profile, setProfile] = useState(initialData);
  const [tempPicture, setTempPicture] = useState({
    tempFile: null as File | null,
    previewUrl: initialData.avatar_url as string | null,
  });
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [haveGoal, setHaveGoal] = useState<boolean>(
    profile.weight != profile.weight_goal,
  );
  const [allergy, setAllergy] = useState<string>("");
  const [addedAllergy, setAddedAllergies] = useState<Item[]>([]);
  const [savedAllergies, setSavedAllergies] = useState(
    initialData.allergies.map((d: any) => ({
      id: d.allergy.allergy_id,
      name: d.allergy.name,
    })) || [],
  );
  const [removeAllergies, setRemoveAllergies] = useState<string[]>([]);
  const { user, setUser } = useUser();

  const kgToLbs = (newUnit: "kg" | "lbs") => {
    if (newUnit === unit) return;

    if (profile.weight == null || profile.weight == 0) return;

    let calculatedWeight: number;
    if (unit == "kg") {
      calculatedWeight = Math.round(profile.weight * 2.20462);
    } else {
      calculatedWeight = Math.round(profile.weight / 2.20462);
    }
    setUnit(newUnit);
    setProfile((prev) => ({ ...prev, weight: calculatedWeight }));
  };

  const handleSaveProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    console.log(haveGoal ? "has a goal" : "maintain weight");
    console.log("weight goal: ", profile.weight_goal);

    setProfile((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleAddedAllergies = () => {
    const trimmed = allergy.trim();
    console.log("trimmed allergy: ", trimmed);
    if (!trimmed) return;
    setAddedAllergies((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setAllergy("");
    console.log("Saved allergies:", savedAllergies);
    console.log("Initial data:", initialData);
  };

  const handleSaveToDb = async () => {
    try {
      let current_avatar = profile.avatar_url;
      //preview image to database table
      console.log("start of handle fucntion!!!");
      if (tempPicture.tempFile) {
        const formData = new FormData();
        formData.append("avatar", tempPicture.tempFile);

        const res = await uploadAvatar(formData);

        if (res.success) {
          current_avatar = res.url;
        }
        console.log("New changed avatar:", current_avatar);
      }

      const isLbs = unit === "lbs";

      const payload = {
        ...profile,
        avatar_url: current_avatar,
        weight: isLbs
          ? Math.round(profile.weight ?? 0 / 2.204)
          : profile.weight,
        newAllergies: addedAllergy.map((a) => a.name.toLowerCase()),
        toDelete: removeAllergies,
      };
      console.log("new allergies: ", payload.newAllergies);

      const res = await updateUserDetails(payload);
      if (res.success) {
        const updatedAllergies = [
          ...savedAllergies.map((a) => ({
            allergy: [{ allergy_id: a.id, name: a.name }],
          })),
          ...addedAllergy.map((a) => ({
            allergy: [{ allergy_id: a.id, name: a.name }],
          })),
        ];
        setUser({
          ...profile,
          avatar_url: current_avatar,
          allergies: updatedAllergies,
        });
        setSavedAllergies((prev) => [...prev, ...addedAllergy]);
        setAddedAllergies([]);
        setRemoveAllergies([]);
        setTempPicture({ tempFile: null, previewUrl: null });
        console.log("Profile update successful!!");
      }
      console.log("end of handle fucntion!!!");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleDeleteFromDb = async (id: string) => {
    setRemoveAllergies((prev) => [...prev, id]);
    setSavedAllergies((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Handle upload avatar function called!!");
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setTempPicture({ tempFile: file, previewUrl: tempUrl });
    console.log("Image added to preview!!");
  };

  const goalOrNot = (obj: "maintain" | "goal") => {
    if (obj == "maintain") {
      setProfile((prev) => ({ ...prev, weight_goal: profile.weight }));
      setHaveGoal(false);
    } else if (obj == "goal") {
      setHaveGoal(true);
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
                {profile.avatar_url ? (
                  <Image
                    src={tempPicture.previewUrl || profile.avatar_url}
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
                  id="avatar-input"
                  hidden
                  accept="image/*"
                  onChange={handleUploadAvatar}
                />

                <label
                  htmlFor="avatar-input"
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
                  value={profile?.username || ""}
                  onChange={handleSaveProfile}
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
                      value={profile?.weight || ""}
                      onChange={handleSaveProfile}
                    />
                    <Select defaultValue="kg" onValueChange={kgToLbs}>
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
                      value={profile?.height || ""}
                      className="bg-transparent border-none text-white focus-visible:ring-1 focus-visible:ring-amber-600"
                      placeholder="175"
                      onChange={handleSaveProfile}
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
                    defaultValue={profile?.gender || undefined}
                    onValueChange={(value) =>
                      setProfile((prev) => ({ ...prev, gender: value }))
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
                    value={profile?.age || ""}
                    onChange={handleSaveProfile}
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
                    value={haveGoal ? "goal" : "maintain"}
                    onValueChange={goalOrNot}
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
                      name="weight_goal"
                      className="w-24 h-12 border-2 text-center text-xl font-bold"
                      placeholder="70"
                      onChange={handleSaveProfile}
                      value={profile?.weight_goal || ""}
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
                    onClick={handleAddedAllergies}
                    className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600 hover:shadow-amber-700 cursor-pointer"
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
                        {capitalize(item.name)}
                        <button
                          onClick={() => handleDeleteFromDb(item.id)}
                          className="text-orange-300 hover:text-red-500 cursor-pointer transition-colors"
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
                          className="hover:text-red-600 cursor-pointer"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
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
