import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ButtonGroupProps {
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

export function ButtonGroup({ 
  options, 
  selectedIndex, 
  onSelect, 
  disabled = false,
  className
}: ButtonGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option, index) => (
        <Button
          key={index}
          variant={selectedIndex === index ? "default" : "outline"}
          onClick={() => onSelect(index)}
          disabled={disabled}
          className={cn(
            "transition-all duration-200 font-medium",
            selectedIndex === index ? "ring-2 ring-primary" : ""
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
