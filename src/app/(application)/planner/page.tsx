import { createClient } from "@/app/lib/supabase/server";
import { Item } from "../fridge/page";

import PlannerClient from "./plannerClient";
import { redirect } from "next/navigation";

export default async function Planner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signIn");

  const [fridgeItems, allergens] = await Promise.all([
    supabase
      .from("user_fridge")
      .select(`fridge_id, fridge (name)`)
      .eq("user_id", user.id),
    supabase
      .from("user_allergy")
      .select(`allergy_id, allergy (name)`)
      .eq("user_id", user.id),
  ]);

  if (fridgeItems.error || allergens.error) {
    console.error(
      "Error fetching ingredients and allergens: ",
      fridgeItems.error || allergens.error,
    );
  }

  const initialFridgeItems: Item[] =
    fridgeItems.data?.map((item: any) => ({
      id: item.fridge_id,
      name: item.fridge.name,
    })) || [];

  const initialAllergens: Item[] =
    allergens.data?.map((item: any) => ({
      id: item.allergy_id,
      name: item.allergy.name,
    })) || [];
  return (
    <>
      <PlannerClient
        initialFridgeItems={initialFridgeItems}
        initialAllergens={initialAllergens}
      />
    </>
  );
}
