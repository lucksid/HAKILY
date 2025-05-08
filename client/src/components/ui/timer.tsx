import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from './progress';

interface TimerProps {
  duration: number; // Duration in seconds
  onComplete?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function Timer({ 
  duration, 
  onComplete, 
  isRunning = true,
  className 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(isRunning);
  
  useEffect(() => {
    setIsActive(isRunning);
  }, [isRunning]);
  
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 0.1;
          return newTime < 0 ? 0 : newTime;
        });
      }, 100);
    } else if (timeLeft <= 0 && onComplete) {
      onComplete();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, timeLeft, onComplete]);

  // Calculate progress percentage (reversed so it goes from 100% to 0%)
  const progressPercentage = (timeLeft / duration) * 100;
  
  // Determine color based on time left
  let colorClass = "bg-primary";
  if (timeLeft < duration * 0.25) {
    colorClass = "bg-destructive";
  } else if (timeLeft < duration * 0.5) {
    colorClass = "bg-orange-500";
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">
          Time left
        </span>
        <span className={cn(
          "text-sm font-bold",
          timeLeft < duration * 0.25 ? "text-destructive animate-pulse" : ""
        )}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      <Progress
        value={progressPercentage}
        className="h-2"
        indicatorClassName={colorClass}
      />
    </div>
  );
}
