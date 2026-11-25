/** Product mark: ECU chip with a fuel drop. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="13" fill="rgb(var(--panel))" stroke="rgb(var(--cool))" strokeWidth="2.5" />
      <path d="M22 10v8M32 10v8M42 10v8M22 46v8M32 46v8M42 46v8M10 22h8M10 32h8M10 42h8M46 22h8M46 32h8M46 42h8" stroke="rgb(var(--mute))" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="17" y="17" width="30" height="30" rx="4" fill="rgb(var(--panel2))" stroke="rgb(var(--cool))" strokeWidth="3" />
      <path d="M32 22c4 4.5 6 7.200 6 9.800a6 6 0 0 1-12 0c0-2.600 2-5.300 6-9.800z" fill="rgb(var(--amber))" />
    </svg>
  );
}
