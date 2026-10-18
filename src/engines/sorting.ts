import type { SortingAlgorithm, SortingStep } from '@/types';

function snap(
  array: number[],
  opts: Partial<SortingStep> & { description: string; comparisons: number; swaps: number; arrayAccesses: number },
): SortingStep {
  return {
    array: [...array],
    sorted: opts.sorted ?? [],
    description: opts.description,
    comparisons: opts.comparisons,
    swaps: opts.swaps,
    arrayAccesses: opts.arrayAccesses,
    comparing: opts.comparing,
    swapping: opts.swapping,
    active: opts.active,
    pivot: opts.pivot,
  };
}

function bubbleSort(input: number[]): SortingStep[] {
  const a = [...input];
  const n = a.length;
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  const sorted: number[] = [];

  steps.push(
    snap(a, { description: `Starting Bubble Sort on ${n} elements.`, comparisons, swaps, arrayAccesses: accesses, sorted: [] }),
  );

  for (let i = 0; i < n - 1; i++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      accesses += 2;
      steps.push(
        snap(a, {
          description: `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          comparing: [j, j + 1],
          sorted,
        }),
      );
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        accesses += 2;
        swappedThisPass = true;
        steps.push(
          snap(a, {
            description: `${a[j + 1]} > ${a[j]} → swap them.`,
            comparisons,
            swaps,
            arrayAccesses: accesses,
            swapping: [j, j + 1],
            sorted,
          }),
        );
      }
    }
    sorted.unshift(n - 1 - i);
    steps.push(
      snap(a, {
        description: `Pass ${i + 1} complete. Element at index ${n - 1 - i} is in its final place.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        sorted,
      }),
    );
    if (!swappedThisPass) {
      for (let k = 0; k < n - 1 - i; k++) {
        if (!sorted.includes(k)) sorted.unshift(k);
      }
      steps.push(
        snap(a, {
          description: `No swaps this pass — array is already sorted.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          sorted: Array.from({ length: n }, (_, idx) => idx),
        }),
      );
      break;
    }
  }
  const finalSorted = Array.from({ length: n }, (_, i) => i);
  steps.push(
    snap(a, {
      description: `Bubble Sort complete. Final array: [${a.join(', ')}].`,
      comparisons,
      swaps,
      arrayAccesses: accesses,
      sorted: finalSorted,
    }),
  );
  return steps;
}

function selectionSort(input: number[]): SortingStep[] {
  const a = [...input];
  const n = a.length;
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  const sorted: number[] = [];

  steps.push(snap(a, { description: `Starting Selection Sort on ${n} elements.`, comparisons, swaps, arrayAccesses: accesses, sorted: [] }));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    accesses++;
    steps.push(
      snap(a, {
        description: `Assume index ${i} (value ${a[i]}) is the minimum of the unsorted region.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        active: i,
        sorted,
      }),
    );
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      accesses += 2;
      steps.push(
        snap(a, {
          description: `Compare a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          comparing: [minIdx, j],
          active: minIdx,
          sorted,
        }),
      );
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push(
          snap(a, {
            description: `New minimum found at index ${j} (value ${a[j]}).`,
            comparisons,
            swaps,
            arrayAccesses: accesses,
            active: minIdx,
            sorted,
          }),
        );
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      accesses += 2;
      steps.push(
        snap(a, {
          description: `Swap min (index ${minIdx}) into position ${i}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          swapping: [i, minIdx],
          sorted,
        }),
      );
    }
    sorted.push(i);
    steps.push(
      snap(a, {
        description: `Index ${i} now holds its final value.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        sorted,
      }),
    );
  }
  sorted.push(n - 1);
  steps.push(
    snap(a, {
      description: `Selection Sort complete. Final array: [${a.join(', ')}].`,
      comparisons,
      swaps,
      arrayAccesses: accesses,
      sorted: Array.from({ length: n }, (_, i) => i),
    }),
  );
  return steps;
}

function insertionSort(input: number[]): SortingStep[] {
  const a = [...input];
  const n = a.length;
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  const sorted = [0];

  steps.push(snap(a, { description: `Starting Insertion Sort on ${n} elements. First element is a sorted region of size 1.`, comparisons, swaps, arrayAccesses: accesses, sorted: [...sorted] }));

  for (let i = 1; i < n; i++) {
    const key = a[i];
    accesses++;
    let j = i - 1;
    steps.push(
      snap(a, {
        description: `Pick a[${i}]=${key} to insert into the sorted left region.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        active: i,
        sorted: [...sorted],
      }),
    );
    while (j >= 0) {
      comparisons++;
      accesses++;
      steps.push(
        snap(a, {
          description: `Compare key ${key} with a[${j}]=${a[j]}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          comparing: [j, j + 1],
          active: j + 1,
          sorted: [...sorted],
        }),
      );
      if (a[j] > key) {
        a[j + 1] = a[j];
        accesses++;
        swaps++;
        steps.push(
          snap(a, {
            description: `Shift a[${j}]=${a[j]} right to index ${j + 1}.`,
            comparisons,
            swaps,
            arrayAccesses: accesses,
            swapping: [j, j + 1],
            sorted: [...sorted],
          }),
        );
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = key;
    accesses++;
    sorted.push(i);
    sorted.sort((x, y) => x - y);
    steps.push(
      snap(a, {
        description: `Insert ${key} at index ${j + 1}.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        active: j + 1,
        sorted: [...sorted],
      }),
    );
  }
  steps.push(
    snap(a, {
      description: `Insertion Sort complete. Final array: [${a.join(', ')}].`,
      comparisons,
      swaps,
      arrayAccesses: accesses,
      sorted: Array.from({ length: n }, (_, i) => i),
    }),
  );
  return steps;
}

function mergeSort(input: number[]): SortingStep[] {
  const a = [...input];
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  const n = a.length;

  steps.push(snap(a, { description: `Starting Merge Sort on ${n} elements.`, comparisons, swaps, arrayAccesses: accesses, sorted: [] }));

  function merge(left: number, mid: number, right: number) {
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);
    accesses += leftArr.length + rightArr.length;
    let i = 0;
    let j = 0;
    let k = left;
    steps.push(
      snap(a, {
        description: `Merge subarrays [${leftArr.join(', ')}] and [${rightArr.join(', ')}] into indices ${left}..${right}.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        comparing: [left, right],
      }),
    );
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      accesses += 2;
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i];
        i++;
      } else {
        a[k] = rightArr[j];
        j++;
      }
      accesses++;
      swaps++;
      steps.push(
        snap(a, {
          description: `Place ${a[k]} at index ${k}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          swapping: [k, k],
          active: k,
        }),
      );
      k++;
    }
    while (i < leftArr.length) {
      a[k] = leftArr[i];
      accesses++;
      swaps++;
      steps.push(
        snap(a, {
          description: `Copy remaining ${a[k]} to index ${k}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          active: k,
        }),
      );
      i++;
      k++;
    }
    while (j < rightArr.length) {
      a[k] = rightArr[j];
      accesses++;
      swaps++;
      steps.push(
        snap(a, {
          description: `Copy remaining ${a[k]} to index ${k}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          active: k,
        }),
      );
      j++;
      k++;
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    steps.push(
      snap(a, {
        description: `Split indices ${left}..${right} at ${mid}.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        comparing: [left, right],
      }),
    );
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, n - 1);
  steps.push(
    snap(a, {
      description: `Merge Sort complete. Final array: [${a.join(', ')}].`,
      comparisons,
      swaps,
      arrayAccesses: accesses,
      sorted: Array.from({ length: n }, (_, i) => i),
    }),
  );
  return steps;
}

function quickSort(input: number[]): SortingStep[] {
  const a = [...input];
  const n = a.length;
  const steps: SortingStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  const sorted: number[] = [];

  steps.push(snap(a, { description: `Starting Quick Sort on ${n} elements (Lomuto partition, last element pivot).`, comparisons, swaps, arrayAccesses: accesses, sorted: [] }));

  function partition(low: number, high: number): number {
    const pivot = a[high];
    accesses++;
    steps.push(
      snap(a, {
        description: `Choose pivot a[${high}]=${pivot}. Partition indices ${low}..${high}.`,
        comparisons,
        swaps,
        arrayAccesses: accesses,
        pivot: high,
        sorted: [...sorted],
      }),
    );
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      accesses++;
      steps.push(
        snap(a, {
          description: `Compare a[${j}]=${a[j]} with pivot ${pivot}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          comparing: [j, high],
          pivot: high,
          sorted: [...sorted],
        }),
      );
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          accesses += 2;
          steps.push(
            snap(a, {
              description: `${a[i]} < ${pivot} → swap a[${i}] and a[${j}].`,
              comparisons,
              swaps,
              arrayAccesses: accesses,
              swapping: [i, j],
              pivot: high,
              sorted: [...sorted],
            }),
          );
        }
      }
    }
    if (i + 1 !== high) {
      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      swaps++;
      accesses += 2;
      steps.push(
        snap(a, {
          description: `Place pivot at index ${i + 1}.`,
          comparisons,
          swaps,
          arrayAccesses: accesses,
          swapping: [i + 1, high],
          pivot: i + 1,
          sorted: [...sorted],
        }),
      );
    }
    sorted.push(i + 1);
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const p = partition(low, high);
      sort(low, p - 1);
      sort(p + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  sort(0, n - 1);
  steps.push(
    snap(a, {
      description: `Quick Sort complete. Final array: [${a.join(', ')}].`,
      comparisons,
      swaps,
      arrayAccesses: accesses,
      sorted: Array.from({ length: n }, (_, i) => i),
    }),
  );
  return steps;
}

export const SORTING_ALGORITHMS: SortingAlgorithm[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    shortName: 'Bubble',
    description: 'Repeatedly compares adjacent elements and swaps them if they are out of order. The largest unsorted value bubbles to the end each pass.',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    generate: bubbleSort,
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    shortName: 'Selection',
    description: 'Selects the smallest element from the unsorted region and swaps it into the next position.',
    bestCase: 'O(n²)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    generate: selectionSort,
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    shortName: 'Insertion',
    description: 'Builds the sorted region one element at a time by inserting each new value into its correct position.',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    generate: insertionSort,
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    shortName: 'Merge',
    description: 'Divides the array recursively, then merges sorted halves. Guarantees O(n log n) in all cases.',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    generate: mergeSort,
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    shortName: 'Quick',
    description: 'Partitions around a pivot so smaller values move left and larger values move right, then recurses.',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(log n)',
    stable: false,
    inPlace: true,
    generate: quickSort,
  },
];
