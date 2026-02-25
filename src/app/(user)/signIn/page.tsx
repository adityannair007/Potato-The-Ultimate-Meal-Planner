import { Metadata } from "next";
import SignInPage from "./signInClient";

export const metaData: Metadata = {
  title: "Login | Potato",
  description: "Access your personalized recipes and meal plans",
};

export default function LoginPage() {
  return <SignInPage />;
}
