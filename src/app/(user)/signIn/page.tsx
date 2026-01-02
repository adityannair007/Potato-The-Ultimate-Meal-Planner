"use client";

// Make sure to import both your actions
import { login, sendOTP, verifyEmailOtp } from "@/app/auth/signIn/signUp";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader, // Added
  DrawerTitle, // Added
  DrawerDescription, // Added
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
        <div className="text-center">
          {/* ... (Your welcome header, no changes) ... */}
          <div className="inline-block p-3 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
            >
              <path d="M14 10a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h8z" />
              <path d="M15 11V9a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2" />
              <path d="M18 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Log in or create an account to continue.
          </p>
        </div>

        {/* This <form> wraps everything, including the drawer buttons */}
        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email" // This field will be submitted by all formActions
              type="email"
              required
              className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-transparent rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password" // This field will be submitted by all formActions
              type="password"
              required
              className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-transparent rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <button
              formAction={login}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Log In
            </button>

            {/* --- DRAWER INTEGRATION --- */}
            <Drawer>
              <DrawerTrigger asChild>
                {/* This button triggers the drawer AND submits the form to sendOTP */}
                <button
                  formAction={sendOTP}
                  className="w-full px-4 py-3 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                >
                  Sign Up
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Check your email</DrawerTitle>
                    <DrawerDescription>
                      Enter the 6-digit verification code we sent you.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 py-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        name="otp" // This name is crucial for the form submission
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <DrawerFooter>
                    {/* This button submits the form to verifyEmailOtp */}
                    <button
                      formAction={verifyEmailOtp}
                      className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                    >
                      Verify Account
                    </button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
            {/* --- END DRAWER INTEGRATION --- */}
          </div>
        </form>
      </div>
    </div>
  );
}
