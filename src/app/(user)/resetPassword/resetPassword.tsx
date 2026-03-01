"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resetPassword,
  verifyOtpForResetPassword,
} from "@/app/auth/signIn/signUp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ResetPasswordClient() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Pass
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendCode = async () => {
    const formData = new FormData();
    formData.append("email", email);
    const res = await resetPassword(formData);
    if (res.success) setStep(2);
  };

  const handleUpdatePassword = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otpValue);
    formData.append("password", newPassword);

    const res = await verifyOtpForResetPassword(formData);
    if (!res.success) alert(res.error);
  };

  return (
    <div className="space-y-6 p-8 bg-white rounded-3xl shadow-xl border border-orange-100 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        Reset Potato Password
      </h2>

      {step === 1 ? (
        <div className="space-y-4">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSendCode} className="w-full bg-amber-600">
            Send Reset Code
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Enter the 6-digit code sent to {email}
          </p>
          <div className="flex justify-center">
            <InputOTP value={otpValue} onChange={setOtpValue} maxLength={6}>
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
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            onClick={handleUpdatePassword}
            className="w-full bg-green-600 text-white"
          >
            Update Password
          </Button>
        </div>
      )}
    </div>
  );
}
