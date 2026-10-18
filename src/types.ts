export type Route =
  | 'home'
  | 'dashboard'
  | 'sorting'
  | 'graphs'
  | 'scheduling'
  | 'exercises';

export interface SortingStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted: number[];
  active?: number;
  pivot?: number;
  description: string;
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}

export interface SortingAlgorithm {
  id: 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';
  name: string;
  shortName: string;
  description: string;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  spaceComplexity: string;
  stable: boolean;
  inPlace: boolean;
  generate: (input: number[]) => SortingStep[];
}

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface GraphStep {
  visited: number[];
  current: number | null;
  frontier: number[];
  path: number[];
  edgeTrail: [number, number][];
  distances?: Record<number, number>;
  description: string;
}

export interface Process {
  id: string;
  arrival: number;
  burst: number;
  priority: number;
}

export interface GanttSegment {
  processId: string;
  start: number;
  end: number;
}

export interface SchedulingResult {
  gantt: GanttSegment[];
  rows: {
    id: string;
    arrival: number;
    burst: number;
    completion: number;
    turnaround: number;
    waiting: number;
  }[];
  avgWaiting: number;
  avgTurnaround: number;
  steps: { time: number; description: string; running: string | null }[];
}
