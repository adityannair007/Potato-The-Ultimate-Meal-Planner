"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formdata: FormData) {
  const supabase = await createClient();
  const data = {
    email: formdata.get("email") as string,
    password: formdata.get("password") as string,
  };
  console.log(data.email);
  console.log(data.password);

  if (!data.email || !data.password) {
    console.log("No email or password found!");
  }

  if (data.password.length < 6) console.log("Password length less than 6!!");
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
}

export async function login(formdata: FormData) {
  const supabase = await createClient();

  const data = {
    email: formdata.get("email") as string,
    password: formdata.get("password") as string,
  };

  if (!data.email || !data.password) {
    console.log("No email or password found!");
  }
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/home");
}
