export type user = {
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
};
