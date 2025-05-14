"use client";

import { Button, Tooltip } from "antd";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation when theme changes
  useEffect(() => {
    if (isTransitioning) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match with transition duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleToggle = () => {
    // Only allow toggle if not currently transitioning
    if (!isAnimating) {
      toggleTheme();
    }
  };

  return (
    <>
      <Tooltip
        title={
          theme === "light" ? "Switch to dark mode" : "Switch to light mode"
        }
      >
        <Button
          type="text"
          icon={
            theme === "light" ? (
              <MoonIcon
                size={18}
                className={isAnimating ? "theme-icon-animate" : ""}
              />
            ) : (
              <SunIcon
                size={18}
                className={isAnimating ? "theme-icon-animate" : ""}
              />
            )
          }
          onClick={handleToggle}
          className={`theme-toggle-button ${
            isAnimating ? "theme-toggle-animating" : ""
          }`}
          aria-label="Toggle theme"
          disabled={isAnimating}
        />
      </Tooltip>
      <div
        className={`theme-transition-indicator ${isAnimating ? "active" : ""}`}
      ></div>
    </>
  );
};

export default ThemeToggle;
