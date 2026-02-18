import { createClient } from "@/app/lib/supabase/server";
import ProfileClient from "./profileClient";
import { user } from "@/app/types/user";
export type Item = {
  id: number;
  name: string;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const user_id = "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d";
  const { data, error } = await supabase
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

  return <ProfileClient initialData={data || fallbackUser} />;
}
