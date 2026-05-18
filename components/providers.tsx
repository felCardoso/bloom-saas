"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { CookieBanner } from "@/components/ui/CookieBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <CookieBanner />
    </ThemeProvider>
  );
}
