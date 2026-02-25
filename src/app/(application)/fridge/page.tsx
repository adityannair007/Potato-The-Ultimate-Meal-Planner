import { createClient } from "@/app/lib/supabase/server";
import FridgeClient from "./fridgeClient";

export type Item = {
  id: number;
  name: string;
};

export default async function FridgePage() {
  const supabase = await createClient();
  const [fridgeData, allergyData, cuisineData] = await Promise.all([
    supabase.from("fridge").select("id, name"),
    supabase.from("allergy").select("id, name"),
    supabase.from("cuisine").select("id, name"),
  ]);

  if (fridgeData.error || allergyData.error || cuisineData.error) {
    console.error(
      "Error fetching data:",
      fridgeData.error || allergyData.error || cuisineData.error
    );
  }

  return (
    <FridgeClient
      initialFridgeItems={(fridgeData.data as Item[]) || []}
      initialAllergens={(allergyData.data as Item[]) || []}
      initialCuisines={(cuisineData.data as Item[]) || []}
    />
  );
}
