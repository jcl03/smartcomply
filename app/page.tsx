import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to sign-in page when accessing the root URL
  redirect("/sign-in");
}
