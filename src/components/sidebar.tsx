"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Import your global styles
import "../app/globals.css";
import Image from "next/image";
import * as motion from "motion/react-client";

export default function Sidebar({ avatar_url }: { avatar_url: string | null }) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const baseStyle =
      "flex justify-center items-center h-24 w-full rounded-xl transition-colors duration-150";
    if (pathname === path) {
      return `${baseStyle} bg-slate-800 text-amber-400`;
    }
    return `${baseStyle} text-slate-400 hover:bg-slate-800 hover:text-white`;
  };

  return (
    <div className="flex flex-col h-full w-1/6 p-4 justify-evenly items-center bg-slate-900">
      <Link href="/profile">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative w-25 h-25 rounded-full hover:border-3 hover:border-amber-600"
        >
          <Image
            fill
            src={avatar_url || ""}
            alt="Profile picture"
            className="object-cover rounded-full"
          />
        </motion.div>
      </Link>

      <Link href="/home" className={getLinkClasses("/home")}>
        <h1 className="text-xl font-semibold">Home</h1>
      </Link>

      <Link href="/planner" className={getLinkClasses("/planner")}>
        <h1 className="text-xl font-semibold">Planner</h1>
      </Link>

      <Link href="/surprise" className={getLinkClasses("/surprise")}>
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
