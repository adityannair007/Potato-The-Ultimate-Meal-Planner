import { createClient } from "@/app/lib/supabase/server";
import ProfileClient from "./profileClient";
export type Item = {
  id: number;
  name: string;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("allergy").select("id, name");

  if (error) {
    console.error("Error fetching allergies:", error);
  }
  return <ProfileClient initialAllergies={(data as Item[]) || []} />;
}
