"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface userProfile {
  username: string | null;
  avatar_url: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: string | null;
  weight_goal: number | null;
  allergies: {
    allergy: {
      allergy_id: number;
      name: string;
    }[];
  }[];
}

const UserContext = createContext<
  | {
      user: userProfile | null;
      setUser: (user: userProfile | null) => void;
    }
  | undefined
>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: userProfile | null;
}) {
  const [user, setUser] = useState<userProfile | null>(initialUser);

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
