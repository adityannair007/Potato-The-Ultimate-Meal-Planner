import "@/app/globals.css";
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full bg-background text-foreground">{children}</div>;
}
