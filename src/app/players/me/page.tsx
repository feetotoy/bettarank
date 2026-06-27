import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/data";

/**
 * Stable "my profile" route. Any logged-in player can reach their own profile
 * at /players/me, which resolves to their public profile slug. Not logged in →
 * send them home (swap for a /login redirect once auth exists).
 */
export default function MyProfilePage() {
  redirect(
    currentPlayer.loggedIn ? `/players/${currentPlayer.id}` : "/",
  );
}
