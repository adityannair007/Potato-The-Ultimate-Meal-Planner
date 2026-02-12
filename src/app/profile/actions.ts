"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { user } from "../types/user";

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

export async function uploadAvatar(formData: FormData) {
  console.log("Upload avatar function called!!");
  const supabase = await createClient();
  const file = formData.get("avatar") as File;

  const user_id = "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d";
  const filePath = `${user_id}/avatar.png`;
  console.log("Filename: ", file, "\nFilePath: ", filePath);

  const { data, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.log("Upload error: ", uploadError);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = await supabase.storage.from("avatars").getPublicUrl(filePath);

  console.log("Public url:", publicUrl);
  const cacheBuster = `?t=${Date.now()}`;
  const finalUrl = `${publicUrl}${cacheBuster}`;

  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: finalUrl })
    .eq("user_id", user_id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/profile");
  return { success: true, url: publicUrl };
}

export async function updateUserDetails(userDetails: { user: user }) {
  const supabase = await createClient();
  const { error } = await supabase.from("users").insert(userDetails);

  if (error) console.error(error.message);
  revalidatePath("/profile");
}
