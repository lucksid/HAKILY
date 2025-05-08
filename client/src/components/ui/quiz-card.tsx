import React from "react";

interface QuizCardProps {
  question: string;
}

export function QuizCard({ question }: QuizCardProps) {
  return (
    <div className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-xl text-center border-2 border-primary/20">
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
        ?
      </div>
      <div className="text-2xl font-bold tracking-wide text-slate-800 mb-4">
        {question}
      </div>
      <div className="text-base text-slate-600">
        Select the correct answer from the options below
      </div>
    </div>
  );
}
