import Link from "next/link";
import { safeReturnPath } from "@/lib/auth-utils";

const ERRORS: Record<string, string> = {
  auth_unavailable: "Sign-in is unavailable because Supabase is not configured.",
  provider_unavailable: "Google sign-in could not be started. Check that the Google provider is enabled in Supabase.",
  callback_failed: "Google sign-in did not complete. Please try again.",
  sign_out_failed: "We couldn't sign you out. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? null);
  const signInUrl = `/auth/google?next=${encodeURIComponent(next)}`;
  const error = params.error ? ERRORS[params.error] : null;

  return (
    <section className="mx-auto max-w-lg py-16">
      <p className="hand text-lg text-red">PaperTrail</p>
      <h1 className="mt-2 text-3xl font-bold">Save your progress</h1>
      <p className="mt-3 text-muted">
        Sign in with Google to keep your marked attempts with your account and see your progress on another device.
        You can keep using PaperTrail without an account too.
      </p>

      {error && <p role="alert" className="mt-6 rounded-sm bg-red-wash px-4 py-3 text-red">{error}</p>}

      <a href={signInUrl} className="mt-7 flex items-center justify-center gap-3 rounded-md bg-ink px-5 py-3 font-bold text-paper hover:opacity-90">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 rounded-full bg-white p-0.5">
          <path fill="#4285F4" d="M21.35 12.22c0-.71-.06-1.39-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.39h3.14c1.84-1.69 2.92-4.18 2.92-7.15Z" />
          <path fill="#34A853" d="M12 21.75c2.64 0 4.85-.88 6.47-2.38l-3.14-2.39c-.88.59-2 .95-3.33.95-2.56 0-4.73-1.73-5.51-4.05H3.25v2.46A9.77 9.77 0 0 0 12 21.75Z" />
          <path fill="#FBBC05" d="M6.49 13.88a5.87 5.87 0 0 1 0-3.76V7.66H3.25a9.75 9.75 0 0 0 0 8.68l3.24-2.46Z" />
          <path fill="#EA4335" d="M12 6.07c1.44 0 2.73.5 3.75 1.49l2.81-2.82C16.84 3.19 14.63 2.25 12 2.25a9.77 9.77 0 0 0-8.75 5.41l3.24 2.46C7.27 7.8 9.44 6.07 12 6.07Z" />
        </svg>
        Continue with Google
      </a>

      <p className="mt-4 text-sm text-muted">
        Google sign-in is handled by Supabase. PaperTrail does not receive or store your Google password.
      </p>
      <Link href={next} className="mt-7 inline-block text-sm font-bold underline underline-offset-4 hover:text-red">
        Continue without signing in
      </Link>
    </section>
  );
}
