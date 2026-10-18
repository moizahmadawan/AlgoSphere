import { Activity, Github, Menu, X } from 'lucide-react';
import type { Route } from '@/types';
import { useState } from 'react';

interface NavItem {
  label: string;
  route: Route;
}

const NAV: NavItem[] = [
  { label: 'Home', route: 'home' },
  { label: 'Dashboard', route: 'dashboard' },
  { label: 'Sorting', route: 'sorting' },
  { label: 'Graph Lab', route: 'graphs' },
  { label: 'CPU Scheduling', route: 'scheduling' },
  { label: 'Exercises', route: 'exercises' },
];

interface Props {
  current: Route;
  onNavigate: (r: Route) => void;
}

export function Header({ current, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const go = (r: Route) => {
    onNavigate(r);
    setOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-ink-border/80 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-lime/10 ring-1 ring-lime/30">
            <Activity className="h-5 w-5 text-lime" />
            <div className="absolute inset-0 rounded-xl bg-lime/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-left leading-tight">
            <div className="font-semibold tracking-tight text-content-primary">AlgoSphere</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-content-faint">CS Learning Lab</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <button
              key={item.route}
              onClick={() => go(item.route)}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                current === item.route ? 'text-content-primary' : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              {item.label}
              {current === item.route && (
                <span className="absolute inset-x-2 -bottom-px h-px bg-lime/70" />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-subtle"
          >
            <Github className="h-4 w-4" /> Source
          </a>
        </div>

        <button onClick={() => setOpen((o) => !o)} className="md:hidden btn-ghost !px-2.5">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-border bg-ink-panel px-4 py-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV.map((item) => (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
                  current === item.route ? 'bg-lime/10 text-lime' : 'text-content-secondary hover:bg-ink-raised'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
