"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Palette, defaultPalette } from "./palettes";

type PaletteContextType = {
  palette: Palette;
  setPalette: (p: Palette) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const PaletteContext = createContext<PaletteContextType>({
  palette: defaultPalette,
  setPalette: () => {},
  darkMode: false,
  toggleDarkMode: () => {},
});

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<Palette>(defaultPalette);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    // Palette accent colors
    Object.entries(palette.vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Mode-dependent surface colors
    if (darkMode) {
      root.style.setProperty("--surface", "rgba(255,255,255,0.06)");
      root.style.setProperty("--surface-text", "rgba(255,255,255,0.85)");
      root.style.setProperty("--surface-soft", "rgba(255,255,255,0.4)");
      root.style.setProperty("--surface-faint", "rgba(255,255,255,0.15)");
      root.style.setProperty("--surface-border", "rgba(255,255,255,0.06)");
      root.style.setProperty("--surface-bg", "#111015");
      root.style.setProperty("--surface-card", "rgba(255,255,255,0.04)");
      root.style.setProperty("--surface-card-shadow", "0 1px 0 rgba(255,255,255,0.03)");
      root.style.setProperty("--nav-bg", "#111015");
      root.style.setProperty("--nav-border", "rgba(255,255,255,0.04)");
    } else {
      root.style.setProperty("--surface", "rgba(0,0,0,0.04)");
      root.style.setProperty("--surface-text", palette.vars.ink);
      root.style.setProperty("--surface-soft", `${palette.vars.ink}73`);
      root.style.setProperty("--surface-faint", `${palette.vars.ink}2e`);
      root.style.setProperty("--surface-border", "rgba(0,0,0,0.04)");
      root.style.setProperty("--surface-bg", palette.vars.marble);
      root.style.setProperty("--surface-card", "rgba(255,255,255,0.75)");
      root.style.setProperty("--surface-card-shadow", "0 1px 0 rgba(0,0,0,0.03)");
      root.style.setProperty("--nav-bg", palette.vars.marble);
      root.style.setProperty("--nav-border", "rgba(0,0,0,0.04)");
    }
  }, [palette, darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <PaletteContext.Provider value={{ palette, setPalette, darkMode, toggleDarkMode }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  return useContext(PaletteContext);
}
