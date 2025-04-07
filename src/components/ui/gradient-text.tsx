import React from "react";
import { cn } from "@/lib/utils";

type GradientDirection =
  | "to-r"
  | "to-l"
  | "to-t"
  | "to-b"
  | "to-tr"
  | "to-tl"
  | "to-br"
  | "to-bl";

interface GradientTextProps {
  text: string;
  from?: string;
  via?: string;
  to: string;
  direction?: GradientDirection;
  className?: string;
}

export function GradientText({
  text,
  from = "from-blue-600",
  via,
  to = "to-purple-600",
  direction = "to-r",
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-gradient-" + direction,
        from,
        via,
        to,
        className,
      )}
    >
      {text}
    </span>
  );
}
