"use client";
// app/layout.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

// Import your global styles
import "./globals.css";

// --- Sidebar Component (New Minimalist UI) ---
function Sidebar() {
  const pathname = usePathname();

  // This function now returns all classes for clarity
  const getLinkClasses = (path: string) => {
    // Base classes for all links
    const baseStyle =
      "flex justify-center items-center h-24 w-full rounded-xl transition-colors duration-150";

    if (pathname === path) {
      // Active link: white text on a subtle dark background
      return `${baseStyle} bg-slate-800 text-amber-400`;
    }
    // Inactive link: muted gray text, brightens on hover
    return `${baseStyle} text-slate-400 hover:bg-slate-800 hover:text-white`;
  };

  return (
    // Main sidebar: Uses a dark, neutral slate color
    <div className="flex flex-col h-full w-1/6 p-4 justify-evenly items-center bg-slate-900">
      <Link href="/profile">
        {/* Profile: Now uses your amber color as a single accent */}
        <div className="rounded-full h-16 w-16 bg-amber-500 cursor-pointer hover:bg-amber-400 transition-colors"></div>
      </Link>

      {/* --- Nav Links (Simplified) --- */}
      <Link href="/home" className={getLinkClasses("/home")}>
        <h1 className="text-xl font-semibold">Home</h1>
      </Link>

      <Link href="/planner" className={getLinkClasses("/planner")}>
        <h1 className="text-xl font-semibold">Planner</h1>
      </Link>

      <Link href="/surprise" className={getLinkClasses("/surprise")}>
        {/* Kept your two-line design, just with new styles */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-semibold">Surprise</h1>
          <h1 className="text-xl font-semibold">me</h1>
        </div>
      </Link>

      <Link href="/fridge" className={getLinkClasses("/fridge")}>
        <h1 className="text-xl font-semibold">Fridge</h1>
      </Link>
    </div>
  );
}

// --- The Root Layout Component ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      {/* This <body> tag still has your 'bg-yellow-600' class.
        For a true minimalist look, you might change this to 'bg-slate-50'
        to have a white/light gray content area.
      */}
      <body className="h-full bg-yellow-600">
        <div className="flex w-full h-full">
          <Sidebar />
          <div className="w-5/6 h-full overflow-y-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
