import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-8 text-xs text-slate-400 backdrop-blur-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Neo Commerce Labs. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-aurora-teal">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:text-aurora-teal">
            Terms
          </Link>
          <Link href="/docs/status" className="hover:text-aurora-teal">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
