export type foodRecipe = {
  name: string; // The title of the dish
  recipe: string[]; // Array of sequential steps (better for UI mapping)
  calories: number; // Estimated energy content
};
