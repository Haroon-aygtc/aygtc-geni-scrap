import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = "up",
  className,
  ...props
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate transform based on direction
  const getTransform = () => {
    switch (direction) {
      case "up":
        return useTransform(
          scrollYProgress,
          [0, 1],
          ["0%", `-${speed * 100}%`],
        );
      case "down":
        return useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
      case "left":
        return useTransform(
          scrollYProgress,
          [0, 1],
          ["0%", `-${speed * 100}%`],
        );
      case "right":
        return useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
      default:
        return useTransform(
          scrollYProgress,
          [0, 1],
          ["0%", `-${speed * 100}%`],
        );
    }
  };

  const y = direction === "up" || direction === "down" ? getTransform() : "0%";
  const x =
    direction === "left" || direction === "right" ? getTransform() : "0%";

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
      <motion.div style={{ y, x }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
