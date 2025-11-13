"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shuffle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-full min-h-full items-center bg-gray-50">
      <main className="container mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-y-8">
            <h1 className="text-5xl font-extrabold text-gray-900 md:text-6xl lg:text-7xl">
              Stop wondering{" "}
              <span className="text-amber-600">what's for dinner.</span>
            </h1>

            <p className="text-lg text-gray-600 md:text-xl">
              Welcome to{" "}
              <span className="text-amber-600 font-bold">Potato!</span> Just
              show me what's in your fridge, and I'll give you a delicious,
              easy-to-make recipe in seconds. Your meal planning is about to
              change forever.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href="/fridge">
                  Go to My Fridge <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-amber-700 border-amber-700 hover:bg-amber-50 hover:text-amber-800"
              >
                <Link href="/surprise">
                  Surprise Me! <Shuffle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
