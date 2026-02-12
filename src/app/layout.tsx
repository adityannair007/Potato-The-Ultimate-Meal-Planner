import Sidebar from "@/components/sidebar";
import { createClient } from "./lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Hardcoded ID for now as per your setup
  const user_id = "d7b8a1c2-e3f4-4a5b-9c6d-7e8f9a0b1c2d";

  const { data } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("user_id", user_id)
    .single();
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-yellow-50">
        <div className="flex w-full h-full">
          <Sidebar avatar_url={data?.avatar_url} />
          <div className="w-5/6 h-full overflow-y-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
