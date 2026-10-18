import { ArrowRight, BarChart3, Network, Cpu, Brain, Layers, Sparkles, Play, Pause, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Route } from '@/types';
import { SORTING_ALGORITHMS } from '@/engines/sorting';

interface Props {
  onNavigate: (r: Route) => void;
}

export function Landing({ onNavigate }: Props) {
  return (
    <div className="bg-ink-base">
      <Hero onNavigate={onNavigate} />
      <Modules onNavigate={onNavigate} />
      <HowItWorks />
      <Benefits />
      <Cta onNavigate={onNavigate} />
    </div>
  );
}

function Hero({ onNavigate }: Props) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeed((s) => s + 1), 6000);
    return () => clearInterval(id);
  }, []);

  const array = useMemo(() => {
    const rng = mulberry32(seed * 1337 + 7);
    return Array.from({ length: 14 }, () => Math.floor(rng() * 90) + 8);
  }, [seed]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
        <div className="absolute top-40 right-10 h-[300px] w-[300px] rounded-full bg-sky/5 blur-[100px]" />
        <Grid />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="chip">
            <Sparkles className="h-3.5 w-3.5 text-lime" />
            Interactive CS Learning Lab
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-content-primary leading-[1.05]">
            See algorithms{' '}
            <span className="bg-gradient-to-r from-lime to-lime-soft bg-clip-text text-transparent">run</span>, not just read about them.
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-content-secondary leading-relaxed">
            AlgoSphere turns abstract computer science into living visualizations. Step through sorting, graph traversal,
            and CPU scheduling — pause anywhere, inspect state, and learn the why behind every move.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate('sorting')} className="btn-primary">
              <Play className="h-4 w-4" /> Launch Sorting Lab
            </button>
            <button onClick={() => onNavigate('dashboard')} className="btn-ghost">
              Explore Modules <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: 'Sorting algorithms', value: '5' },
              { label: 'Graph traversals', value: '3' },
              { label: 'CPU schedulers', value: '4' },
            ].map((s) => (
              <div key={s.label} className="panel px-4 py-3">
                <div className="text-2xl font-semibold text-lime">{s.value}</div>
                <div className="text-xs text-content-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual array={array} />
      </div>
    </section>
  );
}

function HeroVisual({ array }: { array: number[] }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const steps = useMemo(() => SORTING_ALGORITHMS[0].generate(array), [array]);

  useEffect(() => {
    setStep(0);
  }, [array]);

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      const t = setTimeout(() => setStep(0), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 260);
    return () => clearTimeout(t);
  }, [step, playing, steps.length]);

  const s = steps[step] ?? steps[0];
  const max = Math.max(...array, 1);

  return (
    <div className="panel p-5 shadow-card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-lime/80" />
          <span className="ml-2 text-xs font-mono text-content-secondary">bubble_sort.live</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPlaying((p) => !p)} className="btn-ghost !px-2 !py-1.5">
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setStep(0)} className="btn-ghost !px-2 !py-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-1 h-56 rounded-xl bg-ink-base/60 border border-ink-border p-3">
        {s.array.map((v, i) => {
          const isCompared = s.comparing?.includes(i);
          const isSwapped = s.swapping?.includes(i);
          const isSorted = s.sorted.includes(i);
          const color = isSwapped
            ? 'bg-rose'
            : isCompared
              ? 'bg-amber'
              : isSorted
                ? 'bg-lime'
                : 'bg-sky/70';
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-md ${color} transition-all duration-200`}
              style={{ height: `${(v / max) * 100}%` }}
            />
          );
        })}
      </div>
      <p className="mt-4 text-sm text-content-secondary font-mono leading-relaxed min-h-[2.5rem]">
        <span className="text-lime">›</span> {s.description}
      </p>
      <div className="mt-3 flex items-center gap-4 text-xs text-content-faint">
        <span>step <span className="text-content-secondary">{step + 1}/{steps.length}</span></span>
        <span>comparisons <span className="text-content-secondary">{s.comparisons}</span></span>
        <span>swaps <span className="text-content-secondary">{s.swaps}</span></span>
      </div>
    </div>
  );
}

function Modules({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const cards = [
    {
      icon: BarChart3,
      title: 'Sorting Visualizer',
      desc: 'Bubble, Selection, Insertion, Merge, and Quick Sort with step-by-step narration and operation counters.',
      route: 'sorting' as Route,
      tone: 'lime',
    },
    {
      icon: Network,
      title: 'Graph Lab',
      desc: 'Build graphs, run BFS, DFS, and Dijkstra, and watch traversal order and shortest paths appear in real time.',
      route: 'graphs' as Route,
      tone: 'sky',
    },
    {
      icon: Cpu,
      title: 'CPU Scheduling',
      desc: 'Simulate FCFS, SJF, Round Robin, and Priority scheduling with animated Gantt charts and timing metrics.',
      route: 'scheduling' as Route,
      tone: 'amber',
    },
    {
      icon: Brain,
      title: 'Exercises',
      desc: 'Predict the next step, identify traversal order, and test your understanding with instant feedback.',
      route: 'exercises' as Route,
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Learning modules</h2>
          <p className="mt-2 text-content-secondary">Each module runs entirely in your browser — no account required.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={() => onNavigate(c.route)}
            className="panel p-5 text-left group hover:border-lime/40 transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${toneMap[c.tone]}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-content-primary">{c.title}</h3>
            <p className="mt-2 text-sm text-content-secondary leading-relaxed">{c.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-lime opacity-80 group-hover:opacity-100">
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Choose a module', desc: 'Pick sorting, graphs, scheduling, or exercises from the dashboard.' },
    { n: '02', title: 'Configure inputs', desc: 'Generate random data, enter custom values, or add nodes and processes.' },
    { n: '03', title: 'Run the simulation', desc: 'Play, pause, step forward or backward, and watch each state change.' },
    { n: '04', title: 'Read the explanation', desc: 'Every step includes a plain-language description and live operation counts.' },
  ];
  return (
    <section className="border-y border-ink-border bg-ink-panel/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-content-secondary">From picking a module to understanding each step — four moves.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="relative panel p-6">
              <div className="text-5xl font-bold text-ink-muted font-mono">{s.n}</div>
              <h3 className="mt-3 font-semibold text-content-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-content-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Layers, title: 'Step-by-step clarity', desc: 'Pause on any state and read exactly what the algorithm did and why.' },
    { icon: BarChart3, title: 'Real operation counts', desc: 'Comparisons, swaps, and accesses are measured from the actual run, not fabricated.' },
    { icon: Brain, title: 'Active learning', desc: 'Predict next steps and test your understanding with instant feedback exercises.' },
    { icon: Network, title: 'Build your own graphs', desc: 'Add nodes and weighted edges, then run BFS, DFS, or Dijkstra on your own structure.' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Built for students who want to understand, not memorize</h2>
          <p className="mt-3 text-content-secondary leading-relaxed">
            Reading pseudocode is one thing. Watching values move, comparisons happen, and the sorted region grow is another.
            AlgoSphere is the bridge between theory and intuition.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {items.map((b) => (
              <div key={b.title} className="flex gap-3">
                <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime/10 text-lime ring-1 ring-lime/20">
                  <b.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-content-primary text-sm">{b.title}</div>
                  <div className="mt-1 text-sm text-content-secondary leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs label">Sample complexity chart</div>
            <div className="chip"><BarChart3 className="h-3 w-3" /> Theoretical</div>
          </div>
          <ComplexityChart />
        </div>
      </div>
    </section>
  );
}

function ComplexityChart() {
  const data = [
    { algo: 'Bubble', worst: 100, avg: 80, color: 'bg-rose' },
    { algo: 'Selection', worst: 100, avg: 100, color: 'bg-amber' },
    { algo: 'Insertion', worst: 100, avg: 50, color: 'bg-sky' },
    { algo: 'Merge', worst: 40, avg: 40, color: 'bg-lime' },
    { algo: 'Quick', worst: 100, avg: 40, color: 'bg-lime-soft' },
  ];
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.algo}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-content-secondary">{d.algo}</span>
            <span className="text-content-faint font-mono">n² / n log n</span>
          </div>
          <div className="flex gap-1.5 h-3 rounded-full bg-ink-base overflow-hidden">
            <div className={`${d.color} transition-all`} style={{ width: `${d.worst}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cta({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
      <div className="panel p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-lime/5 via-transparent to-sky/5" />
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Start exploring algorithms visually</h2>
        <p className="mt-3 text-content-secondary max-w-lg mx-auto">
          No sign-up. No setup. Pick a module and start stepping through the logic.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="btn-primary">
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate('exercises')} className="btn-ghost">
            Try Exercises
          </button>
        </div>
      </div>
    </section>
  );
}

function Grid() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#303238" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
