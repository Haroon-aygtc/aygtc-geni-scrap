import React from "react";
import { Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FontSize = {
  name: string;
  value: string;
  scale: number;
};

interface FontSizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  sizes: FontSize[];
  className?: string;
}

export function FontSizeSelector({
  value,
  onChange,
  sizes,
  className,
}: FontSizeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full p-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            className,
          )}
        >
          <Type className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">
            Font Size
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sizes.map((size) => (
          <DropdownMenuItem
            key={size.value}
            onClick={() => onChange(size.value)}
            className={cn(
              "cursor-pointer",
              value === size.value && "bg-primary/10 font-medium",
            )}
          >
            <span style={{ fontSize: `${size.scale}rem` }}>{size.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
