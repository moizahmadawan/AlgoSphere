import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Shuffle, Plus, Minus, Zap } from 'lucide-react';
import type { SortingStep } from '@/types';
import { SORTING_ALGORITHMS } from '@/engines/sorting';

type AlgoId = (typeof SORTING_ALGORITHMS)[number]['id'];

export function SortingLab() {
  const [algoId, setAlgoId] = useState<AlgoId>('bubble');
  const [size, setSize] = useState(12);
  const [speed, setSpeed] = useState(60);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [array, setArray] = useState<number[]>(() => randomArray(12));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const algo = useMemo(() => SORTING_ALGORITHMS.find((a) => a.id === algoId)!, [algoId]);
  const steps = useMemo<SortingStep[]>(() => algo.generate(array), [algo, array]);
  const step = steps[stepIndex] ?? steps[0];
  const max = useMemo(() => Math.max(...array, 1), [array]);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [array, algoId]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(40, 620 - speed * 6);
    timer.current = window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, stepIndex, steps.length, speed]);

  const regenerate = useCallback((nextSize: number) => {
    setArray(randomArray(nextSize));
    setCustomInput('');
    setInputError(null);
  }, []);

  const applyCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setInputError('Enter comma-separated numbers, e.g. 5, 2, 4, 1.');
      return;
    }
    const parts = trimmed.split(/[,\s]+/).filter(Boolean);
    const nums = parts.map((p) => Number(p));
    if (nums.some((n) => !Number.isFinite(n))) {
      setInputError('All values must be numbers.');
      return;
    }
    if (nums.length < 2 || nums.length > 40) {
      setInputError('Provide between 2 and 40 numbers.');
      return;
    }
    if (nums.some((n) => n < 1 || n > 999)) {
      setInputError('Values must be between 1 and 999.');
      return;
    }
    setArray(nums);
    setSize(nums.length);
    setInputError(null);
  };

  const onSizeChange = (n: number) => {
    const clamped = Math.min(40, Math.max(4, n));
    setSize(clamped);
    regenerate(clamped);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sorting Visualizer</h1>
        <p className="mt-1 text-content-secondary">Pick an algorithm, configure the array, and step through every comparison and swap.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr_320px] gap-4">
        <div className="panel p-5 space-y-5 h-fit">
          <div>
            <div className="label mb-2">Algorithm</div>
            <div className="grid gap-1.5">
              {SORTING_ALGORITHMS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAlgoId(a.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    algoId === a.id ? 'bg-lime/10 text-lime ring-1 ring-lime/30' : 'text-content-secondary hover:bg-ink-raised'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="label">Array size</div>
              <span className="text-sm font-mono text-content-primary">{size}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onSizeChange(size - 1)} className="btn-ghost !px-2 !py-1.5">
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="range"
                min={4}
                max={40}
                value={size}
                onChange={(e) => onSizeChange(Number(e.target.value))}
                className="flex-1 accent-lime"
              />
              <button onClick={() => onSizeChange(size + 1)} className="btn-ghost !px-2 !py-1.5">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="label">Speed</div>
              <span className="text-sm font-mono text-content-primary">{speed}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-lime"
            />
          </div>

          <div>
            <div className="label mb-2">Custom array</div>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="5, 2, 4, 1, 8"
              className="input font-mono"
            />
            {inputError && <p className="mt-1.5 text-xs text-rose">{inputError}</p>}
            <button onClick={applyCustom} className="btn-ghost mt-2 w-full">
              <Plus className="h-3.5 w-3.5" /> Apply values
            </button>
          </div>

          <button onClick={() => regenerate(size)} className="btn-ghost w-full">
            <Shuffle className="h-3.5 w-3.5" /> Generate random
          </button>
        </div>

        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs label">Visualizing</div>
              <div className="text-lg font-semibold text-content-primary">{algo.name}</div>
            </div>
            <Legend />
          </div>

          <div className="flex items-end justify-between gap-1 h-72 rounded-xl bg-ink-base/60 border border-ink-border p-3">
            {step.array.map((v, i) => {
              const isCompared = step.comparing?.includes(i);
              const isSwapped = step.swapping?.includes(i);
              const isPivot = step.pivot === i;
              const isSorted = step.sorted.includes(i);
              const isActive = step.active === i;
              const color = isSwapped
                ? 'bg-rose'
                : isPivot
                  ? 'bg-amber'
                  : isCompared
                    ? 'bg-amber/80'
                    : isActive
                      ? 'bg-sky'
                      : isSorted
                        ? 'bg-lime'
                        : 'bg-sky/50';
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className={`w-full rounded-t-md ${color} transition-all duration-200`}
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                  <span className="text-[10px] font-mono text-content-faint">{v}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-xs text-content-faint mb-2">
              <span>step</span>
              <span className="text-content-secondary font-mono">{stepIndex + 1} / {steps.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-base overflow-hidden">
              <div
                className="h-full bg-lime transition-all"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => { setPlaying(false); setStepIndex(0); }}
              className="btn-ghost"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setPlaying(false); setStepIndex((i) => Math.max(0, i - 1)); }}
              className="btn-ghost"
              title="Previous step"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (stepIndex >= steps.length - 1) setPlaying(false);
                else setPlaying((p) => !p);
              }}
              className="btn-primary"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => { setPlaying(false); setStepIndex((i) => Math.min(steps.length - 1, i + 1)); }}
              className="btn-ghost"
              title="Next step"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setPlaying(false); setStepIndex(steps.length - 1); }}
              className="btn-ghost"
              title="Skip to end"
            >
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label mb-2">Step explanation</div>
            <p className="text-sm text-content-primary leading-relaxed font-mono">
              <span className="text-lime">›</span> {step.description}
            </p>
          </div>

          <div className="panel p-5">
            <div className="label mb-3">Live statistics</div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Compares" value={step.comparisons} tone="text-amber" />
              <Stat label="Swaps" value={step.swaps} tone="text-rose" />
              <Stat label="Accesses" value={step.arrayAccesses} tone="text-sky" />
            </div>
            <p className="mt-3 text-xs text-content-faint">
              Counts are measured from this exact run, not theoretical estimates.
            </p>
          </div>

          <div className="panel p-5">
            <div className="label mb-3">Complexity</div>
            <div className="space-y-2 text-sm">
              <Row k="Best case" v={algo.bestCase} />
              <Row k="Average" v={algo.averageCase} />
              <Row k="Worst case" v={algo.worstCase} />
              <Row k="Space" v={algo.spaceComplexity} />
              <Row k="Stable" v={algo.stable ? 'Yes' : 'No'} />
              <Row k="In-place" v={algo.inPlace ? 'Yes' : 'No'} />
            </div>
            <p className="mt-4 text-xs text-content-secondary leading-relaxed">{algo.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { c: 'bg-sky/50', l: 'Unsorted' },
    { c: 'bg-amber', l: 'Comparing' },
    { c: 'bg-rose', l: 'Swapping' },
    { c: 'bg-lime', l: 'Sorted' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <div key={i.l} className="flex items-center gap-1.5 text-xs text-content-secondary">
          <span className={`h-2.5 w-2.5 rounded-sm ${i.c}`} />
          {i.l}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-ink-base border border-ink-border p-3 text-center">
      <div className={`text-xl font-semibold font-mono ${tone}`}>{value}</div>
      <div className="text-xs text-content-faint mt-0.5">{label}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-content-secondary">{k}</span>
      <span className="font-mono text-content-primary">{v}</span>
    </div>
  );
}

function randomArray(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 8);
}
