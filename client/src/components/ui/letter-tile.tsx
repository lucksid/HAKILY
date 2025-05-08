import React from "react";
import { cn } from "@/lib/utils";

interface LetterTileProps {
  letter: string;
  value: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LetterTile({ letter, value, isSelected = false, onClick }: LetterTileProps) {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center w-16 h-16 text-4xl font-bold rounded-lg transition-all duration-200 shadow-md",
        isSelected
          ? "bg-primary text-primary-foreground rotate-0 scale-105"
          : "bg-white text-primary hover:bg-primary/10 hover:-rotate-3 hover:scale-105",
        "border-2",
        isSelected ? "border-primary" : "border-primary/20"
      )}
      onClick={onClick}
      disabled={isSelected && !onClick}
    >
      {letter}
      <span className="absolute bottom-1 right-1 text-xs font-semibold">
        {value}
      </span>
    </button>
  );
}
