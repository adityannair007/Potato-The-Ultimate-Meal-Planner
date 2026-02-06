import { Item } from "../fridge/page";
import { createClient } from "../lib/supabase/server";
import { foodRecipe } from "../types/recipe";
import PlannerClient from "./plannerClient";

export default async function Planner() {
  const supabase = await createClient();

  const redis = createClient;

  const [fridgeItems, allergens] = await Promise.all([
    supabase.from("fridge").select("id, name"),
    supabase.from("allergy").select("id, name"),
  ]);

  if (fridgeItems.error || allergens.error) {
    console.error(
      "Error fetching ingredients and allergens: ",
      fridgeItems.error || allergens.error,
    );
  }
  return (
    <>
      <PlannerClient
        initialFridgeItems={fridgeItems.data as Item[]}
        initialAllergens={allergens.data as Item[]}
      />
    </>
  );
}
