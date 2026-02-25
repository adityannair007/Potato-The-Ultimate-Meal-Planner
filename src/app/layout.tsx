import "@/app/globals.css";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="w-full h-full overflow-y-auto bg-yellow-50">
        {children}
      </body>
    </html>
  );
}
