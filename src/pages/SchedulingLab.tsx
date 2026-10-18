import { useMemo, useState } from 'react';
import { Plus, Trash2, Play, RotateCcw } from 'lucide-react';
import type { Process, SchedulingResult } from '@/types';
import { fcfs, sjf, roundRobin, priority } from '@/engines/scheduling';

type AlgoId = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority-np' | 'priority-p';

const ALGOS: { id: AlgoId; name: string; short: string; desc: string }[] = [
  { id: 'fcfs', name: 'First Come First Served', short: 'FCFS', desc: 'Runs processes in arrival order. Non-preemptive.' },
  { id: 'sjf', name: 'Shortest Job First', short: 'SJF', desc: 'Picks the process with the smallest burst time. Non-preemptive.' },
  { id: 'srtf', name: 'Shortest Remaining Time First', short: 'SRTF', desc: 'Preemptive SJF — switches if a shorter job arrives.' },
  { id: 'rr', name: 'Round Robin', short: 'RR', desc: 'Each process runs for a fixed time quantum, then requeues.' },
  { id: 'priority-np', name: 'Priority (Non-preemptive)', short: 'P-NP', desc: 'Picks the highest-priority ready process. Lower number = higher priority.' },
  { id: 'priority-p', name: 'Priority (Preemptive)', short: 'P-P', desc: 'Preemptive priority scheduling — switches if a higher-priority process arrives.' },
];

export function SchedulingLab() {
  const [algo, setAlgo] = useState<AlgoId>('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'P1', arrival: 0, burst: 5, priority: 2 },
    { id: 'P2', arrival: 1, burst: 3, priority: 1 },
    { id: 'P3', arrival: 2, burst: 8, priority: 3 },
    { id: 'P4', arrival: 3, burst: 6, priority: 2 },
  ]);
  const [nextId, setNextId] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo<SchedulingResult | null>(() => {
    if (processes.length === 0) return null;
    if (processes.some((p) => p.burst < 0 || p.arrival < 0)) return null;
    if (algo === 'rr' && (quantum < 1)) return null;
    try {
      switch (algo) {
        case 'fcfs': return fcfs(processes);
        case 'sjf': return sjf(processes, false);
        case 'srtf': return sjf(processes, true);
        case 'rr': return roundRobin(processes, quantum);
        case 'priority-np': return priority(processes, false);
        case 'priority-p': return priority(processes, true);
      }
    } catch {
      return null;
    }
  }, [processes, algo, quantum]);

  const update = (idx: number, field: keyof Process, value: number) => {
    setProcesses((ps) => ps.map((p, i) => (i === idx ? { ...p, [field]: Math.max(0, value) } : p)));
  };

  const addProcess = () => {
    setProcesses((ps) => [...ps, { id: `P${nextId}`, arrival: 0, burst: 4, priority: 1 }]);
    setNextId((n) => n + 1);
  };

  const removeProcess = (idx: number) => {
    setProcesses((ps) => ps.filter((_, i) => i !== idx));
  };

  const needsPriority = algo === 'priority-np' || algo === 'priority-p';
  const needsQuantum = algo === 'rr';
  const totalDuration = result?.gantt[result.gantt.length - 1]?.end ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CPU Scheduling Lab</h1>
        <p className="mt-1 text-content-secondary">Configure processes and compare scheduling algorithms with animated Gantt charts.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label">Algorithm</div>
                <div className="text-sm text-content-secondary mt-1">{ALGOS.find((a) => a.id === algo)?.desc}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {ALGOS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAlgo(a.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    algo === a.id ? 'bg-amber/10 text-amber ring-1 ring-amber/30' : 'text-content-secondary hover:bg-ink-raised'
                  }`}
                >
                  {a.short}
                </button>
              ))}
            </div>
            {needsQuantum && (
              <div className="mt-4 flex items-center gap-3">
                <label className="label">Time quantum</label>
                <input type="number" min={1} max={20} value={quantum} onChange={(e) => setQuantum(Math.max(1, Number(e.target.value)))} className="input w-24" />
              </div>
            )}
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="label">Processes</div>
              <button onClick={addProcess} className="btn-ghost !py-1.5"><Plus className="h-3.5 w-3.5" /> Add process</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-content-faint text-xs uppercase tracking-wider">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Arrival</th>
                    <th className="py-2 pr-3">Burst</th>
                    {needsPriority && <th className="py-2 pr-3">Priority</th>}
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <tr key={p.id} className="border-t border-ink-border">
                      <td className="py-2 pr-3 font-mono text-content-primary">{p.id}</td>
                      <td className="py-2 pr-3">
                        <input type="number" min={0} value={p.arrival} onChange={(e) => update(i, 'arrival', Number(e.target.value))} className="input w-20 py-1" />
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min={1} value={p.burst} onChange={(e) => update(i, 'burst', Number(e.target.value))} className="input w-20 py-1" />
                      </td>
                      {needsPriority && (
                        <td className="py-2 pr-3">
                          <input type="number" min={0} value={p.priority} onChange={(e) => update(i, 'priority', Number(e.target.value))} className="input w-20 py-1" />
                        </td>
                      )}
                      <td className="py-2">
                        <button onClick={() => removeProcess(i)} className="btn-subtle !px-2 !py-1"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {processes.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-content-faint text-sm">No processes. Add one to begin.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {error && <p className="mt-2 text-xs text-rose">{error}</p>}
          </div>

          {result && (
            <>
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="h-4 w-4 text-amber" />
                  <div className="font-medium">Gantt chart</div>
                </div>
                <GanttChart result={result} total={totalDuration} />
              </div>

              <div className="panel p-5">
                <div className="font-medium mb-4">Results</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-content-faint text-xs uppercase tracking-wider">
                        <th className="py-2 pr-3">PID</th>
                        <th className="py-2 pr-3">Arrival</th>
                        <th className="py-2 pr-3">Burst</th>
                        <th className="py-2 pr-3">Completion</th>
                        <th className="py-2 pr-3">Turnaround</th>
                        <th className="py-2 pr-3">Waiting</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((r) => (
                        <tr key={r.id} className="border-t border-ink-border">
                          <td className="py-2 pr-3 font-mono text-content-primary">{r.id}</td>
                          <td className="py-2 pr-3 font-mono">{r.arrival}</td>
                          <td className="py-2 pr-3 font-mono">{r.burst}</td>
                          <td className="py-2 pr-3 font-mono text-sky">{r.completion}</td>
                          <td className="py-2 pr-3 font-mono text-amber">{r.turnaround}</td>
                          <td className="py-2 pr-3 font-mono text-lime">{r.waiting}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-ink-border bg-ink-base p-4">
                    <div className="text-xs text-content-faint">Average waiting time</div>
                    <div className="mt-1 text-2xl font-semibold text-lime font-mono">{result.avgWaiting.toFixed(2)}</div>
                  </div>
                  <div className="rounded-xl border border-ink-border bg-ink-base p-4">
                    <div className="text-xs text-content-faint">Average turnaround time</div>
                    <div className="mt-1 text-2xl font-semibold text-amber font-mono">{result.avgTurnaround.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4 h-fit">
          <div className="panel p-5">
            <div className="label mb-3">Execution trace</div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {result?.steps.map((s, i) => (
                <div key={i} className="rounded-lg border border-ink-border bg-ink-base px-3 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-content-faint">t={s.time}</span>
                    {s.running ? <span className="chip !py-0.5">{s.running}</span> : <span className="text-content-faint">idle</span>}
                  </div>
                  <p className="mt-1 text-xs text-content-secondary">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="label mb-2">Formula reference</div>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li><span className="text-content-primary font-mono">Turnaround</span> = Completion − Arrival</li>
              <li><span className="text-content-primary font-mono">Waiting</span> = Turnaround − Burst</li>
              <li><span className="text-content-primary font-mono">Completion</span> = time process finishes</li>
              <li className="pt-2 text-content-faint">Priority: lower number = higher priority (configurable by convention).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const SEGMENT_COLORS = ['bg-lime', 'bg-sky', 'bg-amber', 'bg-rose', 'bg-lime-soft', 'bg-sky-soft'];

function GanttChart({ result, total }: { result: SchedulingResult; total: number }) {
  return (
    <div>
      <div className="flex h-14 w-full rounded-lg overflow-hidden border border-ink-border bg-ink-base">
        {result.gantt.map((seg, i) => {
          const widthPct = total > 0 ? ((seg.end - seg.start) / total) * 100 : 0;
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return (
            <div
              key={i}
              className={`${color} flex items-center justify-center text-ink-base text-xs font-semibold transition-all`}
              style={{ width: `${widthPct}%` }}
              title={`${seg.processId}: ${seg.start} → ${seg.end}`}
            >
              {widthPct > 6 && seg.processId}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-mono text-content-faint">
        <span>0</span>
        {result.gantt.map((seg, i) => (
          <span key={i}>{seg.end}</span>
        ))}
      </div>
    </div>
  );
}
