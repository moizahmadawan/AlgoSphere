import type { Process, SchedulingResult } from '@/types';

export function fcfs(processes: Process[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  const gantt = [];
  const steps = [];
  const rows = [];
  for (const p of sorted) {
    if (time < p.arrival) {
      steps.push({ time, description: `CPU idle from ${time} to ${p.arrival} waiting for ${p.id}.`, running: null });
      time = p.arrival;
    }
    const start = time;
    const end = time + p.burst;
    gantt.push({ processId: p.id, start, end });
    steps.push({ time: start, description: `Run ${p.id} from ${start} to ${end} (burst ${p.burst}).`, running: p.id });
    time = end;
    const completion = end;
    rows.push({
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion,
      turnaround: completion - p.arrival,
      waiting: completion - p.arrival - p.burst,
    });
  }
  return finalize(rows, gantt, steps);
}

export function sjf(processes: Process[], preemptive = false): SchedulingResult {
  if (!preemptive) {
    const remaining = [...processes];
    let time = 0;
    const gantt = [];
    const steps = [];
    const rowsMap = new Map();
    while (remaining.length) {
      const available = remaining.filter((p) => p.arrival <= time);
      if (!available.length) {
        const next = remaining.reduce((a, b) => (a.arrival < b.arrival ? a : b));
        steps.push({ time, description: `CPU idle until ${next.arrival} waiting for ${next.id}.`, running: null });
        time = next.arrival;
        continue;
      }
      const next = available.reduce((a, b) => (a.burst < b.burst ? a : b));
      const start = time;
      const end = time + next.burst;
      gantt.push({ processId: next.id, start, end });
      steps.push({ time: start, description: `Run ${next.id} (shortest burst ${next.burst}) from ${start} to ${end}.`, running: next.id });
      time = end;
      rowsMap.set(next.id, {
        id: next.id,
        arrival: next.arrival,
        burst: next.burst,
        completion: end,
        turnaround: end - next.arrival,
        waiting: end - next.arrival - next.burst,
      });
      remaining.splice(remaining.indexOf(next), 1);
    }
    return finalize([...rowsMap.values()], gantt, steps);
  }
  // Preemptive SJF (SRTF)
  const remaining = processes.map((p) => ({ ...p, rem: p.burst }));
  let time = 0;
  const gantt: { processId: string; start: number; end: number }[] = [];
  const steps: { time: number; description: string; running: string | null }[] = [];
  const completion: Record<string, number> = {};
  let last: string | null = null;
  let segStart = 0;
  while (remaining.length) {
    const available = remaining.filter((p) => p.arrival <= time);
    if (!available.length) {
      const next = remaining.reduce((a, b) => (a.arrival < b.arrival ? a : b));
      steps.push({ time, description: `CPU idle until ${next.arrival}.`, running: null });
      time = next.arrival;
      continue;
    }
    const cur = available.reduce((a, b) => (a.rem < b.rem ? a : b));
    if (cur.id !== last) {
      if (last !== null) gantt.push({ processId: last, start: segStart, end: time });
      segStart = time;
      last = cur.id;
      steps.push({ time, description: `Switch to ${cur.id} (remaining ${cur.rem}).`, running: cur.id });
    }
    const nextArrival = remaining
      .filter((p) => p.arrival > time)
      .map((p) => p.arrival)
      .reduce((a, b) => Math.min(a, b), Infinity);
    const runFor = Math.min(cur.rem, nextArrival - time);
    cur.rem -= runFor;
    time += runFor;
    if (cur.rem === 0) {
      gantt.push({ processId: cur.id, start: segStart, end: time });
      completion[cur.id] = time;
      steps.push({ time, description: `${cur.id} completes at ${time}.`, running: cur.id });
      last = null;
      remaining.splice(remaining.indexOf(cur), 1);
    }
  }
  const rows = processes.map((p) => {
    const c = completion[p.id];
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: c,
      turnaround: c - p.arrival,
      waiting: c - p.arrival - p.burst,
    };
  });
  return finalize(rows, mergeGantt(gantt), steps);
}

export function roundRobin(processes: Process[], quantum: number): SchedulingResult {
  const queue = [...processes].sort((a, b) => a.arrival - b.arrival).map((p) => ({ ...p, rem: p.burst }));
  let time = 0;
  const gantt: { processId: string; start: number; end: number }[] = [];
  const steps: { time: number; description: string; running: string | null }[] = [];
  const completion: Record<string, number> = {};
  const ready: typeof queue = [];
  let i = 0;
  while (i < queue.length || ready.length) {
    while (i < queue.length && queue[i].arrival <= time) ready.push(queue[i++]);
    if (!ready.length) {
      time = queue[i].arrival;
      steps.push({ time, description: `CPU idle until ${time}.`, running: null });
      continue;
    }
    const cur = ready.shift()!;
    const runFor = Math.min(quantum, cur.rem);
    const start = time;
    const end = time + runFor;
    gantt.push({ processId: cur.id, start, end });
    steps.push({ time: start, description: `Run ${cur.id} for ${runFor} (quantum ${quantum}).`, running: cur.id });
    cur.rem -= runFor;
    time = end;
    while (i < queue.length && queue[i].arrival <= time) ready.push(queue[i++]);
    if (cur.rem > 0) {
      ready.push(cur);
      steps.push({ time, description: `${cur.id} still has ${cur.rem} remaining — requeue.`, running: cur.id });
    } else {
      completion[cur.id] = time;
      steps.push({ time, description: `${cur.id} completes at ${time}.`, running: cur.id });
    }
  }
  const rows = processes.map((p) => {
    const c = completion[p.id];
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: c,
      turnaround: c - p.arrival,
      waiting: c - p.arrival - p.burst,
    };
  });
  return finalize(rows, mergeGantt(gantt), steps);
}

export function priority(processes: Process[], preemptive = false): SchedulingResult {
  if (!preemptive) {
    const remaining = [...processes];
    let time = 0;
    const gantt = [];
    const steps = [];
    const rowsMap = new Map();
    while (remaining.length) {
      const available = remaining.filter((p) => p.arrival <= time);
      if (!available.length) {
        const next = remaining.reduce((a, b) => (a.arrival < b.arrival ? a : b));
        steps.push({ time, description: `CPU idle until ${next.arrival}.`, running: null });
        time = next.arrival;
        continue;
      }
      const next = available.reduce((a, b) => (a.priority < b.priority ? a : b));
      const start = time;
      const end = time + next.burst;
      gantt.push({ processId: next.id, start, end });
      steps.push({ time: start, description: `Run ${next.id} (priority ${next.priority}) from ${start} to ${end}.`, running: next.id });
      time = end;
      rowsMap.set(next.id, {
        id: next.id,
        arrival: next.arrival,
        burst: next.burst,
        completion: end,
        turnaround: end - next.arrival,
        waiting: end - next.arrival - next.burst,
      });
      remaining.splice(remaining.indexOf(next), 1);
    }
    return finalize([...rowsMap.values()], gantt, steps);
  }
  const remaining = processes.map((p) => ({ ...p, rem: p.burst }));
  let time = 0;
  const gantt: { processId: string; start: number; end: number }[] = [];
  const steps: { time: number; description: string; running: string | null }[] = [];
  const completion: Record<string, number> = {};
  let last: string | null = null;
  let segStart = 0;
  while (remaining.length) {
    const available = remaining.filter((p) => p.arrival <= time);
    if (!available.length) {
      const next = remaining.reduce((a, b) => (a.arrival < b.arrival ? a : b));
      steps.push({ time, description: `CPU idle until ${next.arrival}.`, running: null });
      time = next.arrival;
      continue;
    }
    const cur = available.reduce((a, b) => (a.priority < b.priority ? a : b));
    if (cur.id !== last) {
      if (last !== null) gantt.push({ processId: last, start: segStart, end: time });
      segStart = time;
      last = cur.id;
      steps.push({ time, description: `Switch to ${cur.id} (priority ${cur.priority}).`, running: cur.id });
    }
    const nextArrival = remaining
      .filter((p) => p.arrival > time)
      .map((p) => p.arrival)
      .reduce((a, b) => Math.min(a, b), Infinity);
    const runFor = Math.min(cur.rem, nextArrival - time);
    cur.rem -= runFor;
    time += runFor;
    if (cur.rem === 0) {
      gantt.push({ processId: cur.id, start: segStart, end: time });
      completion[cur.id] = time;
      steps.push({ time, description: `${cur.id} completes at ${time}.`, running: cur.id });
      last = null;
      remaining.splice(remaining.indexOf(cur), 1);
    }
  }
  const rows = processes.map((p) => {
    const c = completion[p.id];
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      completion: c,
      turnaround: c - p.arrival,
      waiting: c - p.arrival - p.burst,
    };
  });
  return finalize(rows, mergeGantt(gantt), steps);
}

function mergeGantt(segments: { processId: string; start: number; end: number }[]) {
  const merged: { processId: string; start: number; end: number }[] = [];
  for (const s of segments) {
    const last = merged[merged.length - 1];
    if (last && last.processId === s.processId && last.end === s.start) last.end = s.end;
    else merged.push({ ...s });
  }
  return merged;
}

function finalize(
  rows: { id: string; arrival: number; burst: number; completion: number; turnaround: number; waiting: number }[],
  gantt: { processId: string; start: number; end: number }[],
  steps: { time: number; description: string; running: string | null }[],
): SchedulingResult {
  const avgWaiting = rows.reduce((s, r) => s + r.waiting, 0) / (rows.length || 1);
  const avgTurnaround = rows.reduce((s, r) => s + r.turnaround, 0) / (rows.length || 1);
  return { gantt, rows, avgWaiting, avgTurnaround, steps };
}
