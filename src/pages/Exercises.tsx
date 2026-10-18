import { useMemo, useState } from 'react';
import { Check, X, RotateCcw, Brain, Trophy, ArrowRight } from 'lucide-react';


interface Question {
  id: string;
  category: 'Sorting' | 'Graphs' | 'Scheduling';
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Sorting',
    prompt: 'What is the worst-case time complexity of Bubble Sort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    answer: 2,
    explanation: 'Bubble Sort compares every adjacent pair in nested loops, giving O(n²) in the worst case (reverse-sorted input).',
  },
  {
    id: 'q2',
    category: 'Sorting',
    prompt: 'After one pass of Bubble Sort on [5, 2, 4, 1, 3], which element reaches its final position?',
    options: ['1 (smallest)', '5 (largest)', '3 (middle)', '2 (second smallest)'],
    answer: 1,
    explanation: 'Each Bubble Sort pass bubbles the largest unsorted element to the end — here, 5 moves to the last position.',
  },
  {
    id: 'q3',
    category: 'Sorting',
    prompt: 'Which sorting algorithm has a guaranteed O(n log n) worst case but uses O(n) extra space?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Insertion Sort'],
    answer: 2,
    explanation: 'Merge Sort always runs in O(n log n) but needs O(n) auxiliary space to merge sorted halves.',
  },
  {
    id: 'q4',
    category: 'Sorting',
    prompt: 'Selection Sort performs how many swaps in total for an array of n elements (worst case)?',
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
    answer: 2,
    explanation: 'Selection Sort makes exactly one swap per pass, so at most n−1 swaps total — O(n), even though it does O(n²) comparisons.',
  },
  {
    id: 'q5',
    category: 'Graphs',
    prompt: 'Which data structure does Breadth-First Search use to track the frontier?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Hash Map'],
    answer: 1,
    explanation: 'BFS uses a FIFO queue so nodes are explored in the order they were discovered, giving level-by-level traversal.',
  },
  {
    id: 'q6',
    category: 'Graphs',
    prompt: "Why does Dijkstra's algorithm reject negative edge weights?",
    options: [
      'It crashes on negative numbers',
      'Settled nodes are never revisited, so a later negative path could be shorter',
      'Negative weights are impossible in graphs',
      'It uses a stack which cannot handle them',
    ],
    answer: 1,
    explanation: 'Dijkstra commits each settled node to its shortest distance. A negative edge arriving later could offer a shorter path that is never reconsidered, producing wrong results.',
  },
  {
    id: 'q7',
    category: 'Graphs',
    prompt: 'On an unweighted graph, which algorithm finds the shortest path in terms of edge count?',
    options: ['DFS', 'BFS', 'Dijkstra', 'Prim'],
    answer: 1,
    explanation: 'BFS explores level by level, so the first time it reaches a node is via the fewest edges — the shortest unweighted path.',
  },
  {
    id: 'q8',
    category: 'Scheduling',
    prompt: 'In FCFS scheduling, which formula gives waiting time for a process?',
    options: [
      'Burst − Arrival',
      'Completion − Arrival − Burst',
      'Arrival + Burst',
      'Completion − Burst',
    ],
    answer: 1,
    explanation: 'Waiting time = Turnaround − Burst = (Completion − Arrival) − Burst.',
  },
  {
    id: 'q9',
    category: 'Scheduling',
    prompt: 'Round Robin scheduling requires which additional parameter that FCFS does not?',
    options: ['Priority', 'Time quantum', 'Burst limit', 'Arrival window'],
    answer: 1,
    explanation: 'Round Robin gives each process a fixed time slice (the quantum) before preempting it and moving to the next in the ready queue.',
  },
  {
    id: 'q10',
    category: 'Scheduling',
    prompt: 'SRTF is the preemptive version of which scheduler?',
    options: ['Priority scheduling', 'Round Robin', 'Shortest Job First', 'FCFS'],
    answer: 2,
    explanation: 'Shortest Remaining Time First (SRTF) is preemptive SJF — it switches to a newly arrived process if its remaining burst is shorter.',
  },
];

export function Exercises() {
  const [filter, setFilter] = useState<'All' | Question['category']>('All');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const questions = useMemo(
    () => (filter === 'All' ? QUESTIONS : QUESTIONS.filter((q) => q.category === filter)),
    [filter],
  );

  const score = useMemo(() => {
    return Object.entries(answers).filter(([id, ans]) => {
      const q = QUESTIONS.find((x) => x.id === id);
      return q && q.answer === ans;
    }).length;
  }, [answers]);

  const attempted = Object.keys(revealed).length;

  const select = (q: Question, optionIdx: number) => {
    if (revealed[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: optionIdx }));
    setRevealed((r) => ({ ...r, [q.id]: true }));
  };

  const reset = () => {
    setAnswers({});
    setRevealed({});
  };

  const categories: ('All' | Question['category'])[] = ['All', 'Sorting', 'Graphs', 'Scheduling'];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="animate-fade-up">
        <span className="chip"><Brain className="h-3.5 w-3.5 text-rose" /> Test your understanding</span>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">Learning Exercises</h1>
        <p className="mt-1 text-content-secondary">Choose a topic, answer each question, and get instant feedback with an explanation.</p>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <div className="panel p-4">
          <div className="text-xs text-content-faint">Attempted</div>
          <div className="mt-1 text-2xl font-semibold font-mono">{attempted} <span className="text-content-faint text-base">/ {QUESTIONS.length}</span></div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-content-faint">Correct</div>
          <div className="mt-1 text-2xl font-semibold text-lime font-mono">{score}</div>
        </div>
        <div className="panel p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-content-faint">Score</div>
            <div className="mt-1 text-2xl font-semibold text-amber font-mono">{attempted ? Math.round((score / attempted) * 100) : 0}%</div>
          </div>
          <Trophy className="h-7 w-7 text-amber/60" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === c ? 'bg-lime/10 text-lime ring-1 ring-lime/30' : 'text-content-secondary hover:bg-ink-raised'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button onClick={reset} className="btn-ghost"><RotateCcw className="h-3.5 w-3.5" /> Reset answers</button>
      </div>

      <div className="mt-6 space-y-4">
        {questions.map((q, i) => {
          const selected = answers[q.id];
          const isRevealed = revealed[q.id];
          return (
            <div key={q.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="chip">{q.category}</span>
                    <span className="text-xs text-content-faint">Question {i + 1}</span>
                  </div>
                  <p className="font-medium text-content-primary">{q.prompt}</p>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = q.answer === idx;
                  const isSelected = selected === idx;
                  let cls = 'border-ink-border bg-ink-base text-content-secondary hover:border-lime/40 hover:bg-ink-raised';
                  if (isRevealed) {
                    if (isCorrect) cls = 'border-lime/50 bg-lime/10 text-content-primary';
                    else if (isSelected) cls = 'border-rose/40 bg-rose/10 text-content-primary';
                    else cls = 'border-ink-border bg-ink-base text-content-faint';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => select(q, idx)}
                      disabled={isRevealed}
                      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-all ${cls} ${!isRevealed ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span>{opt}</span>
                      {isRevealed && isCorrect && <Check className="h-4 w-4 text-lime" />}
                      {isRevealed && isSelected && !isCorrect && <X className="h-4 w-4 text-rose" />}
                    </button>
                  );
                })}
              </div>
              {isRevealed && (
                <div className="mt-4 rounded-lg border border-ink-border bg-ink-base/60 p-3 text-sm text-content-secondary animate-fade-up">
                  <span className="font-medium text-content-primary">Explanation: </span>{q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {attempted === QUESTIONS.length && (
        <div className="mt-8 panel p-6 text-center">
          <Trophy className="h-10 w-10 text-amber mx-auto" />
          <h2 className="mt-3 text-xl font-semibold">All questions answered!</h2>
          <p className="mt-1 text-content-secondary">You scored {score} / {QUESTIONS.length} ({Math.round((score / QUESTIONS.length) * 100)}%).</p>
          <button onClick={reset} className="btn-primary mt-5">
            Try again <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}


