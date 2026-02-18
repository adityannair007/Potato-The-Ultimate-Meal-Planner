"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.log("Error: ", error);

  revalidatePath("/", "layout");
  redirect("/profile");
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

  const cacheBuster = `?t=${Date.now()}`;
  const finalUrl = `${publicUrl}${cacheBuster}`;

  revalidatePath("/profile");
  return { success: true, url: finalUrl };
}

export async function deleteAllergy(toDelete: string[]) {
  const user_id = "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d";
  const supabase = await createClient();

  if (toDelete.length > 0) {
    const { error: deletionError } = await supabase
      .from("user_allergy")
      .delete()
      .in("allergy_id", toDelete) // order matters??
      .eq("user_id", user_id);
    console.error(deletionError);
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserDetails(userDetails: any) {
  const user_id = "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d";
  const supabase = await createClient();

  const { newAllergies, ...userData } = userDetails;

  const { error: userError } = await supabase
    .from("users")
    .update(userData)
    .eq("user_id", user_id);

  if (userError) throw new Error(userError.message);

  if (newAllergies.length > 0) {
    const { data: allergyIds, error } = await supabase
      .from("allergy")
      .upsert(
        newAllergies.map((value: string) => ({ name: value.toLowerCase() })),
        { onConflict: "name" },
      )
      .select("allergy_id");

    if (allergyIds) {
      const finalAllergies = allergyIds.map((rows) => ({
        user_id,
        allergy_id: rows.allergy_id,
      }));
      await supabase
        .from("user_allergy")
        .upsert(finalAllergies, { onConflict: "user_id, allergy_id" });
    }
  }

  revalidatePath("/profile");
  return { success: true };
}
