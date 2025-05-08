import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { GameType } from "@shared/schema";

interface GameCardProps {
  title: string;
  description: string;
  type: GameType;
  isSelected?: boolean;
  onClick?: () => void;
}

export function GameCard({ title, description, type, isSelected = false, onClick }: GameCardProps) {
  // Icons for each game type
  const icons: Record<GameType, React.ReactNode> = {
    word: (
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <span className="text-3xl">📝</span>
      </div>
    ),
    math: (
      <div className="bg-green-100 text-green-600 p-3 rounded-full">
        <span className="text-3xl">🔢</span>
      </div>
    ),
    quiz: (
      <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
        <span className="text-3xl">❓</span>
      </div>
    )
  };

  // Colors for each game type
  const colors: Record<GameType, { border: string; bg: string }> = {
    word: {
      border: isSelected ? "border-blue-500" : "border-blue-200 hover:border-blue-300",
      bg: isSelected ? "bg-blue-50" : "bg-white hover:bg-blue-50"
    },
    math: {
      border: isSelected ? "border-green-500" : "border-green-200 hover:border-green-300",
      bg: isSelected ? "bg-green-50" : "bg-white hover:bg-green-50"
    },
    quiz: {
      border: isSelected ? "border-amber-500" : "border-amber-200 hover:border-amber-300",
      bg: isSelected ? "bg-amber-50" : "bg-white hover:bg-amber-50"
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer border-2",
        colors[type].border,
        colors[type].bg,
        isSelected ? "ring-2 ring-primary shadow-md transform scale-105" : "shadow hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="mb-3 mt-2">
          {icons[type]}
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
