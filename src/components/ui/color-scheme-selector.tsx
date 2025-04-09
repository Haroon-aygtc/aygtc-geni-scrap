import React from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ColorScheme = {
  name: string;
  value: string;
  primary: string;
  secondary: string;
  accent: string;
};

interface ColorSchemeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  schemes: ColorScheme[];
  className?: string;
}

export function ColorSchemeSelector({
  value,
  onChange,
  schemes,
  className,
}: ColorSchemeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full p-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            className,
          )}
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">
            Color Scheme
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="grid grid-cols-3 gap-2 p-2">
          {schemes.map((scheme) => (
            <button
              key={scheme.value}
              className={cn(
                "relative flex h-8 w-full cursor-pointer items-center justify-center rounded-md transition-all hover:scale-105",
                "bg-gradient-to-r",
                `from-${scheme.primary} via-${scheme.secondary} to-${scheme.accent}`,
              )}
              onClick={() => onChange(scheme.value)}
            >
              {value === scheme.value && (
                <Check className="h-4 w-4 text-white drop-shadow-md" />
              )}
              <span className="sr-only">{scheme.name}</span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
