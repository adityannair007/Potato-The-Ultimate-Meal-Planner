"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  console.log("Sign up function called!!");
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: "Potato_user" },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

//both function are called when reset password button is clicked!
export async function resetPassword(formData: FormData) {
  console.log("reset function called!");
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function verifyOtpForResetPassword(formData: FormData) {
  console.log("verify for password change function called!");

  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });
  if (error) return { success: false, error: error.message };

  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  });

  if (updateError) return { success: false, error: updateError.message };
  console.log("password updated successfully!");
  redirect("/signIn");
}

export async function sendOTP(formData: FormData) {
  console.log("Entered sendOtp function!!!");
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return redirect("/login?error=Email is required.");
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: process.env.SITE_URL + "/home",
    },
  });

  if (error) {
    console.error("Error sending OTP:", error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  console.log("OTP email sent successfully.");
}

export async function verifyEmailOtp(formData: FormData) {
  const supabase = await createClient();
  console.log("otp verify server called!!");

  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  console.log("Email: ", email, "Otp: ", otp);

  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: otp,
    type: "signup",
  });

  if (error) {
    return { success: false, error: error.message };
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
    return redirect("/login?error=Invalid email or password.");
  }

  revalidatePath("/", "layout");
  redirect("/home");
}
