import { ArrowRight, BarChart3, Network, Cpu, Brain, Clock, TrendingUp, BookOpen, Sparkles } from 'lucide-react';
import type { Route } from '@/types';

interface Props {
  onNavigate: (r: Route) => void;
}

export function Dashboard({ onNavigate }: Props) {
  const modules = [
    {
      icon: BarChart3,
      title: 'Sorting Visualizer',
      desc: 'Watch bubble, selection, insertion, merge, and quick sort step through real data with live counters.',
      route: 'sorting' as Route,
      meta: '5 algorithms',
      tone: 'lime',
    },
    {
      icon: Network,
      title: 'Graph Lab',
      desc: 'Build a graph and run BFS, DFS, or Dijkstra. See visit order, frontier, and shortest path animate.',
      route: 'graphs' as Route,
      meta: '3 traversals',
      tone: 'sky',
    },
    {
      icon: Cpu,
      title: 'CPU Scheduling Lab',
      desc: 'Configure processes and compare FCFS, SJF, Round Robin, and Priority scheduling with Gantt charts.',
      route: 'scheduling' as Route,
      meta: '4 schedulers',
      tone: 'amber',
    },
    {
      icon: Brain,
      title: 'Learning Exercises',
      desc: 'Predict the next step, identify traversal order, and get instant feedback with explanations.',
      route: 'exercises' as Route,
      meta: 'Instant feedback',
      tone: 'rose',
    },
  ];
  const toneMap: Record<string, string> = {
    lime: 'bg-lime/10 text-lime ring-lime/30',
    sky: 'bg-sky/10 text-sky ring-sky/30',
    amber: 'bg-amber/10 text-amber ring-amber/30',
    rose: 'bg-rose/10 text-rose ring-rose/30',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="animate-fade-up">
        <span className="chip">
          <Sparkles className="h-3.5 w-3.5 text-lime" /> Welcome to your learning lab
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-content-secondary max-w-2xl">
          Pick a module to start experimenting. Everything runs in your browser — no account needed to explore.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Available modules" value="4" sub="Sorting · Graphs · Scheduling · Exercises" />
        <StatCard icon={TrendingUp} label="Algorithms ready" value="12" sub="Run instantly in the browser" />
        <StatCard icon={Clock} label="Account-free" value="100%" sub="All visualizers work as a guest" />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <button
              key={m.title}
              onClick={() => onNavigate(m.route)}
              className="panel p-5 text-left group hover:border-lime/40 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${toneMap[m.tone]}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <span className="chip">{m.meta}</span>
              </div>
              <h3 className="mt-4 font-semibold text-content-primary">{m.title}</h3>
              <p className="mt-2 text-sm text-content-secondary leading-relaxed">{m.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-lime opacity-80 group-hover:opacity-100">
                Open module <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-3 gap-4">
        <div className="panel p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Recommended starting points</h2>
          <p className="mt-1 text-sm text-content-secondary">New to algorithms? Try these in order.</p>
          <ol className="mt-5 space-y-3">
            {[
              { t: 'Bubble Sort — see adjacent swaps', r: 'sorting' as Route },
              { t: 'BFS on a sample graph — breadth-first discovery', r: 'graphs' as Route },
              { t: 'FCFS scheduling — the simplest scheduler', r: 'scheduling' as Route },
              { t: 'Predict-the-step exercise — test your intuition', r: 'exercises' as Route },
            ].map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => onNavigate(item.r)}
                  className="w-full flex items-center gap-3 rounded-xl border border-ink-border bg-ink-raised px-4 py-3 text-left hover:border-lime/40 transition-colors group"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime/10 text-lime text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-content-primary">{item.t}</span>
                  <ArrowRight className="h-4 w-4 text-content-faint group-hover:text-lime transition-colors" />
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel p-6">
          <h2 className="text-lg font-semibold">Tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-content-secondary">
            <li className="flex gap-2"><span className="text-lime">·</span> Use step-by-step controls to inspect each comparison or swap.</li>
            <li className="flex gap-2"><span className="text-lime">·</span> Enter your own input arrays to test edge cases.</li>
            <li className="flex gap-2"><span className="text-lime">·</span> Dijkstra rejects negative weights by design — the panel explains why.</li>
            <li className="flex gap-2"><span className="text-lime">·</span> Gantt charts show the exact execution timeline of your processes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof BarChart3; label: string; value: string; sub: string }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink-raised text-content-secondary ring-1 ring-ink-border">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-3xl font-semibold text-content-primary">{value}</div>
      </div>
      <div className="mt-3 text-sm font-medium text-content-primary">{label}</div>
      <div className="text-xs text-content-faint mt-0.5">{sub}</div>
    </div>
  );
}
