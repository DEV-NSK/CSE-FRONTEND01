/**
 * CODEFLOW — Zustand Store
 * PRD-CODEFLOW-01 §5 — Execution Controls
 * PRD-CODEFLOW-01 §18 — Execution Timeline (Previous Step restores full state)
 */

import { create } from 'zustand';
import type {
  ExecutionStep,
  RuntimeState,
  PlaybackSpeed,
  ExecutionResult,
} from '../types/codeflow.types';
import { createInitialRuntimeState } from '../utils/codeflow.utils';

/** Supported CodeFlow languages */
export type CodeflowLanguage = 'javascript' | 'python' | 'c' | 'cpp' | 'csharp' | 'java';

export interface LanguageConfig {
  id: CodeflowLanguage;
  /** Display name, e.g. "JavaScript", "C#" */
  name: string;
  /** Human-readable title used in the Execution Visualizer header */
  runtimeLabel: string;
  /** Language identifier passed to Monaco editor */
  monacoLanguage: string;
  /** Starter code loaded when this language is selected */
  defaultCode: string;
  /** Language-specific example programs shown in the Examples dropdown */
  examples: Array<{ label: string; code: string }>;
}

export const CODEFLOW_LANGUAGES: LanguageConfig[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    runtimeLabel: 'JavaScript - Execution Visualizer',
    monacoLanguage: 'javascript',
    defaultCode: `// CODEFLOW — JavaScript Execution Visualizer
// Press Run to generate all steps, then use Step / Play to walk through them.

let x = 10;
let y = 20;

function add(a, b) {
  return a + b;
}

let result = add(x, y);
console.log(result);`,
    examples: [
      {
        label: 'Variables & Functions',
        code: `let x = 10;\nlet y = 20;\n\nfunction add(a, b) {\n  return a + b;\n}\n\nlet result = add(x, y);\nconsole.log(result);`,
      },
      {
        label: 'Hoisting',
        code: `console.log(x);\nvar x = 10;\nconsole.log(x);`,
      },
      {
        label: 'If / Else',
        code: `let score = 85;\n\nif (score >= 90) {\n  console.log("A grade");\n} else if (score >= 80) {\n  console.log("B grade");\n} else {\n  console.log("C grade");\n}`,
      },
      {
        label: 'for Loop',
        code: `for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}`,
      },
      {
        label: 'Recursion',
        code: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nlet result = factorial(5);\nconsole.log(result);`,
      },
      {
        label: 'setTimeout (Async)',
        code: `console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout callback");\n}, 1000);\n\nconsole.log("End");`,
      },
      {
        label: 'Promise Microtask',
        code: `console.log("A");\n\nPromise.resolve().then(() => {\n  console.log("B");\n});\n\nconsole.log("C");`,
      },
    ],
  },
  {
    id: 'python',
    name: 'Python',
    runtimeLabel: 'Python - Execution Visualizer',
    monacoLanguage: 'python',
    defaultCode: `# CODEFLOW — Python Execution Visualizer
# Press Run to generate all steps, then use Step / Play to walk through them.

x = 10
y = 20

def add(a, b):
    return a + b

result = add(x, y)
print(result)`,
    examples: [
      {
        label: 'Variables & Functions',
        code: `x = 10\ny = 20\n\ndef add(a, b):\n    return a + b\n\nresult = add(x, y)\nprint(result)`,
      },
      {
        label: 'If / Elif / Else',
        code: `score = 85\n\nif score >= 90:\n    print("A grade")\nelif score >= 80:\n    print("B grade")\nelse:\n    print("C grade")`,
      },
      {
        label: 'for Loop',
        code: `for i in range(1, 6):\n    print(i)`,
      },
      {
        label: 'while Loop',
        code: `i = 10\nwhile i < 15:\n    print(i)\n    i += 1`,
      },
      {
        label: 'Recursion',
        code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)\nprint(result)`,
      },
      {
        label: 'List Comprehension',
        code: `numbers = [1, 2, 3, 4, 5]\nsquares = [x * x for x in numbers]\nprint(squares)`,
      },
      {
        label: 'Dictionary',
        code: `person = {"name": "Alice", "age": 30}\nfor key, value in person.items():\n    print(key, ":", value)`,
      },
    ],
  },
  {
    id: 'c',
    name: 'C',
    runtimeLabel: 'C - Execution Visualizer',
    monacoLanguage: 'c',
    defaultCode: `// CODEFLOW — C Execution Visualizer
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int x = 10;
    int y = 20;
    int result = add(x, y);
    printf("%d\\n", result);
    return 0;
}`,
    examples: [
      {
        label: 'Variables & Functions',
        code: `#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int x = 10;\n    int y = 20;\n    int result = add(x, y);\n    printf("%d\\n", result);\n    return 0;\n}`,
      },
      {
        label: 'for Loop',
        code: `#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}`,
      },
      {
        label: 'while Loop',
        code: `#include <stdio.h>\n\nint main() {\n    int i = 10;\n    while (i < 15) {\n        printf("%d\\n", i);\n        i++;\n    }\n    return 0;\n}`,
      },
      {
        label: 'Recursion',
        code: `#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    printf("%d\\n", factorial(5));\n    return 0;\n}`,
      },
      {
        label: 'Pointers',
        code: `#include <stdio.h>\n\nint main() {\n    int x = 42;\n    int *p = &x;\n    printf("x = %d\\n", x);\n    printf("*p = %d\\n", *p);\n    *p = 100;\n    printf("x after = %d\\n", x);\n    return 0;\n}`,
      },
    ],
  },
  {
    id: 'cpp',
    name: 'C++',
    runtimeLabel: 'C++ - Execution Visualizer',
    monacoLanguage: 'cpp',
    defaultCode: `// CODEFLOW — C++ Execution Visualizer
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    int x = 10;
    int y = 20;
    int result = add(x, y);
    cout << result << endl;
    return 0;
}`,
    examples: [
      {
        label: 'Variables & Functions',
        code: `#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int x = 10;\n    int y = 20;\n    cout << add(x, y) << endl;\n    return 0;\n}`,
      },
      {
        label: 'for Loop',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}`,
      },
      {
        label: 'Recursion',
        code: `#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    cout << factorial(5) << endl;\n    return 0;\n}`,
      },
      {
        label: 'Class & Objects',
        code: `#include <iostream>\nusing namespace std;\n\nclass Rectangle {\npublic:\n    int width, height;\n    int area() { return width * height; }\n};\n\nint main() {\n    Rectangle r;\n    r.width = 5;\n    r.height = 3;\n    cout << "Area: " << r.area() << endl;\n    return 0;\n}`,
      },
      {
        label: 'Vectors',
        code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1, 2, 3, 4, 5};\n    for (int n : nums) {\n        cout << n << endl;\n    }\n    return 0;\n}`,
      },
    ],
  },
  {
    id: 'csharp',
    name: 'C#',
    runtimeLabel: 'C Sharp - Execution Visualizer',
    monacoLanguage: 'csharp',
    defaultCode: `// CODEFLOW — C# Execution Visualizer
using System;

class Program {
    static int Add(int a, int b) {
        return a + b;
    }

    static void Main() {
        int x = 10;
        int y = 20;
        int result = Add(x, y);
        Console.WriteLine(result);
    }
}`,
    examples: [
      {
        label: 'Variables & Methods',
        code: `using System;\n\nclass Program {\n    static int Add(int a, int b) { return a + b; }\n    static void Main() {\n        int x = 10, y = 20;\n        Console.WriteLine(Add(x, y));\n    }\n}`,
      },
      {
        label: 'for Loop',
        code: `using System;\n\nclass Program {\n    static void Main() {\n        for (int i = 1; i <= 5; i++) {\n            Console.WriteLine(i);\n        }\n    }\n}`,
      },
      {
        label: 'Recursion',
        code: `using System;\n\nclass Program {\n    static int Factorial(int n) {\n        if (n <= 1) return 1;\n        return n * Factorial(n - 1);\n    }\n    static void Main() {\n        Console.WriteLine(Factorial(5));\n    }\n}`,
      },
      {
        label: 'Class & Properties',
        code: `using System;\n\nclass Person {\n    public string Name { get; set; }\n    public int Age { get; set; }\n    public void Greet() => Console.WriteLine($"Hi, I'm {Name}, {Age} years old.");\n}\n\nclass Program {\n    static void Main() {\n        var p = new Person { Name = "Alice", Age = 30 };\n        p.Greet();\n    }\n}`,
      },
      {
        label: 'LINQ',
        code: `using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\nclass Program {\n    static void Main() {\n        var nums = new List<int> { 1, 2, 3, 4, 5 };\n        var evens = nums.Where(n => n % 2 == 0).ToList();\n        evens.ForEach(n => Console.WriteLine(n));\n    }\n}`,
      },
    ],
  },
  {
    id: 'java',
    name: 'Java',
    runtimeLabel: 'Java - Execution Visualizer',
    monacoLanguage: 'java',
    defaultCode: `// CODEFLOW — Java Execution Visualizer
public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int x = 10;
        int y = 20;
        int result = add(x, y);
        System.out.println(result);
    }
}`,
    examples: [
      {
        label: 'Variables & Methods',
        code: `public class Main {\n    static int add(int a, int b) { return a + b; }\n    public static void main(String[] args) {\n        int x = 10, y = 20;\n        System.out.println(add(x, y));\n    }\n}`,
      },
      {
        label: 'for Loop',
        code: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.println(i);\n        }\n    }\n}`,
      },
      {
        label: 'Recursion',
        code: `public class Main {\n    static int factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}`,
      },
      {
        label: 'Class & Objects',
        code: `public class Main {\n    static class Rectangle {\n        int width, height;\n        Rectangle(int w, int h) { width = w; height = h; }\n        int area() { return width * height; }\n    }\n    public static void main(String[] args) {\n        Rectangle r = new Rectangle(5, 3);\n        System.out.println("Area: " + r.area());\n    }\n}`,
      },
      {
        label: 'ArrayList',
        code: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));\n        for (int n : nums) {\n            System.out.println(n);\n        }\n    }\n}`,
      },
    ],
  },
];

/** Default starter code shown in the editor */
const DEFAULT_CODE = CODEFLOW_LANGUAGES[0].defaultCode;

type ExecutionStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

interface CodeflowState {
  // Editor
  code: string;
  language: CodeflowLanguage;

  // Execution data
  steps: ExecutionStep[];
  totalSteps: number;
  currentStepIndex: number;
  currentState: RuntimeState;
  parseError: string | null;

  // Playback
  executionStatus: ExecutionStatus;
  speed: PlaybackSpeed;
  playIntervalId: ReturnType<typeof setInterval> | null;

  // Actions
  setCode: (code: string) => void;
  setLanguage: (lang: CodeflowLanguage) => void;
  loadResult: (result: ExecutionResult) => void;
  setLoading: (v: boolean) => void;
  setParseError: (msg: string) => void;

  // Controls (PRD §5)
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  jumpToStep: (idx: number) => void;
}

export const useCodeflowStore = create<CodeflowState>((set, get) => ({
  code: DEFAULT_CODE,
  language: 'javascript',

  steps: [],
  totalSteps: 0,
  currentStepIndex: -1,
  currentState: createInitialRuntimeState(),
  parseError: null,

  executionStatus: 'idle',
  speed: 1,
  playIntervalId: null,

  setCode: (code) => set({ code }),

  setLanguage: (language) => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    const langConfig = CODEFLOW_LANGUAGES.find((l) => l.id === language);
    set({
      language,
      code: langConfig?.defaultCode ?? '',
      steps: [],
      totalSteps: 0,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
      parseError: null,
      executionStatus: 'idle',
      playIntervalId: null,
    });
  },

  loadResult: (result) => {
    set({
      steps: result.steps,
      totalSteps: result.totalSteps,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
      parseError: result.parseError ?? null,
      executionStatus: result.parseError ? 'error' : 'ready',
    });
  },

  setLoading: (v) => set({ executionStatus: v ? 'loading' : 'idle' }),

  setParseError: (msg) => set({ parseError: msg, executionStatus: 'error' }),

  stepForward: () => {
    const { steps, currentStepIndex, totalSteps } = get();
    if (currentStepIndex >= totalSteps - 1) return;
    const next = currentStepIndex + 1;
    set({
      currentStepIndex: next,
      currentState: steps[next]!.state,
    });
  },

  stepBackward: () => {
    const { steps, currentStepIndex } = get();
    if (currentStepIndex <= 0) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
      return;
    }
    const prev = currentStepIndex - 1;
    set({
      currentStepIndex: prev,
      currentState: steps[prev]!.state,
    });
  },

  play: () => {
    const { executionStatus } = get();
    if (executionStatus === 'playing') return;

    // Start from beginning if at end
    const { currentStepIndex, totalSteps } = get();
    if (currentStepIndex >= totalSteps - 1) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
    }

    set({ executionStatus: 'playing' });
    const id = setInterval(() => {
      const { currentStepIndex: idx, totalSteps: total, steps } = get();
      const next = idx + 1;
      if (next >= total) {
        clearInterval(id);
        set({
          playIntervalId: null,
          executionStatus: 'paused',
          currentStepIndex: total - 1,
          currentState: steps[total - 1]!.state,
        });
        return;
      }
      set({ currentStepIndex: next, currentState: steps[next]!.state });
    }, getIntervalMs(get().speed));

    set({ playIntervalId: id });
  },

  pause: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({ executionStatus: 'paused', playIntervalId: null });
  },

  stop: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({
      executionStatus: 'ready',
      playIntervalId: null,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
    });
  },

  reset: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({
      steps: [],
      totalSteps: 0,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
      parseError: null,
      executionStatus: 'idle',
      playIntervalId: null,
    });
  },

  setSpeed: (speed) => {
    const { playIntervalId, executionStatus } = get();
    set({ speed });
    // Restart interval at new speed if playing
    if (executionStatus === 'playing' && playIntervalId) {
      clearInterval(playIntervalId);
      const id = setInterval(() => {
        const { currentStepIndex: idx, totalSteps: total, steps } = get();
        const next = idx + 1;
        if (next >= total) {
          clearInterval(id);
          set({ playIntervalId: null, executionStatus: 'paused' });
          return;
        }
        set({ currentStepIndex: next, currentState: steps[next]!.state });
      }, getIntervalMs(speed));
      set({ playIntervalId: id });
    }
  },

  jumpToStep: (idx) => {
    const { steps, totalSteps } = get();
    const safe = Math.max(-1, Math.min(idx, totalSteps - 1));
    if (safe === -1) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
      return;
    }
    set({ currentStepIndex: safe, currentState: steps[safe]!.state });
  },
}));

function getIntervalMs(speed: PlaybackSpeed): number {
  // Base delay 900ms at 1x
  return Math.round(900 / speed);
}
