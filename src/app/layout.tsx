import Sidebar from "@/components/sidebar";
import { createClient } from "./lib/supabase/server";
import { UserProvider } from "./context/UserContext";
import { user } from "./types/user";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: initialData, error } = await supabase
    .from("users")
    .select(
      `username, avatar_url, weight, height, age, gender, weight_goal, allergies:user_allergy(allergy:allergy(allergy_id, name))`,
    )
    .eq("user_id", "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d")
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
    <html lang="en" className="h-full">
      <body className="h-full bg-yellow-50">
        <UserProvider initialUser={formattedData}>
          <div className="flex w-full h-full">
            <Sidebar avatar_url={initialData?.avatar_url || ""} />
            <div className="w-5/6 h-full overflow-y-auto">{children}</div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
