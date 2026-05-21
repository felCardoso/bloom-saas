"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";
export type PrimaryColor = "rose" | "violet" | "blue" | "teal" | "amber";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (c: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

// Routes where the user's chosen primary color should apply.
// Everywhere else (landing, marketing, auth) stays on the default rose palette.
const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/clientes",
  "/pedidos",
  "/produtos",
  "/agenda",
  "/mensagens",
  "/relatorios",
  "/configuracoes",
  "/pricing",
  "/feedback",
];

function isDashboardPath(p: string): boolean {
  return DASHBOARD_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(prefix + "/"),
  );
}

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
  const pathname = usePathname();
  const onDashboard = useMemo(
    () => isDashboardPath(pathname ?? "/"),
    [pathname],
  );

  // Load saved theme/color from localStorage once.
  useEffect(() => {
    Promise.resolve().then(() => {
      const t = (localStorage.getItem("bloom-theme") as Theme) || "light";
      const c =
        (localStorage.getItem("bloom-primary") as PrimaryColor) || "rose";
      setThemeState(t);
      setPrimaryColorState(c);
      document.documentElement.classList.toggle("dark", t === "dark");
    });
  }, []);

  // Apply primary based on whether we're on a dashboard route.
  useEffect(() => {
    if (onDashboard) {
      applyPrimary(primaryColor);
    } else {
      document.documentElement.removeAttribute("data-primary");
    }
  }, [onDashboard, primaryColor]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("bloom-theme", t);
  };

  const setPrimaryColor = (c: PrimaryColor) => {
    setPrimaryColorState(c);
    localStorage.setItem("bloom-primary", c);
    // The effect above will (re)apply or skip based on the current route.
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, primaryColor, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

const ROSE_DEFAULTS: Record<number, string> = {
  50: "#FDF2F6",
  100: "#FAE6EE",
  200: "#F5CCE0",
  300: "#EDA8C8",
  400: "#E07AAA",
  500: "#D4829C",
  600: "#C4687F",
  700: "#A85C78",
  800: "#8C4D65",
  900: "#6B3A4D",
};

export function useThemeColor(shade: number): string {
  const { primaryColor } = useTheme();
  const [color, setColor] = useState(ROSE_DEFAULTS[shade] ?? "#D4829C");

  useEffect(() => {
    Promise.resolve().then(() => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(`--color-rose-${shade}`)
        .trim();
      if (v) setColor(v);
    });
  }, [primaryColor, shade]);

  return color;
}

const PALETTE_SHADES = [500, 300, 700, 200, 900];

export function useThemePalette(): string[] {
  const { primaryColor } = useTheme();
  const [palette, setPalette] = useState<string[]>(
    PALETTE_SHADES.map((s) => ROSE_DEFAULTS[s]),
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      const root = document.documentElement;
      setPalette(
        PALETTE_SHADES.map((s) => {
          const v = getComputedStyle(root)
            .getPropertyValue(`--color-rose-${s}`)
            .trim();
          return v || ROSE_DEFAULTS[s];
        }),
      );
    });
  }, [primaryColor]);

  return palette;
}
