export type Difficulty = "Easy" | "Medium" | "Hard"
export type Problem = {
  slug: string
  id: number
  title: string
  difficulty: Difficulty
  category: string
  tags: string[]
  statement: string
  starter: string // starter code for JS
  functionName: string
  tests: { input: any[]; expected: any }[]
  daily?: boolean
}

export const problems: Problem[] = [
  {
    slug: "implementing-a-singleton-logger",
    id: 1,
    title: "Implementing a Singleton Logger",
    difficulty: "Easy",
    category: "Design Patterns",
    tags: ["Design Patterns", "Singleton"],
    statement:
      "Create a Logger that returns the same instance on every call. It should expose a log(message) method that pushes to an internal array and returns the array length.",
    starter: `// Implement a singleton Logger
export function getLogger() {
  // TODO
}

// DO NOT EDIT BELOW
export function solution(messages) {
  const Logger = getLogger();
  let out = []
  for (const m of messages) {
    out.push(Logger.log(m))
  }
  return out
}`,
    functionName: "solution",
    tests: [
      { input: [["a", "b", "c"]], expected: [1, 2, 3] },
      { input: [["x", "y"]], expected: [4, 5] },
    ],
  },
  {
    slug: "merge-alternating-nodes",
    id: 2,
    title: "Merge Alternating Nodes",
    difficulty: "Medium",
    category: "Linked Lists",
    tags: ["Linked List", "Merge"],
    statement:
      "Given two arrays representing two singly linked lists, merge them by alternating nodes starting with the first list. Return the merged array.",
    starter: `// Build alternating merge of two arrays
export function solution(a, b) {
  // TODO
}`,
    functionName: "solution",
    tests: [
      {
        input: [
          [1, 3, 5],
          [2, 4, 6],
        ],
        expected: [1, 2, 3, 4, 5, 6],
      },
      { input: [[1], [2, 4, 6]], expected: [1, 2, 4, 6] },
    ],
    daily: true,
  },
  {
    slug: "diagonal-string-compression",
    id: 3,
    title: "Diagonal String Compression",
    difficulty: "Medium",
    category: "Arrays & Strings",
    tags: ["Arrays", "Strings"],
    statement:
      "Given a matrix of characters, return the string formed by visiting elements along diagonals from top-left to bottom-right.",
    starter: `export function solution(matrix) {
  // TODO
}`,
    functionName: "solution",
    tests: [
      {
        input: [
          [
            ["a", "b", "c"],
            ["d", "e", "f"],
          ],
        ],
        expected: "adbecf",
      },
    ],
  },
]
