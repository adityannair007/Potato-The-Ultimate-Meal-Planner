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

  const otpSlotClassName =
    "border-border bg-background text-foreground focus:border-ring";

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5">
      <h2 className="text-2xl font-bold text-card-foreground">
        Reset Potato Password
      </h2>

      {step === 1 ? (
        <div className="space-y-4">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-background"
          />
          <Button onClick={handleSendCode} className="w-full">
            Send Reset Code
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-digit code sent to {email}
          </p>
          <div className="flex justify-center">
            <InputOTP value={otpValue} onChange={setOtpValue} maxLength={6}>
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
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-input bg-background"
          />
          <Button onClick={handleUpdatePassword} className="w-full">
            Update Password
          </Button>
        </div>
      )}
    </div>
  );
}
