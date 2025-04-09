import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThreeDCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glareIntensity?: number;
  rotationIntensity?: number;
  borderRadius?: number;
  shadow?: boolean;
}

export function ThreeDCard({
  children,
  className,
  glareIntensity = 0.2,
  rotationIntensity = 10,
  borderRadius = 16,
  shadow = true,
  ...props
}: ThreeDCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation based on mouse position
    const rotateYValue = (mouseX / (rect.width / 2)) * rotationIntensity;
    const rotateXValue = (mouseY / (rect.height / 2)) * rotationIntensity * -1;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);

    // Calculate glare position
    const glareX = (mouseX / rect.width) * 100;
    const glareY = (mouseY / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        shadow && "shadow-xl",
        className,
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      animate={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glareIntensity}), transparent)`,
            borderRadius: `${borderRadius}px`,
          }}
        />
      )}
    </motion.div>
  );
}
