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
    <div className="flex w-full min-h-screen items-center justify-center bg-yellow-50 font-sans p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-orange-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">foodbox</h1>
          <p className="text-gray-500">Your personal nutrition companion</p>
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
              className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:ring-0 focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
              placeholder="you@example.com"
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
              className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:ring-0 focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          {isSignUp && (
            <div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Confirm Password
                </label>
                <input
                  id="password"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-orange-50 border-2 border-transparent rounded-xl focus:ring-0 focus:border-amber-500 text-gray-800 placeholder-gray-400 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className="flex flex-col justify-end items-end gap-2">
              <label
                className="text-amber-600 font-bold tracking-wide pr-2 cursor-pointer"
                onClick={() => {
                  setIsSignUp(true);
                }}
              >
                Don't have an account!
              </label>
              <Button
                formAction={login}
                className="w-full py-4 font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-md shadow-amber-200 transition-all active:scale-95"
              >
                Log In
              </Button>
            </div>
          )}

          {isSignUp && (
            <Button
              type="button"
              onClick={handleSignUp}
              variant="ghost"
              className="w-full py-3 font-semibold text-amber-700 hover:bg-orange-50 rounded-xl transition-colors"
            >
              Create New Account
            </Button>
          )}

          {toggleVerify && (
            <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                      className="bg-white border-orange-200 focus:border-amber-500"
                    />
                    <InputOTPSlot
                      index={1}
                      className="bg-white border-orange-200 focus:border-amber-500"
                    />
                    <InputOTPSlot
                      index={2}
                      className="bg-white border-orange-200 focus:border-amber-500"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator className="text-orange-300" />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="bg-white border-orange-200 focus:border-amber-500"
                    />
                    <InputOTPSlot
                      index={4}
                      className="bg-white border-orange-200 focus:border-amber-500"
                    />
                    <InputOTPSlot
                      index={5}
                      className="bg-white border-orange-200 focus:border-amber-500"
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
  );
}
