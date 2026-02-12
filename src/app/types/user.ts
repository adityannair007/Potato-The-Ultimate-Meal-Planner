export type user = {
  username: string;
  avatar_url: string;
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
