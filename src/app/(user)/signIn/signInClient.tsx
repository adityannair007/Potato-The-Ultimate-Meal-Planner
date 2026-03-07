"use client";

import {
  signUp,
  login,
  sendOTP,
  verifyEmailOtp,
} from "@/app/auth/signIn/signUp";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef, useState } from "react";
import GoogleSignIn from "./googleSignIn";

export default function SignInPage() {
  const [otpValue, setOtpValue] = useState("");
  const [toggleVerify, setToggleVerify] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [cPassword, setCPassword] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("handleSignUp called!");

    if (formRef.current) {
      const formData = new FormData(formRef.current);

      if (formData.get("password") != cPassword) {
        console.log("Passwords dont match!!");
        return;
      }
      await signUp(formData);
      console.log("Passwords are matching!");
    }

    setToggleVerify(true);
  };

  const handleVerifyOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Verify Otp function in!!");

    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formData.set("otp", otpValue);
      const result = await verifyEmailOtp(formData);

      if (result?.success === false) {
        alert(result.error);
      }
    }

    setToggleVerify(false);
  };

  const fieldClassName =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring";
  const labelClassName = "ml-1 block text-sm font-semibold text-foreground";
  const otpSlotClassName = "border-border bg-background text-foreground";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 font-sans text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl gap-12 lg:gap-24 items-center">
        <div className="flex flex-col gap-y-8 text-center lg:text-left">
          <h1 className="text-5xl font-extrabold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Stop wondering{" "}
            <span className="block text-primary lg:inline">
              what's for dinner.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl lg:mx-0">
            Welcome to <span className="font-bold text-primary">Potato!</span>{" "}
            Just show me what's in your fridge, and I'll give you a delicious,
            easy-to-make recipe in seconds. Your meal planning is about to
            change forever.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-widest text-primary">
                Potato
              </h1>
            </div>

            <form ref={formRef} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={labelClassName}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={fieldClassName}
                  placeholder="potato@kitchen.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={labelClassName}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={fieldClassName}
                  placeholder="shhh..."
                />
              </div>

              {isSignUp && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className={labelClassName}>
                    Confirm Password
                  </label>
                  <input
                    id="cpassword"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    type="password"
                    required
                    className={fieldClassName}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {!isSignUp ? (
                <div className="space-y-4">
                  <Button
                    formAction={login}
                    className="w-full rounded-xl py-6 font-bold shadow-lg shadow-black/5 transition-all active:scale-95"
                  >
                    Log In
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 font-bold text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <GoogleSignIn />

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="cursor-pointer font-bold text-primary hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleSignUp}
                    className="w-full rounded-xl py-6 font-bold shadow-lg shadow-black/5 transition-all active:scale-95"
                  >
                    Create New Account
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="cursor-pointer font-bold text-primary hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              )}

              {toggleVerify && (
                <div className="mt-8 animate-in zoom-in rounded-2xl border border-border bg-muted/35 p-6 duration-300 fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-card-foreground">
                      Verify Email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to your inbox
                    </p>
                  </div>

                  <div className="flex justify-center mb-6">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={(value) => setOtpValue(value)}
                      className="gap-2"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className={otpSlotClassName} />
                        <InputOTPSlot index={1} className={otpSlotClassName} />
                        <InputOTPSlot index={2} className={otpSlotClassName} />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-muted-foreground/60" />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className={otpSlotClassName} />
                        <InputOTPSlot index={4} className={otpSlotClassName} />
                        <InputOTPSlot index={5} className={otpSlotClassName} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full rounded-xl py-3 font-bold shadow-lg shadow-black/5 transition-all"
                    >
                      Verify & Complete
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setToggleVerify(false)}
                      className="w-full text-sm text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
