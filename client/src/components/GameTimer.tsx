import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
}

export default function GameTimer({ timeLeft, totalTime }: GameTimerProps) {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const percentage = (timeLeft / totalTime) * 100;
    setProgress(percentage);
  }, [timeLeft, totalTime]);
  
  return (
    <div className="w-32 space-y-1">
      <div className="flex justify-between items-center">
        <span 
          className={cn(
            "text-sm font-medium",
            timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-muted-foreground"
          )}
        >
          Time: {timeLeft}s
        </span>
      </div>
      <Progress 
        value={progress} 
        className={cn(
          "h-2",
          timeLeft <= 5 ? "bg-red-100" : "bg-muted",
          timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-amber-500" : "text-green-500"
        )}
        indicatorClassName={
          timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-green-500"
        }
      />
    </div>
  );
}
