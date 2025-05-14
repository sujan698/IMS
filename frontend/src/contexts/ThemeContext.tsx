/* eslint-disable react-refresh/only-export-components */
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null;

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  };

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update body class and localStorage when theme changes
  useEffect(() => {
    // Start transition
    setIsTransitioning(true);

    // Apply theme
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // End transition after animation completes
    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Match this with the CSS transition duration

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  // Add transition class on mount (after a small delay to prevent initial transition)
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      document.documentElement.classList.add("theme-transition");
    }, 100);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        setThemeState(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // Configure Ant Design theme
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;

  const antdThemeConfig = {
    algorithm: theme === "dark" ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
      borderRadius: 6,
      // Removed motion settings as it is not compatible with the expected type
    },
    components: {
      Card: {
        colorBgContainer:
          theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
      },
      Table: {
        colorBgContainer:
          theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
      },
    },
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, isTransitioning }}
    >
      <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
