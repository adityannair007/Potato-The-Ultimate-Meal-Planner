import { createClient } from "../lib/supabase/server";
import HomePageClient from "./homePageClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [fridgeRes, cuisineRes, allergyRes, recipeRes] = await Promise.all([
    supabase.from("fridge").select("id, name"),
    supabase.from("cuisine").select("id, name"),
    supabase.from("allergy").select("id, name"),
    supabase.from("recipes").select("id, name"),
  ]);

  if (fridgeRes.error)
    console.error("Error fetching fridge items:", fridgeRes.error.message);
  if (allergyRes.error)
    console.error("Error fetching allergens:", allergyRes.error.message);
  if (cuisineRes.error)
    console.error("Error fetching cuisines:", cuisineRes.error.message);

  return (
    <HomePageClient
      items={fridgeRes.data || []}
      cuisines={cuisineRes.data || []}
      allergies={allergyRes.data || []}
      foodItems={recipeRes.data || []}
    />
  );
}
