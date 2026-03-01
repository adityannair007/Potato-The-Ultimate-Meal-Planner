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

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-yellow-50 font-sans p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl gap-12 lg:gap-24 items-center">
        <div className="flex flex-col gap-y-8 text-center lg:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 md:text-6xl lg:text-7xl leading-tight">
            Stop wondering{" "}
            <span className="text-amber-600 block lg:inline">
              what's for dinner.
            </span>
          </h1>

          <p className="text-lg text-gray-600 md:text-xl max-w-2xl mx-auto lg:mx-0">
            Welcome to <span className="text-amber-600 font-bold">Potato!</span>{" "}
            Just show me what's in your fridge, and I'll give you a delicious,
            easy-to-make recipe in seconds. Your meal planning is about to
            change forever.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-orange-100">
            <div className="text-center">
              <h1 className="text-4xl text-amber-600 tracking-widest font-bold">
                Potato
              </h1>
            </div>

            <form ref={formRef} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 ml-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
                  placeholder="potato@kitchen.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
                  placeholder="shhh..."
                />
              </div>

              {isSignUp && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Confirm Password
                  </label>
                  <input
                    id="cpassword"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {!isSignUp ? (
                <div className="space-y-4">
                  <Button
                    formAction={login}
                    className="w-full py-6 font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all active:scale-95"
                  >
                    Log In
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-100"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400 font-bold">
                        Or
                      </span>
                    </div>
                  </div>

                  <GoogleSignIn />

                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
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
                    className="w-full py-6 font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all active:scale-95"
                  >
                    Create New Account
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              )}

              {toggleVerify && (
                <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-200 animate-in fade-in zoom-in duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">
                      Verify Email
                    </h3>
                    <p className="text-sm text-gray-600">
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
                        <InputOTPSlot
                          index={0}
                          className="bg-white border-orange-200"
                        />
                        <InputOTPSlot
                          index={1}
                          className="bg-white border-orange-200"
                        />
                        <InputOTPSlot
                          index={2}
                          className="bg-white border-orange-200"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-orange-300" />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="bg-white border-orange-200"
                        />
                        <InputOTPSlot
                          index={4}
                          className="bg-white border-orange-200"
                        />
                        <InputOTPSlot
                          index={5}
                          className="bg-white border-orange-200"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      Verify & Complete
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setToggleVerify(false)}
                      className="w-full text-gray-500 text-sm"
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
