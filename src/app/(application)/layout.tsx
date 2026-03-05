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

  const [userResponse, fridgeResponse] = await Promise.all([
    supabase
      .from("users")
      .select(
        `username, avatar_url, weight, height, age, gender, weight_goal, allergies:user_allergy(allergy:allergy(allergy_id, name))`,
      )
      .eq("user_id", user_id)
      .single(),
    supabase
      .from("user_fridge")
      .select(`fridge_id, fridge( name )`)
      .eq("user_id", user_id),
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
