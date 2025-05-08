// Utility functions for generating and solving math problems

// Types of operations
export type MathOperation = "addition" | "subtraction" | "multiplication" | "division";

// Difficulty levels
export type DifficultyLevel = "easy" | "medium" | "hard";

// Interface for a math problem
export interface MathProblem {
  problem: string;  // String representation (e.g., "12 + 8")
  answer: number;   // Correct answer
}

// Generate a random number between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Range config for different difficulty levels
const difficultyRanges = {
  addition: {
    easy: { min: 1, max: 100 },
    medium: { min: 10, max: 1000 },
    hard: { min: 100, max: 9999 }
  },
  subtraction: {
    easy: { min: 1, max: 100 },
    medium: { min: 10, max: 1000 },
    hard: { min: 100, max: 9999 }
  },
  multiplication: {
    easy: { min: 1, max: 12 },
    medium: { min: 2, max: 50 },
    hard: { min: 5, max: 100 }
  },
  division: {
    // For division, these are the range of the answer and divisor
    easy: { answer: { min: 1, max: 12 }, divisor: { min: 1, max: 12 } },
    medium: { answer: { min: 2, max: 50 }, divisor: { min: 2, max: 15 } },
    hard: { answer: { min: 5, max: 100 }, divisor: { min: 2, max: 20 } }
  }
};

// Generate an addition problem based on difficulty
function generateAddition(difficulty: DifficultyLevel = "medium"): MathProblem {
  const range = difficultyRanges.addition[difficulty];
  const num1 = getRandomNumber(range.min, range.max);
  const num2 = getRandomNumber(range.min, range.max);
  
  return {
    problem: `${num1} + ${num2}`,
    answer: num1 + num2
  };
}

// Generate a subtraction problem based on difficulty
function generateSubtraction(difficulty: DifficultyLevel = "medium"): MathProblem {
  const range = difficultyRanges.subtraction[difficulty];
  
  // Ensure the answer is positive by making first number >= second number
  const num1 = getRandomNumber(range.min, range.max);
  const num2 = getRandomNumber(range.min, Math.min(num1, range.max));
  
  return {
    problem: `${num1} - ${num2}`,
    answer: num1 - num2
  };
}

// Generate a multiplication problem based on difficulty
function generateMultiplication(difficulty: DifficultyLevel = "medium"): MathProblem {
  const range = difficultyRanges.multiplication[difficulty];
  const num1 = getRandomNumber(range.min, range.max);
  const num2 = getRandomNumber(range.min, range.max);
  
  return {
    problem: `${num1} × ${num2}`,
    answer: num1 * num2
  };
}

// Generate a division problem based on difficulty
function generateDivision(difficulty: DifficultyLevel = "medium"): MathProblem {
  const range = difficultyRanges.division[difficulty];
  
  // Generate division problems with whole number answers
  const answer = getRandomNumber(range.answer.min, range.answer.max);
  const divisor = getRandomNumber(range.divisor.min, range.divisor.max);
  const dividend = answer * divisor; // This ensures clean division with whole number result
  
  return {
    problem: `${dividend} ÷ ${divisor}`,
    answer: answer
  };
}

// Generate a random math problem with equal distribution of operations
export function generateMathProblem(difficulty: DifficultyLevel = "medium"): MathProblem {
  // Use a more equal distribution of operations
  const operations: MathOperation[] = ["addition", "subtraction", "multiplication", "division"];
  const randomOperation = operations[Math.floor(Math.random() * operations.length)];
  
  console.log(`Generating ${randomOperation} problem with ${difficulty} difficulty`);
  
  switch (randomOperation) {
    case "addition":
      return generateAddition(difficulty);
    case "subtraction":
      return generateSubtraction(difficulty);
    case "multiplication":
      return generateMultiplication(difficulty);
    case "division":
      return generateDivision(difficulty);
    default:
      return generateAddition(difficulty); // Fallback to addition
  }
}

// Evaluate a math expression
export function evaluateMathExpression(expression: string): number {
  // This is a simplified version that assumes the expression is valid
  // In a production environment, use a proper math expression evaluator
  
  try {
    // Using Function constructor to evaluate the expression
    // Note: This is safe here because we control the input
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${expression})`)();
  } catch (error) {
    console.error("Error evaluating math expression:", error);
    return NaN;
  }
}
