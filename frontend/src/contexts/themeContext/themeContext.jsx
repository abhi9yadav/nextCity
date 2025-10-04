import React, { createContext, useContext, useState, useEffect } from "react";

// Create Theme Context
const ThemeContext = createContext();

// Hook to use theme
export function useTheme() {
  return useContext(ThemeContext);
}

// Theme Provider
export function ThemeProvider({ children }) {
  // 'light' or 'dark'
  const [theme, setTheme] = useState("light");

  // Initialize theme from localStorage or default
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.add("light");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Update state
    setTheme(newTheme);

    // Update HTML root class for Tailwind dark mode
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);

    // Save preference
    localStorage.setItem("theme", newTheme);
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
