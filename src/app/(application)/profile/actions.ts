"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
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

  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;

  const filePath = `${user_id}/avatar.png`;
  console.log("Filename: ", file, "\nFilePath: ", filePath);

  const { error: uploadError } = await supabase.storage
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
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;

  if (toDelete.length > 0) {
    const { error: deletionError } = await supabase
      .from("user_allergy")
      .delete()
      .in("allergy_id", toDelete)
      .eq("user_id", user_id);
    console.error(deletionError);
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserDetails(userDetails: any) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;
  if (authError || !user_id) {
    throw new Error("Unauthorized: Please log in again.");
  }
  const { newAllergies, allergies, toDelete, ...userData } = userDetails;

  const { error: userError } = await supabase
    .from("users")
    .update(userData)
    .eq("user_id", user_id);

  if (userError) throw new Error(userError.message);

  if (toDelete && toDelete.length > 0) {
    await supabase
      .from("user_allergy")
      .delete()
      .in("allergy_id", toDelete)
      .eq("user_id", user_id);
  }

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
      const { error: userAllergyError } = await supabase
        .from("user_allergy")
        .upsert(finalAllergies, { onConflict: "user_id, allergy_id" });

      if (userAllergyError)
        console.log("Error in user_allergy table insertion:", error);
    }
  }

  revalidatePath("/profile");
  return { success: true };
}
