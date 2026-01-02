"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendOTP(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return redirect("/login?error=Email is required.");
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      // Use the server-only variable
      emailRedirectTo: process.env.SITE_URL + "/home",
    },
  });

  if (error) {
    console.error("Error sending OTP:", error.message);
    // Redirect back with an error message in the URL
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Success! Do nothing, just let the user see the OTP drawer.
  console.log("OTP email sent successfully.");
}

export async function verifyEmailOtp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return redirect("/login?error=Email and OTP are required.");
  }

  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: otp,
    type: "email",
  });

  if (error) {
    console.error("Error verifying OTP:", error.message);
    // BUG FIX: Redirect on error, don't continue!
    return redirect("/login?error=Invalid or expired OTP.");
  }

  // Success! User is signed in.
  revalidatePath("/", "layout");
  redirect("/home");
}

export async function login(formdata: FormData) {
  const supabase = await createClient();

  const data = {
    email: formdata.get("email") as string,
    password: formdata.get("password") as string,
  };

  if (!data.email || !data.password) {
    return redirect("/login?error=Email and password are required.");
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login Error:", error.message);
    // Use a specific error route or redirect back to login
    return redirect("/login?error=Invalid email or password.");
  }

  revalidatePath("/", "layout");
  redirect("/home");
}
