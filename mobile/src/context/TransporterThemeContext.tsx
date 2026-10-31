import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "nativewind";

interface TransporterThemeContextType {
  isDark: boolean;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  colors: {
    bg: string;
    bgHeader: string;
    card: string;
    cardSecondary: string;
    cardBorder: string;
    text: string;
    textMuted: string;
    textFaint: string;
    icon: string;
    iconMuted: string;
    statusBar: "light-content" | "dark-content";
    statusBg: string;
    inputBg: string;
    inputBorder: string;
    divider: string;
    switchTrack: { false: string; true: string };
  };
}

const TransporterThemeContext = createContext<TransporterThemeContextType | undefined>(undefined);

export const TransporterThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDark, setIsDarkState] = useState<boolean>(colorScheme === "dark");

  useEffect(() => {
    setIsDarkState(colorScheme === "dark");
  }, [colorScheme]);

  const setDarkMode = (enabled: boolean) => {
    setIsDarkState(enabled);
    setColorScheme(enabled ? "dark" : "light");
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDark);
  };

  const colors = {
    bg: isDark ? "#0F172A" : "#F4F7F5",
    bgHeader: isDark ? "#0F172A" : "#F4F7F5",
    card: isDark ? "#1E293B" : "#FFFFFF",
    cardSecondary: isDark ? "#334155" : "#F8FAFC",
    cardBorder: isDark ? "#334155" : "#E5E7EB",
    text: isDark ? "#F8FAFC" : "#111827",
    textMuted: isDark ? "#94A3B8" : "#6B7280",
    textFaint: isDark ? "#64748B" : "#9CA3AF",
    icon: isDark ? "#E2E8F0" : "#4B5563",
    iconMuted: isDark ? "#94A3B8" : "#9CA3AF",
    statusBar: (isDark ? "light-content" : "dark-content") as "light-content" | "dark-content",
    statusBg: isDark ? "#0F172A" : "#F4F7F5",
    inputBg: isDark ? "#1E293B" : "#F9FAFB",
    inputBorder: isDark ? "#334155" : "#E5E7EB",
    divider: isDark ? "#334155" : "#F3F4F6",
    switchTrack: { false: isDark ? "#475569" : "#E5E7EB", true: "#E68A00" },
  };

  return (
    <TransporterThemeContext.Provider
      value={{
        isDark,
        setDarkMode,
        toggleDarkMode,
        colors,
      }}
    >
      {children}
    </TransporterThemeContext.Provider>
  );
};

export const useTransporterTheme = () => {
  const context = useContext(TransporterThemeContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      isDark: false,
      setDarkMode: () => {},
      toggleDarkMode: () => {},
      colors: {
        bg: "#F4F7F5",
        bgHeader: "#F4F7F5",
        card: "#FFFFFF",
        cardSecondary: "#F8FAFC",
        cardBorder: "#E5E7EB",
        text: "#111827",
        textMuted: "#6B7280",
        textFaint: "#9CA3AF",
        icon: "#4B5563",
        iconMuted: "#9CA3AF",
        statusBar: "dark-content" as "light-content" | "dark-content",
        statusBg: "#F4F7F5",
        inputBg: "#F9FAFB",
        inputBorder: "#E5E7EB",
        divider: "#F3F4F6",
        switchTrack: { false: "#E5E7EB", true: "#E68A00" },
      },
    };
  }
  return context;
};
