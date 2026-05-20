"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark";
export type PrimaryColor = "rose" | "violet" | "blue" | "teal" | "amber";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (c: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

function applyPrimary(color: PrimaryColor) {
  const root = document.documentElement;
  if (color === "rose") {
    root.removeAttribute("data-primary");
  } else {
    root.setAttribute("data-primary", color);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>("rose");

  useEffect(() => {
    const t = (localStorage.getItem("bloom-theme") as Theme) || "light";
    const c = (localStorage.getItem("bloom-primary") as PrimaryColor) || "rose";
    setThemeState(t);
    setPrimaryColorState(c);
    document.documentElement.classList.toggle("dark", t === "dark");
    applyPrimary(c);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("bloom-theme", t);
  };

  const setPrimaryColor = (c: PrimaryColor) => {
    setPrimaryColorState(c);
    applyPrimary(c);
    localStorage.setItem("bloom-primary", c);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
