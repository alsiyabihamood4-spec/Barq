export function SignOutButton() {
  return (
    <form action="/api/auth/sign-out" method="POST">
      <button type="submit" className="text-[10px] text-ink/45 hover:text-accent-700 mono tracking-wide" title="Sign out">
        EXIT
      </button>
    </form>
  );
}
