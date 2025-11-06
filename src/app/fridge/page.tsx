// app/home/fridge/page.tsx
import { createClient } from "@/app/lib/supabase/server"; // Ensure this path is correct
import FridgeClient from "./fridgeClient";

// Define a reusable type
export type Item = {
  id: number;
  name: string;
};

// This is the main server component for the page
export default async function FridgePage() {
  const supabase = await createClient();

  // Fetch initial data from Supabase in parallel
  const [fridgeData, allergyData, cuisineData] = await Promise.all([
    supabase.from("fridge").select("id, name"), // Fetches from 'fridge' table
    supabase.from("allergy").select("id, name"),
    supabase.from("cuisine").select("id, name"),
  ]);

  // Handle potential errors
  if (fridgeData.error || allergyData.error || cuisineData.error) {
    console.error(
      "Error fetching data:",
      fridgeData.error || allergyData.error || cuisineData.error
    );
    // You could show an error page or just use empty lists
  }

  // Pass the fetched data to the client component
  return (
    <FridgeClient
      initialFridgeItems={(fridgeData.data as Item[]) || []}
      initialAllergens={(allergyData.data as Item[]) || []}
      initialCuisines={(cuisineData.data as Item[]) || []}
    />
  );
}
