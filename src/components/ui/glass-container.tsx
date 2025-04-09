import React from "react";
import { cn } from "@/lib/utils";

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
  borderLight?: boolean;
  children: React.ReactNode;
}

export function GlassContainer({
  className,
  intensity = "medium",
  borderLight = false,
  children,
  ...props
}: GlassContainerProps) {
  const bgOpacity = {
    low: "bg-white/5 dark:bg-black/5",
    medium: "bg-white/10 dark:bg-black/10",
    high: "bg-white/20 dark:bg-black/20",
  };

  const backdropIntensity = {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    high: "backdrop-blur-lg",
  };

  return (
    <div
      className={cn(
        bgOpacity[intensity],
        backdropIntensity[intensity],
        borderLight ? "border border-white/10" : "",
        "rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
