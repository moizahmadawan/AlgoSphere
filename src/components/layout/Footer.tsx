interface Props {
  text?: string;
}

export function Footer({ text = 'AlgoSphere — Understand the logic. Visualize the process. Master the algorithm.' }: Props) {
  return (
    <footer className="border-t border-ink-border bg-ink-base">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-sm font-semibold text-content-primary">AlgoSphere</div>
            <p className="mt-1 max-w-md text-sm text-content-secondary">{text}</p>
          </div>
          <div className="text-xs text-content-faint">
            Open learning project · No credentials required to explore ·{' '}
            <span className="text-content-secondary">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
