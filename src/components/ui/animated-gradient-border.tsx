import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  containerClassName?: string;
  gradientClassName?: string;
  animationDuration?: number;
  borderWidth?: number;
  glowIntensity?: "none" | "low" | "medium" | "high";
}

export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
  gradientClassName,
  animationDuration = 3,
  borderWidth = 1,
  glowIntensity = "medium",
  ...props
}: AnimatedGradientBorderProps) {
  const glowStyles = {
    none: "",
    low: "blur-[5px]",
    medium: "blur-[10px]",
    high: "blur-[20px]",
  };

  return (
    <div className={cn("relative rounded-xl", containerClassName)} {...props}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl z-0",
          glowStyles[glowIntensity],
          gradientClassName ||
            "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
        )}
        style={{
          animation: `gradient-rotate ${animationDuration}s linear infinite`,
          backgroundSize: "200% 200%",
        }}
      ></div>
      <div
        className={cn("relative z-10 rounded-xl", className)}
        style={{ margin: `${borderWidth}px` }}
      >
        {children}
      </div>
      <style jsx global>{`
        @keyframes gradient-rotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
