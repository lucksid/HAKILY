// Utility functions for generating and solving math problems

// Types of operations
export type MathOperation = "addition" | "subtraction" | "multiplication" | "division";

// Interface for a math problem
export interface MathProblem {
  problem: string;  // String representation (e.g., "12 + 8")
  answer: number;   // Correct answer
}

// Generate a random number between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an addition problem
function generateAddition(): MathProblem {
  const num1 = getRandomNumber(1, 100);
  const num2 = getRandomNumber(1, 100);
  
  return {
    problem: `${num1} + ${num2}`,
    answer: num1 + num2
  };
}

// Generate a subtraction problem
function generateSubtraction(): MathProblem {
  // Ensure the answer is positive by making first number >= second number
  const num1 = getRandomNumber(1, 100);
  const num2 = getRandomNumber(1, num1);
  
  return {
    problem: `${num1} - ${num2}`,
    answer: num1 - num2
  };
}

// Generate a multiplication problem
function generateMultiplication(): MathProblem {
  // Keep numbers smaller for multiplication to maintain reasonable difficulty
  const num1 = getRandomNumber(1, 12);
  const num2 = getRandomNumber(1, 12);
  
  return {
    problem: `${num1} * ${num2}`,
    answer: num1 * num2
  };
}

// Generate a division problem
function generateDivision(): MathProblem {
  // Generate division problems with whole number answers to keep it simpler
  const answer = getRandomNumber(1, 12);
  const num2 = getRandomNumber(1, 12);
  const num1 = answer * num2;
  
  return {
    problem: `${num1} / ${num2}`,
    answer: answer
  };
}

// Generate a random math problem
export function generateMathProblem(): MathProblem {
  const operations: MathOperation[] = ["addition", "subtraction", "multiplication", "division"];
  const randomOperation = operations[Math.floor(Math.random() * operations.length)];
  
  switch (randomOperation) {
    case "addition":
      return generateAddition();
    case "subtraction":
      return generateSubtraction();
    case "multiplication":
      return generateMultiplication();
    case "division":
      return generateDivision();
    default:
      return generateAddition(); // Fallback to addition
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
