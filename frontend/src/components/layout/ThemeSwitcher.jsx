import React, { useState, useEffect } from "react";
import { Sun, Moon, Palette } from "lucide-react";

// DaisyUI themes with representative preview colors
const themes = [
  { name: "auto", color: "#a3a3a3" }, // Auto system preference
  { name: "light", color: "#f9fafb" },
  { name: "dark", color: "#1f2937" },
  { name: "cupcake", color: "#fef3c7" },
  { name: "dracula", color: "#282a36" },
];

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "auto");
  const [systemDark, setSystemDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setSystemDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme
  useEffect(() => {
    const appliedTheme =
      theme === "auto" ? (systemDark ? "dark" : "light") : theme;
    document.documentElement.setAttribute("data-theme", appliedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, systemDark]);

  return (
    <div className="dropdown dropdown-end">
      {/* Toggle button */}
      <div
        tabIndex={0}
        className="btn btn-ghost btn-circle relative"
        title={`Current theme: ${theme}`}
      >
        {theme === "dark" || (theme === "auto" && systemDark) ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : theme === "light" || (theme === "auto" && !systemDark) ? (
          <Moon className="h-5 w-5 text-gray-800" />
        ) : (
          <Palette className="h-5 w-5" />
        )}
      </div>

      {/* Dropdown menu */}
      <ul
        tabIndex={0}
        className="menu dropdown-content bg-base-200 rounded-box w-44 mt-3 p-2 shadow-lg"
      >
        {themes.map((t) => (
          <li key={t.name}>
            <button
              className="flex items-center gap-3 p-2 rounded hover:bg-base-300 transition"
              onClick={() => setTheme(t.name)}
            >
              {/* Color preview circle */}
              <span
                className="w-5 h-5 rounded-full border"
                style={{ backgroundColor: t.color }}
              />
              <span className="capitalize">{t.name}</span>
              {theme === t.name && (
                <span className="ml-auto text-green-500 font-bold">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSwitcher;
