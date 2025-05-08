import React from "react";

interface MathSymbolProps {
  problem: string;
}

export function MathSymbol({ problem }: MathSymbolProps) {
  return (
    <div className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center border-2 border-primary/20">
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
        =?
      </div>
      <div className="text-5xl font-bold tracking-wide text-slate-800">
        {problem}
      </div>
      <div className="mt-4 text-lg text-slate-600">
        Solve the equation
      </div>
    </div>
  );
}
