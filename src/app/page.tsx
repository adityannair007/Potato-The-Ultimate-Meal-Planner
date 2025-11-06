"use client";
import Image from "next/image";
import PotatoImage from "@/app/public/potato_img.jpg";

export default function Home() {
  return (
    <>
      <div className="flex w-full h-full bg-amber-500">
        <div className="flex top-48 h-screen text-4xl flex-col justify-evenly items-center w-full">
          <div>
            <h1 className="flex justify-center text-6xl font-bold text-amber-900 text-shadow-2xs">
              Welcome to Potato!
            </h1>
            <h1 className="flex justify-center font-bold text-amber-900 text-shadow-2xs pt-4">
              Your meal planning is going to change forever!
            </h1>
          </div>
          <h2 className="text-orange-900 text-shadow-2xs">
            Tell me what's in your fridge and I will tell you what to make!
          </h2>
        </div>
      </div>
    </>
  );
}
