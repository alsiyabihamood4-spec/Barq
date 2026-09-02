import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function RootPage() {
  const hasToken = cookies().has("tanafus_admin_token");
  redirect(hasToken ? "/overview" : "/sign-in");
}
