import Sidebar from "@/components/sidebar";

import { UserProvider } from "../context/UserContext";
import { createClient } from "../lib/supabase/server";
import { user } from "../types/user";
import { GiPotato } from "react-icons/gi";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user_id = data.user?.id;

  const { data: initialData, error } = await supabase
    .from("users")
    .select(
      `username, avatar_url, weight, height, age, gender, weight_goal, allergies:user_allergy(allergy:allergy(allergy_id, name))`,
    )
    .eq("user_id", user_id)
    .single();

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
  const formattedData = initialData
    ? {
        ...initialData,
        allergies: initialData.allergies.map((item: any) => item.allergy),
      }
    : fallbackUser;

  return (
    <UserProvider initialUser={formattedData}>
      <div className="flex w-full h-full">
        <Sidebar />
        <div className="w-5/6 h-full overflow-y-auto">{children}</div>
      </div>
    </UserProvider>
  );
}
