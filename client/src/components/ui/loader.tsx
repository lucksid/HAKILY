import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export default function Loader({ 
  size = "md", 
  message,
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <div 
        className={cn(
          "rounded-full border-t-primary animate-spin",
          sizeClasses[size]
        )}
        style={{ borderTopWidth: size === "sm" ? "2px" : size === "md" ? "3px" : "4px" }} 
      />
      {message && (
        <p className="mt-4 text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}
