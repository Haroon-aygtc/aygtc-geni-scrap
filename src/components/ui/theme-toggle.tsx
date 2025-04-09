import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  className?: string;
}

export function ThemeToggle({ theme, setTheme, className }: ThemeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full p-1 bg-gray-100 dark:bg-gray-800",
        className,
      )}
    >
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-full p-1.5 transition-colors",
          theme === "light"
            ? "bg-white text-black shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
        )}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-full p-1.5 transition-colors",
          theme === "system"
            ? "bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
        )}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-full p-1.5 transition-colors",
          theme === "dark"
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
