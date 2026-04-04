import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  // Allow disabling public registration via env var
  if (process.env.REGISTRATION_OPEN === "false") {
    redirect("/login?info=invite_only");
  }
  return <RegisterForm />;
}
