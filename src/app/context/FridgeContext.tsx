"use client";

import { createContext, useContext, useState } from "react";
import { ingredient } from "../types/fridge";

interface fridgeContextType {
  ingredients: ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<ingredient[]>>;
  addIngredient: (ingredient: ingredient) => void;
  removeIngredient: (ingredient: string) => void;
}

const FridgeContext = createContext<fridgeContextType | undefined>(undefined);

export function FridgeProvider({
  children,
  initialIngredients,
}: {
  children: React.ReactNode;
  initialIngredients: ingredient[];
}) {
  const [ingredients, setIngredients] =
    useState<ingredient[]>(initialIngredients);
  const addIngredient = (ingredient: ingredient) =>
    setIngredients((prev) => [...prev, ingredient]);
  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.fridge_id !== id));

  return (
    <FridgeContext.Provider
      value={{ ingredients, setIngredients, addIngredient, removeIngredient }}
    >
      {children}
    </FridgeContext.Provider>
  );
}

export const useFridge = () => {
  const context = useContext(FridgeContext);
  if (!context) throw new Error("useFridge must be used within FridgeProvider");
  return context;
};
