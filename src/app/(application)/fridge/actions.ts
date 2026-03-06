"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveIngredients(veggie: { name: string }[]) {
  if (!veggie || veggie.length === 0) return;
  const supabase = await createClient();
  console.log("save Ingredients called");
  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;

  const userFridge = veggie.map((items) => ({
    user_id,
    items,
  }));

  const { error } = await supabase
    .from("user_fridge")
    .upsert(userFridge)
    .eq("user_id", user_id);
  if (error) {
    console.log("Error saving ingredients to fridge: ", error);
    return;
  }
  return { success: true };
  revalidatePath("/home");
}

export async function deleteIngredient(index: string) {
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
  revalidatePath("/home");
}
