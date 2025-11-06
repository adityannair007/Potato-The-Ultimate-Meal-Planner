"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function saveIngredients(veggie: { name: string }[]) {
  const supabase = await createClient();
  console.log("save Ingredients called");
  if (!veggie || veggie.length === 0) return;
  const { error } = await supabase.from("fridge").insert(veggie);
  if (error) {
    console.log("Error saving ingredients to fridge: ", error);
  }
  revalidatePath("/home");
}

export async function deleteIngredient(index: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fridge")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Deletion Error:", error);
  } else {
    console.log("Deletion success!", data);
  }
  //   setLabels((prev) => prev.filter((item) => item.id !== index));

  revalidatePath("/home");
}

export async function saveAllergies(allergy: { name: string }[]) {
  if (!allergy || allergy.length === 0) {
    console.log("No changes to the allergy box!");
    return;
  }
  const supabase = await createClient();
  const allergyObj = allergy.map((itemname) => ({ name: itemname.name }));
  console.log("Allergy object: ", allergyObj);
  const { error } = await supabase.from("allergy").insert(allergyObj);
  if (error) {
    console.log("Error saving allergies: ", error);
  }
  revalidatePath("/home");
}

export async function deleteAllergy(index: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allergy")
    .delete()
    .eq("id", index);
  if (error) {
    console.log("Error: ", error);
  } else {
    console.log("Allergy deleted!", data);
    // setAllergen((prev) => prev.filter((allergy) => allergy.id !== index));
  }

  revalidatePath("/home");
}

export async function getUserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
}
