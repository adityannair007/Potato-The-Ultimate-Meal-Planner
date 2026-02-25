import "@/app/globals.css";
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full bg-yellow-50">{children}</div>;
}
