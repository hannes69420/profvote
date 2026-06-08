import Link from 'next/link';
import { GlobalSearch } from '@app/components/GlobalSearch';
import { ThemeToggle } from '@app/components/ThemeToggle';

const Header = () => (
  <header
    className="sticky top-0 z-40 border-b backdrop-blur-md"
    style={{ background: 'rgb(var(--bg) / 0.8)', borderColor: 'rgb(var(--border))' }}
  >
    <div className="container-prose flex h-14 items-center justify-between gap-2 sm:gap-4">
      <Link href="/" className="shrink-0 font-display text-lg font-semibold tracking-tightest text-ink-soft">
        ProfVote
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
        <Link href="/uni/stuttgart" className="transition-colors hover:text-ink-soft">
          Stuttgart
        </Link>
        <Link href="/uni/kit" className="transition-colors hover:text-ink-soft">
          KIT
        </Link>
        <Link href="/vergleich" className="transition-colors hover:text-ink-soft">
          Vergleich
        </Link>
      </nav>
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <GlobalSearch />
        <ThemeToggle />
      </div>
    </div>
  </header>
);

export default Header;
