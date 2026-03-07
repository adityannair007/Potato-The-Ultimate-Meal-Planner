import Sidebar from "@/components/sidebar";
import { UserProvider } from "../context/UserContext";
import { createClient } from "../lib/supabase/server";
import { user } from "../types/user";
import { FridgeProvider } from "../context/FridgeContext";
import { ingredient } from "../types/fridge";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;

  const fridgeEnrichedResponse = await supabase
    .from("user_fridge")
    .select(`fridge_id, quantity, unit, quantity_confidence, fridge( name )`)
    .eq("user_id", user_id);

  const fridgeResponse = fridgeEnrichedResponse.error
    ? await supabase
        .from("user_fridge")
        .select(`fridge_id, quantity, fridge( name )`)
        .eq("user_id", user_id)
    : fridgeEnrichedResponse;

  const [userResponse] = await Promise.all([
    supabase
      .from("users")
      .select(
        `username, avatar_url, weight, height, age, gender, weight_goal, allergies:user_allergy(allergy:allergy(allergy_id, name))`,
      )
      .eq("user_id", user_id)
      .single(),
  ]);

  console.log("User response:", userResponse);

  const fallbackUser: user = {
    username: "",
    avatar_url: "",
    weight: 0,
    height: 0,
    age: 0,
    gender: "",
    weight_goal: 0,
    allergies: [],
  };
  const userData = userResponse.data;
  const fridgeData = fridgeResponse.data;
  const formattedData: user = userData
    ? {
        username: userData.username || "",
        avatar_url: userData.avatar_url || "",
        weight: Number(userData.weight) || 0,
        height: Number(userData.height) || 0,
        age: Number(userData.age) || 0,
        gender: userData.gender || "",
        weight_goal: Number(userData.weight_goal) || 0,
        allergies: (userData.allergies || []).map((item: any) => ({
          allergy_id: String(item.allergy.allergy_id),
          name: item.allergy.name,
        })),
      }
    : fallbackUser;

  const formattedIngredients: ingredient[] = (fridgeData || []).map(
    (row: any) => ({
      fridge_id: row.fridge_id,
      name: Array.isArray(row.fridge)
        ? row.fridge[0]?.name
        : row.fridge?.name || "Unknown",
      quantity: Number(row.quantity) || 1,
      unit:
        row.unit === "g" ||
        row.unit === "kg" ||
        row.unit === "ml" ||
        row.unit === "l" ||
        row.unit === "piece"
          ? row.unit
          : "piece",
      quantity_confidence:
        row.quantity_confidence === "estimated" ||
        row.quantity_confidence === "unknown" ||
        row.quantity_confidence === "exact"
          ? row.quantity_confidence
          : "exact",
    }),
  );

  return (
    <UserProvider initialUser={formattedData}>
      <FridgeProvider initialIngredients={formattedIngredients}>
        <div className="flex w-full h-full">
          <Sidebar />
          <div className="w-5/6 h-full overflow-y-auto">{children}</div>
        </div>
      </FridgeProvider>
    </UserProvider>
  );
}
