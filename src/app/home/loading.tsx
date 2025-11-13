import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col w-full min-h-full p-8 bg-green-50 gap-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Your Recipes</h1>
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-lg gap-y-6">
        <Loader2 size={64} className="text-amber-600 animate-spin" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Generating Your Recipes
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Our AI is crafting delicious recipes based on your ingredients and
          preferences. This may take a moment...
        </p>
      </div>
    </div>
  );
}

