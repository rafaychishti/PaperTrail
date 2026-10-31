import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/supabase-auth";
import { signOut } from "@/app/auth/actions";

export default async function AuthControl() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return (
        <Link href="/login" className="rounded-md border border-ink/30 px-3 py-1.5 text-sm font-bold hover:border-red hover:text-red">
          Sign in
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="max-w-40 truncate text-muted">{user.email ?? "Google account"}</span>
        <form action={signOut}>
          <button type="submit" className="underline underline-offset-4 hover:text-red">Sign out</button>
        </form>
      </div>
    );
  } catch (error) {
    console.error("auth status lookup failed", error);
    return (
      <Link href="/login?error=auth_unavailable" className="rounded-md border border-ink/30 px-3 py-1.5 text-sm font-bold hover:border-red hover:text-red">
        Sign-in unavailable
      </Link>
    );
  }
}
