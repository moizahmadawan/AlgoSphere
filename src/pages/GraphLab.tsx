import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Shuffle, Plus, Trash2, Route as RouteIcon, Network } from 'lucide-react';
import type { GraphNode, GraphEdge, GraphStep } from '@/types';
import { bfs, dfs, dijkstra } from '@/engines/graphs';

type AlgoId = 'bfs' | 'dfs' | 'dijkstra';

const SAMPLE_NODES: GraphNode[] = [
  { id: 0, label: 'A', x: 0.15, y: 0.25 },
  { id: 1, label: 'B', x: 0.45, y: 0.15 },
  { id: 2, label: 'C', x: 0.75, y: 0.3 },
  { id: 3, label: 'D', x: 0.3, y: 0.6 },
  { id: 4, label: 'E', x: 0.6, y: 0.7 },
  { id: 5, label: 'F', x: 0.85, y: 0.65 },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 1, to: 2, weight: 3 },
  { from: 0, to: 3, weight: 2 },
  { from: 1, to: 3, weight: 5 },
  { from: 3, to: 4, weight: 6 },
  { from: 2, to: 4, weight: 1 },
  { from: 2, to: 5, weight: 2 },
  { from: 4, to: 5, weight: 3 },
];

export function GraphLab() {
  const [nodes, setNodes] = useState<GraphNode[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(SAMPLE_EDGES);
  const [algo, setAlgo] = useState<AlgoId>('bfs');
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [speed, setSpeed] = useState(70);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [edgeFrom, setEdgeFrom] = useState<number | ''>('');
  const [edgeTo, setEdgeTo] = useState<number | ''>('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stepsResult = useMemo<GraphStep[] | { error: string }>(() => {
    if (nodes.length === 0) return { error: 'Add at least one node.' };
    if (algo === 'bfs') return bfs(nodes, edges, start);
    if (algo === 'dfs') return dfs(nodes, edges, start);
    return dijkstra(nodes, edges, start, end);
  }, [nodes, edges, algo, start, end]);

  const isError = 'error' in stepsResult;
  const steps = isError ? [] : stepsResult;
  const step = steps[stepIndex] ?? steps[0];

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
    setError(isError ? (stepsResult as { error: string }).error : null);
  }, [nodes, edges, algo, start, end, isError, stepsResult]);

  useEffect(() => {
    if (!playing || isError) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(80, 900 - speed * 8);
    timer.current = window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), delay);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [playing, stepIndex, steps.length, speed, isError]);

  const addNode = useCallback(() => {
    const id = nodes.length ? Math.max(...nodes.map((n) => n.id)) + 1 : 0;
    const label = String.fromCharCode(65 + (id % 26));
    setNodes((ns) => [
      ...ns,
      { id, label, x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 },
    ]);
  }, [nodes]);

  const removeNode = (id: number) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.from !== id && e.to !== id));
    if (start === id) setStart(nodes.find((n) => n.id !== id)?.id ?? 0);
    if (end === id) setEnd(nodes.find((n) => n.id !== id)?.id ?? 0);
  };

  const addEdge = () => {
    if (edgeFrom === '' || edgeTo === '') { setError('Select both endpoints.'); return; }
    if (edgeFrom === edgeTo) { setError('Cannot connect a node to itself.'); return; }
    if (edgeWeight < 0 && algo === 'dijkstra') { setError("Dijkstra rejects negative weights."); return; }
    setEdges((es) => [...es, { from: edgeFrom as number, to: edgeTo as number, weight: edgeWeight }]);
    setEdgeFrom(''); setEdgeTo('');
    setError(null);
  };

  const loadSample = () => {
    setNodes(SAMPLE_NODES);
    setEdges(SAMPLE_EDGES);
    setStart(0); setEnd(5);
    setError(null);
  };

  const nodeById = (id: number) => nodes.find((n) => n.id === id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Graph Lab</h1>
        <p className="mt-1 text-content-secondary">Build a graph, choose start and end, and run BFS, DFS, or Dijkstra step by step.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[280px_1fr_300px] gap-4">
        <div className="panel p-5 space-y-5 h-fit">
          <div>
            <div className="label mb-2">Algorithm</div>
            <div className="grid gap-1.5">
              {(['bfs', 'dfs', 'dijkstra'] as AlgoId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setAlgo(id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors uppercase tracking-wide ${
                    algo === id ? 'bg-sky/10 text-sky ring-1 ring-sky/30' : 'text-content-secondary hover:bg-ink-raised'
                  }`}
                >
                  {id === 'dijkstra' ? "Dijkstra's" : id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label mb-1.5">Start</div>
              <select value={start} onChange={(e) => setStart(Number(e.target.value))} className="input">
                {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            {algo === 'dijkstra' && (
              <div>
                <div className="label mb-1.5">End</div>
                <select value={end} onChange={(e) => setEnd(Number(e.target.value))} className="input">
                  {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="label">Speed</div>
              <span className="text-sm font-mono">{speed}%</span>
            </div>
            <input type="range" min={5} max={100} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-sky" />
          </div>

          <div className="border-t border-ink-border pt-4 space-y-3">
            <div className="label">Add node</div>
            <button onClick={addNode} className="btn-ghost w-full">
              <Plus className="h-3.5 w-3.5" /> Add node
            </button>
            <div className="label mt-2">Add edge</div>
            <div className="grid grid-cols-2 gap-2">
              <select value={edgeFrom} onChange={(e) => setEdgeFrom(e.target.value === '' ? '' : Number(e.target.value))} className="input">
                <option value="">From</option>
                {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <select value={edgeTo} onChange={(e) => setEdgeTo(e.target.value === '' ? '' : Number(e.target.value))} className="input">
                <option value="">To</option>
                {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min={-99} max={99} value={edgeWeight} onChange={(e) => setEdgeWeight(Number(e.target.value))} className="input" />
              <button onClick={addEdge} className="btn-ghost !px-3"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <button onClick={loadSample} className="btn-ghost w-full">
            <Shuffle className="h-3.5 w-3.5" /> Load sample graph
          </button>
          <button onClick={() => { setNodes([]); setEdges([]); }} className="btn-subtle w-full">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-content-primary">{algo.toUpperCase()} traversal</div>
            <div className="text-xs text-content-faint">{nodes.length} nodes · {edges.length} edges</div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose/40 bg-rose/10 p-6 text-center text-rose text-sm">
              {error}
            </div>
          ) : (
            <div ref={containerRef} className="relative aspect-[16/10] rounded-xl bg-ink-base/60 border border-ink-border overflow-hidden">
              <svg viewBox="0 0 1000 620" className="absolute inset-0 h-full w-full">
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M0,0 L0,6 L6,3 z" fill="#5A6068" />
                  </marker>
                  <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M0,0 L0,6 L6,3 z" fill="#6BC1F3" />
                  </marker>
                </defs>
                {edges.map((e, i) => {
                  const a = nodeById(e.from); const b = nodeById(e.to);
                  if (!a || !b) return null;
                  const x1 = a.x * 1000; const y1 = a.y * 620;
                  const x2 = b.x * 1000; const y2 = b.y * 620;
                  const inTrail = step.edgeTrail?.some(([f, t]) => (f === e.from && t === e.to));
                  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
                  return (
                    <g key={i}>
                      <line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={inTrail ? '#6BC1F3' : '#3A3D44'}
                        strokeWidth={inTrail ? 3 : 1.5}
                        markerEnd={inTrail ? 'url(#arrow-active)' : 'url(#arrow)'}
                        className="transition-all"
                      />
                      {algo === 'dijkstra' && (
                        <g>
                          <rect x={mx - 14} y={my - 12} width={28} height={20} rx={6} fill="#1A1C20" stroke="#303238" />
                          <text x={mx} y={my + 2} textAnchor="middle" fontSize="12" fill="#A1A1AA" fontFamily="monospace">{e.weight}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
                {nodes.map((n) => {
                  const x = n.x * 1000; const y = n.y * 620;
                  const isVisited = step.visited?.includes(n.id);
                  const isCurrent = step.current === n.id;
                  const isFrontier = step.frontier?.includes(n.id);
                  const isPath = step.path?.includes(n.id);
                  const fill = isCurrent ? '#F6C66A' : isPath ? '#B7F36B' : isVisited ? '#6BC1F3' : isFrontier ? '#2A2D33' : '#1A1C20';
                  const stroke = isPath ? '#B7F36B' : isCurrent ? '#F6C66A' : isVisited ? '#6BC1F3' : '#303238';
                  return (
                    <g key={n.id} className="cursor-pointer" onClick={() => removeNode(n.id)}>
                      <circle cx={x} cy={y} r={22} fill={fill} stroke={stroke} strokeWidth={isCurrent || isPath ? 3 : 2} className="transition-all" />
                      <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="600" fill="#F4F4F5">{n.label}</text>
                      {step.distances && step.distances[n.id] !== undefined && (
                        <text x={x + 28} y={y - 18} fontSize="11" fill="#71717A" fontFamily="monospace">
                          {step.distances[n.id] === Infinity ? '∞' : step.distances[n.id]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="absolute bottom-3 left-3 text-[10px] text-content-faint">Tip: click a node to remove it</div>
            </div>
          )}

          {!error && (
            <>
              <div className="mt-5 flex items-center justify-center gap-2">
                <button onClick={() => { setPlaying(false); setStepIndex(0); }} className="btn-ghost"><RotateCcw className="h-4 w-4" /></button>
                <button onClick={() => { setPlaying(false); setStepIndex((i) => Math.max(0, i - 1)); }} className="btn-ghost"><SkipBack className="h-4 w-4" /></button>
                <button onClick={() => { if (stepIndex >= steps.length - 1) setPlaying(false); else setPlaying((p) => !p); }} className="btn-primary">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button onClick={() => { setPlaying(false); setStepIndex((i) => Math.min(steps.length - 1, i + 1)); }} className="btn-ghost"><SkipForward className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-ink-base overflow-hidden">
                <div className="h-full bg-sky transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label mb-2">Step explanation</div>
            <p className="text-sm text-content-primary leading-relaxed font-mono">
              <span className="text-sky">›</span> {step?.description}
            </p>
          </div>

          <div className="panel p-5">
            <div className="label mb-3">Traversal state</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-content-faint w-20">Visited</span>
                <span className="font-mono text-sky flex-1">{step?.visited.map((id) => nodeById(id)?.label).join(', ') || '—'}</span>
              </div>
              {step?.frontier && (
                <div className="flex items-start gap-2">
                  <span className="text-content-faint w-20">Frontier</span>
                  <span className="font-mono text-amber flex-1">{step.frontier.map((id) => nodeById(id)?.label).join(', ') || '—'}</span>
                </div>
              )}
              {step?.path && step.path.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-content-faint w-20">Path</span>
                  <span className="font-mono text-lime flex-1 flex items-center gap-1 flex-wrap">
                    {step.path.map((id, i) => (
                      <span key={id} className="flex items-center gap-1">
                        {nodeById(id)?.label}
                        {i < step.path.length - 1 && <RouteIcon className="h-3 w-3 text-content-faint" />}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="panel p-5">
            <div className="label mb-3">About {algo === 'dijkstra' ? "Dijkstra's" : algo.toUpperCase()}</div>
            <p className="text-xs text-content-secondary leading-relaxed">
              {algo === 'bfs' && 'Breadth-First Search explores neighbors level by level using a queue. It finds the shortest path in unweighted graphs.'}
              {algo === 'dfs' && 'Depth-First Search dives as deep as possible along each branch before backtracking, using a stack (or recursion).'}
              {algo === 'dijkstra' && "Dijkstra's algorithm finds the shortest path by total weight. It requires non-negative edge weights to produce correct results."}
            </p>
          </div>

          <div className="panel p-5">
            <div className="label mb-3 flex items-center gap-2"><Network className="h-3.5 w-3.5" /> Legend</div>
            <div className="space-y-2 text-xs">
              <LegendRow c="bg-amber" l="Current node" />
              <LegendRow c="bg-sky" l="Visited" />
              <LegendRow c="bg-ink-raised ring-1 ring-ink-border" l="Frontier" />
              <LegendRow c="bg-lime" l="Final path" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendRow({ c, l }: { c: string; l: string }) {
  return (
    <div className="flex items-center gap-2 text-content-secondary">
      <span className={`h-3 w-3 rounded-full ${c}`} /> {l}
    </div>
  );
}
