"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { user } from "../types/user";

const UserContext = createContext<
  | {
      user: user | null;
      setUser: (user: user | null) => void;
    }
  | undefined
>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: user | null;
}) {
  const [user, setUser] = useState<user | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
