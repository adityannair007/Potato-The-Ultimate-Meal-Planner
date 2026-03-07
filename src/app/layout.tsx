import "@/app/globals.css";

const themeInitScript = `
  (() => {
    try {
      const storageKey = "potato-theme";
      const storedTheme = window.localStorage.getItem(storageKey);
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      const theme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : systemTheme;

      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full w-full overflow-y-auto bg-background text-foreground antialiased transition-colors duration-200">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
