import { Redirect } from "expo-router";
import { useSession } from "../src/state/session";

export default function Index() {
  const { token, user } = useSession();
  if (!token || !user) return <Redirect href="/(auth)/welcome" />;
  if (user.role === "client") return <Redirect href="/(client)/home" />;

  // Partner roles must clear KYC before the tender feed unlocks — mirrors
  // the prototype's kycBtnBg/kycOpacity gate and its 4a "under review" screen.
  if (user.kycStatus === "pending" || user.kycStatus === "missing_docs") return <Redirect href="/(partner)/onboarding" />;
  if (user.kycStatus === "in_review") return <Redirect href="/(partner)/under-review" />;
  return <Redirect href="/(partner)/feed" />;
}
