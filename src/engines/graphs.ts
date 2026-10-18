import type { GraphNode, GraphEdge, GraphStep } from '@/types';

export function bfs(nodes: GraphNode[], edges: GraphEdge[], start: number): GraphStep[] {
  const adj = buildAdjacency(nodes, edges, false);
  const visited: number[] = [];
  const frontier: number[] = [start];
  const seen = new Set<number>([start]);
  const steps: GraphStep[] = [];
  const edgeTrail: [number, number][] = [];

  steps.push({
    visited: [],
    current: start,
    frontier: [...frontier],
    path: [],
    edgeTrail: [],
    description: `Start BFS at node ${labelOf(nodes, start)}. Enqueue the start node.`,
  });

  while (frontier.length) {
    const u = frontier.shift()!;
    visited.push(u);
    steps.push({
      visited: [...visited],
      current: u,
      frontier: [...frontier],
      path: [],
      edgeTrail: [...edgeTrail],
      description: `Dequeue node ${labelOf(nodes, u)} and mark it visited.`,
    });
    for (const { to, weight } of adj[u] ?? []) {
      void weight;
      if (!seen.has(to)) {
        seen.add(to);
        frontier.push(to);
        edgeTrail.push([u, to]);
        steps.push({
          visited: [...visited],
          current: u,
          frontier: [...frontier],
          path: [],
          edgeTrail: [...edgeTrail],
          description: `Discover node ${labelOf(nodes, to)} from ${labelOf(nodes, u)} — enqueue it.`,
        });
      }
    }
  }
  steps.push({
    visited: [...visited],
    current: null,
    frontier: [],
    path: [...visited],
    edgeTrail: [...edgeTrail],
    description: `BFS complete. Visit order: ${visited.map((i) => labelOf(nodes, i)).join(' → ')}.`,
  });
  return steps;
}

export function dfs(nodes: GraphNode[], edges: GraphEdge[], start: number): GraphStep[] {
  const adj = buildAdjacency(nodes, edges, false);
  const visited: number[] = [];
  const seen = new Set<number>();
  const steps: GraphStep[] = [];
  const edgeTrail: [number, number][] = [];
  const stack: number[] = [];

  steps.push({
    visited: [],
    current: start,
    frontier: [start],
    path: [],
    edgeTrail: [],
    description: `Start DFS at node ${labelOf(nodes, start)}. Push it onto the stack.`,
  });

  function visit(u: number) {
    seen.add(u);
    visited.push(u);
    stack.push(u);
    steps.push({
      visited: [...visited],
      current: u,
      frontier: [...stack],
      path: [],
      edgeTrail: [...edgeTrail],
      description: `Visit node ${labelOf(nodes, u)} and mark it visited.`,
    });
    for (const { to } of adj[u] ?? []) {
      if (!seen.has(to)) {
        edgeTrail.push([u, to]);
        steps.push({
          visited: [...visited],
          current: u,
          frontier: [...stack],
          path: [],
          edgeTrail: [...edgeTrail],
          description: `Edge ${labelOf(nodes, u)} → ${labelOf(nodes, to)} leads to an unvisited node — recurse.`,
        });
        visit(to);
      }
    }
    stack.pop();
    steps.push({
      visited: [...visited],
      current: u,
      frontier: [...stack],
      path: [],
      edgeTrail: [...edgeTrail],
      description: `No more neighbors from ${labelOf(nodes, u)}. Backtrack.`,
    });
  }

  visit(start);
  steps.push({
    visited: [...visited],
    current: null,
    frontier: [],
    path: [...visited],
    edgeTrail: [...edgeTrail],
    description: `DFS complete. Visit order: ${visited.map((i) => labelOf(nodes, i)).join(' → ')}.`,
  });
  return steps;
}

export function dijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: number,
  end: number,
): GraphStep[] | { error: string } {
  for (const e of edges) {
    if (e.weight < 0) {
      return { error: 'Dijkstra\'s algorithm does not support negative edge weights. Use a non-negative weight, or choose BFS for unweighted shortest paths.' };
    }
  }
  const adj = buildAdjacency(nodes, edges, true);
  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[start] = 0;
  const visited: number[] = [];
  const frontier: number[] = [start];
  const steps: GraphStep[] = [];
  const edgeTrail: [number, number][] = [];

  steps.push({
    visited: [],
    current: start,
    frontier: [...frontier],
    path: [],
    edgeTrail: [],
    distances: { ...dist },
    description: `Initialize distances. Source ${labelOf(nodes, start)} = 0, all others = ∞.`,
  });

  const queue = new Set(nodes.map((n) => n.id));
  while (queue.size) {
    let u: number | null = null;
    let best = Infinity;
    for (const id of queue) {
      if (dist[id] < best) {
        best = dist[id];
        u = id;
      }
    }
    if (u === null || best === Infinity) break;
    queue.delete(u);
    visited.push(u);
    steps.push({
      visited: [...visited],
      current: u,
      frontier: [...queue],
      path: [],
      edgeTrail: [...edgeTrail],
      distances: { ...dist },
      description: `Select node ${labelOf(nodes, u)} with smallest distance (${dist[u]}). Mark it settled.`,
    });
    if (u === end) break;
    for (const { to, weight } of adj[u] ?? []) {
      if (!queue.has(to)) continue;
      const alt = dist[u] + weight;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = u;
        edgeTrail.push([u, to]);
        steps.push({
          visited: [...visited],
          current: u,
          frontier: [...queue],
          path: [],
          edgeTrail: [...edgeTrail],
          distances: { ...dist },
          description: `Relax edge ${labelOf(nodes, u)} → ${labelOf(nodes, to)}: new distance ${alt} (was ${dist[to] === alt ? '∞' : alt}).`,
        });
      }
    }
  }

  const path: number[] = [];
  let cur: number | null = end;
  if (dist[end] === Infinity) {
    steps.push({
      visited: [...visited],
      current: null,
      frontier: [],
      path: [],
      edgeTrail: [...edgeTrail],
      distances: { ...dist },
      description: `No path exists from ${labelOf(nodes, start)} to ${labelOf(nodes, end)}.`,
    });
    return steps;
  }
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur] ?? null;
  }
  steps.push({
    visited: [...visited],
    current: null,
    frontier: [],
    path,
    edgeTrail: [...edgeTrail],
    distances: { ...dist },
    description: `Shortest path: ${path.map((i) => labelOf(nodes, i)).join(' → ')} with total distance ${dist[end]}.`,
  });
  return steps;
}

function buildAdjacency(nodes: GraphNode[], edges: GraphEdge[], weighted: boolean) {
  const adj: Record<number, { to: number; weight: number }[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));
  for (const e of edges) {
    adj[e.from]?.push({ to: e.to, weight: e.weight });
    if (!weighted) adj[e.to]?.push({ to: e.from, weight: e.weight });
  }
  return adj;
}

function labelOf(nodes: GraphNode[], id: number): string {
  return nodes.find((n) => n.id === id)?.label ?? String(id);
}
