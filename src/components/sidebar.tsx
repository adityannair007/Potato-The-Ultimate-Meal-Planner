"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import * as motion from "motion/react-client";
import { GiPotato } from "react-icons/gi";

import { useUser } from "@/app/context/UserContext";
import ThemeToggle from "@/components/theme-toggle";

export default function Sidebar() {
  const { user } = useUser();
  if (!user) console.log("No user found!");
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const baseStyle =
      "flex h-24 w-full items-center justify-center rounded-xl border border-transparent px-4 text-center transition-colors duration-150";
    if (pathname === path) {
      return `${baseStyle} border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground shadow-md`;
    }
    return `${baseStyle} text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`;
  };

  return (
    <div className="flex h-full w-1/6 min-w-52 flex-col items-center justify-between border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground transition-colors duration-200">
      <div className="flex w-full flex-col justify-between h-full items-center gap-6">
        <Link href="/profile" className="flex items-center justify-center pt-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-sidebar-border bg-sidebar-primary/15 shadow-md transition-colors hover:border-sidebar-ring"
          >
            {user?.avatar_url != null ? (
              <Image
                fill
                src={user?.avatar_url}
                alt="Profile picture"
                sizes="96px"
                className="object-cover rounded-full"
              />
            ) : (
              <GiPotato
                className="rounded-xl p-4 text-sidebar-primary"
                size={100}
              />
            )}
          </motion.div>
        </Link>

        <div className="w-full space-y-6">
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

        <ThemeToggle />
      </div>
    </div>
  );
}
