// app/home/profile/page.tsx
import { createClient } from "@/app/lib/supabase/server"; // Ensure this path is correct
import ProfileClient from "./profileClient";

// Define and export the type so the client can use it too
export type Item = {
  id: number;
  name: string;
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Fetch the user's currently saved allergies
  const { data, error } = await supabase.from("allergy").select("id, name");

  if (error) {
    console.error("Error fetching allergies:", error);
    // You can return an error message here if you want
  }

  // 2. Pass the fetched data as a prop to the client component
  return <ProfileClient initialAllergies={(data as Item[]) || []} />;
}
