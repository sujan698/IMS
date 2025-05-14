"use client";

import type React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ThemeTransitionWrapper: React.FC<ThemeTransitionWrapperProps> = ({
  children,
  className = "",
  style = {},
}) => {
  const { isTransitioning } = useTheme();

  return (
    <div
      className={`theme-transition-wrapper ${className}`}
      style={{ ...style }}
      data-transitioning={isTransitioning}
    >
      {children}
    </div>
  );
};

export default ThemeTransitionWrapper;
