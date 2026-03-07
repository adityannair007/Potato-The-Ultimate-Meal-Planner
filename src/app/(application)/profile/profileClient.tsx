"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  Cake,
  LogOut,
  Ruler,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import * as motion from "motion/react-client";
import { GiPotato } from "react-icons/gi";

import { useUser } from "../../context/UserContext";
import { user } from "../../types/user";
import { allergy } from "@/app/types/allergy";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { logout, updateUserDetails, uploadAvatar } from "./actions";

export default function ProfileClient() {
  const { user, setUser } = useUser();

  const [draft, setDraft] = useState<Partial<user>>({});
  const [tempPicture, setTempPicture] = useState<{
    tempFile: File | null;
    previewUrl: string | null;
  }>({
    tempFile: null,
    previewUrl: null,
  });
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [allergyInput, setAllergyInput] = useState("");
  const [addedAllergies, setAddedAllergies] = useState<allergy[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const getInputValue = (key: keyof Omit<user, "allergies">) => {
    if (Object.prototype.hasOwnProperty.call(draft, key)) {
      return draft[key] ?? "";
    }

    return user?.[key] ?? "";
  };

  const currentAllergies = useMemo(() => {
    const saved =
      user?.allergies.filter((item) => !removedIds.includes(item.allergy_id)) ||
      [];
    return [...saved, ...addedAllergies];
  }, [addedAllergies, removedIds, user]);

  const hasGoal = getInputValue("weight") !== getInputValue("weight_goal");

  const handleSaveDraft = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setDraft((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDraft((prev) => ({
      ...prev,
      weight: value === "" ? null : Number(value),
    }));
  };

  const handleUnitChange = (nextUnit: "kg" | "lbs") => {
    const weight = Number(getInputValue("weight"));
    if (nextUnit === "lbs" && weight) {
      setDraft((prev) => ({ ...prev, weight: Math.round(weight * 2.204) }));
    } else if (nextUnit === "kg" && weight) {
      setDraft((prev) => ({ ...prev, weight: Math.round(weight / 2.204) }));
    }

    setUnit(nextUnit);
  };

  const handleSaveToDb = async () => {
    setIsUpdating(true);
    try {
      let currentAvatar = user?.avatar_url || "";
      if (tempPicture.tempFile) {
        const formData = new FormData();
        formData.append("avatar", tempPicture.tempFile);
        const res = await uploadAvatar(formData);
        if (res.success) {
          currentAvatar = res.url;
        }
      }

      const payload = {
        ...user,
        ...draft,
        avatar_url: currentAvatar,
        weight:
          unit === "lbs"
            ? Math.round(Number(getInputValue("weight")) / 2.204)
            : getInputValue("weight"),
        newAllergies: addedAllergies.map((item) => item.name.toLowerCase()),
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
      }
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  const usernameValue = String(getInputValue("username") || "");
  const weightValue = getInputValue("weight");
  const heightValue = getInputValue("height");
  const ageValue = getInputValue("age");
  const goalValue = getInputValue("weight_goal");
  const rawGenderValue = getInputValue("gender");
  const genderValue =
    typeof rawGenderValue === "string" && rawGenderValue !== ""
      ? rawGenderValue
      : undefined;
  const profileName = usernameValue || "Potato User";
  const profileSubtitle =
    currentAllergies.length > 0
      ? `${currentAllergies.length} dietary restriction${
          currentAllergies.length > 1 ? "s" : ""
        } tracked`
      : "Personalize your food guidance";
  const profileStats = [
    {
      icon: Scale,
      label: "Weight",
      value:
        weightValue === "" ? "Not set" : `${weightValue} ${unit.toUpperCase()}`,
    },
    {
      icon: Ruler,
      label: "Height",
      value: heightValue === "" ? "Not set" : `${heightValue} cm`,
    },
    {
      icon: Cake,
      label: "Age",
      value: ageValue === "" ? "Not set" : `${ageValue}`,
    },
    {
      icon: Target,
      label: "Goal",
      value: hasGoal && goalValue !== "" ? `${goalValue} kg` : "Maintain",
    },
  ];

  const inputClassName =
    "h-11 rounded-xl border-border bg-background px-4 shadow-sm shadow-black/5 transition focus-visible:ring-2 focus-visible:ring-ring";
  const labelClassName =
    "text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-5 md:px-6">
      <div className="absolute inset-x-0 top-0 h-56 bg-primary/10 blur-3xl" />

      <Card className="relative mx-auto w-full max-w-6xl overflow-hidden border-border/70 bg-card/95 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <CardHeader className="gap-5 border-b border-border/80 bg-muted/35 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="shrink-0"
              >
                <Avatar className="h-24 w-24 rounded-[1.5rem] border-4 border-background bg-secondary shadow-lg shadow-black/5">
                  {tempPicture.previewUrl || user?.avatar_url ? (
                    <AvatarImage
                      src={
                        tempPicture.previewUrl || user?.avatar_url || undefined
                      }
                      alt={`${profileName} profile picture`}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-[1.5rem] bg-secondary text-5xl text-primary">
                    <GiPotato />
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <input
                type="file"
                id="avatar"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setTempPicture({
                      tempFile: file,
                      previewUrl: URL.createObjectURL(file),
                    });
                  }
                }}
              />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <div className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
                    Quick Profile
                  </div>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-card-foreground md:text-3xl">
                    {profileName}
                  </CardTitle>
                  <CardDescription className="mt-1 max-w-md text-sm text-muted-foreground">
                    {profileSubtitle}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-full border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <label htmlFor="avatar" className="cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      Photo
                    </label>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => logout()}
                    className="h-9 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {profileStats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="min-w-[118px] rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm shadow-black/5"
                >
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-5 md:p-6 lg:grid-cols-[1.55fr,1fr]">
          <div className="space-y-4">
            <Card className="border-border bg-muted/35 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-lg text-card-foreground">
                    Personal Details
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Edit the essentials in one place.
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                  <UserRound className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 pt-0 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                  <label className={labelClassName}>Display Name</label>
                  <Input
                    className={inputClassName}
                    placeholder="Enter username"
                    name="username"
                    value={usernameValue}
                    onChange={handleSaveDraft}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClassName}>Gender</label>
                  <Select
                    value={genderValue}
                    onValueChange={(value) =>
                      setDraft((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border bg-background px-4 shadow-sm shadow-black/5 focus:ring-ring">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={labelClassName}>Age</label>
                  <Input
                    type="number"
                    name="age"
                    value={ageValue}
                    onChange={handleSaveDraft}
                    className={inputClassName}
                    placeholder="23"
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClassName}>Weight</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      name="weight"
                      className={`${inputClassName} flex-1`}
                      placeholder="68"
                      value={weightValue}
                      onChange={handleWeightChange}
                    />
                    <Select value={unit} onValueChange={handleUnitChange}>
                      <SelectTrigger className="h-11 w-24 rounded-xl border-border bg-background px-3 font-semibold uppercase tracking-wide shadow-sm shadow-black/5 focus:ring-ring">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">KG</SelectItem>
                        <SelectItem value="lbs">LBS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClassName}>Height</label>
                  <div className="relative">
                    <Input
                      type="number"
                      name="height"
                      value={heightValue}
                      className={`${inputClassName} pr-12`}
                      placeholder="175"
                      onChange={handleSaveDraft}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-none">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-lg text-card-foreground">
                    Dietary Constraints
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Add and remove restrictions quickly.
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Ex: peanuts, shellfish..."
                    className={`${inputClassName} flex-1`}
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      if (allergyInput) {
                        setAddedAllergies((prev) => [
                          ...prev,
                          {
                            allergy_id: `temp-${Date.now()}`,
                            name: allergyInput,
                          },
                        ]);
                        setAllergyInput("");
                      }
                    }}
                    className="h-11 rounded-xl px-5"
                  >
                    Add
                  </Button>
                </div>

                <div className="min-h-[92px] rounded-2xl border border-dashed border-border bg-muted/30 p-3">
                  {currentAllergies.length === 0 ? (
                    <div className="flex min-h-[64px] items-center justify-center rounded-xl bg-background/75 px-4 text-center text-sm text-muted-foreground">
                      No restrictions added yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentAllergies.map((item) => (
                        <div
                          key={item.allergy_id}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
                        >
                          <span>{capitalize(item.name)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full text-muted-foreground hover:bg-accent hover:text-destructive"
                            onClick={() => {
                              if (item.allergy_id.startsWith("temp-")) {
                                setAddedAllergies((prev) =>
                                  prev.filter(
                                    (next) =>
                                      next.allergy_id !== item.allergy_id,
                                  ),
                                );
                              } else {
                                setRemovedIds((prev) => [
                                  ...prev,
                                  item.allergy_id,
                                ]);
                              }
                            }}
                          >
                            x
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-border bg-muted/35 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-lg text-card-foreground">
                    Fitness Objective
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Keep or change your target weight.
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                  <Target className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                <div className="space-y-2">
                  <label className={labelClassName}>Goal Mode</label>
                  <Select
                    value={hasGoal ? "goal" : "maintain"}
                    onValueChange={(value) =>
                      setDraft((prev) => ({
                        ...prev,
                        weight_goal:
                          value === "maintain"
                            ? Number(getInputValue("weight"))
                            : 0,
                      }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border bg-background px-4 shadow-sm shadow-black/5 focus:ring-ring">
                      <SelectValue placeholder="Select goal" />
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
                  <div className="space-y-2">
                    <label className={labelClassName}>Target Weight</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name="weight_goal"
                        className={`${inputClassName} max-w-32 text-center font-semibold`}
                        placeholder="70"
                        onChange={handleSaveDraft}
                        value={goalValue || ""}
                      />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        kg
                      </span>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-background/75 p-4 text-sm text-muted-foreground">
                  {hasGoal
                    ? "Your planner will use the target weight in future recommendations."
                    : "Your planner will keep meals aligned with maintaining your current weight."}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-none">
              <CardContent className="space-y-3 p-5">
                <div>
                  <p className="text-base font-semibold text-card-foreground">
                    Save changes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep your profile updated without extra scrolling.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, transition: { duration: 0.12 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveToDb}
                  disabled={isUpdating}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/10 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUpdating ? "Saving..." : "Update Profile"}
                </motion.button>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/80 bg-muted/35 px-5 py-4 text-sm text-muted-foreground md:px-6">
          Everything important is grouped into one shorter workspace for faster
          edits.
        </CardFooter>
      </Card>
    </div>
  );
}
