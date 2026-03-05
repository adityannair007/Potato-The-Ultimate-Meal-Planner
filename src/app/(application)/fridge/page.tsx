import FridgeClient from "./fridgeClient";

export type Item = {
  id: number;
  name: string;
};

export default async function FridgePage() {
  return <FridgeClient />;
}
