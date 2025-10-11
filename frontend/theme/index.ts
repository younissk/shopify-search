export type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    overlay: string;
    border: string;
    borderStrong: string;
    muted: string;
    mutedStrong: string;
    foreground: string;
    foregroundSoft: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    success: string;
    successForeground: string;
    danger: string;
    dangerForeground: string;
  };
  gradients: {
    page: string;
    spotlight: string;
    surface: string;
    accent: string;
    border: string;
  };
  shadows: {
    soft: string;
    medium: string;
    xl: string;
    glow: string;
  };
  radii: {
    none: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    full: string;
  };
  blurs: {
    none: string;
    soft: string;
    medium: string;
    heavy: string;
  };
  transitions: {
    primary: string;
    entrance: string;
  };
};

export const theme: ThemeTokens = {
  colors: {
    background: "#1C0F13",
    surface: "rgba(28, 15, 19, 0.95)",
    overlay: "rgba(91, 153, 90, 0.08)",
    border: "rgba(248, 241, 127, 0.2)",
    borderStrong: "rgba(91, 153, 90, 0.4)",
    muted: "rgba(248, 241, 127, 0.35)",
    mutedStrong: "rgba(248, 241, 127, 0.65)",
    foreground: "#F8F17F",
    foregroundSoft: "rgba(248, 241, 127, 0.8)",
    primary: "#5B995A",
    primaryForeground: "#1C0F13",
    secondary: "#F8F17F",
    secondaryForeground: "#1C0F13",
    accent: "#5B995A",
    accentForeground: "#1C0F13",
    success: "#5B995A",
    successForeground: "#1C0F13",
    danger: "#e11d48",
    dangerForeground: "#fef2f2",
  },
  gradients: {
    page: "linear-gradient(180deg, #1C0F13 0%, #2A1A1F 100%)",
    spotlight: "radial-gradient(circle at 25% 20%, rgba(91, 153, 90, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(248, 241, 127, 0.1), transparent 70%)",
    surface: "linear-gradient(150deg, rgba(28, 15, 19, 0.96) 0%, rgba(42, 26, 31, 0.92) 100%)",
    accent: "linear-gradient(120deg, rgba(91, 153, 90, 0.9) 0%, rgba(91, 153, 90, 0.7) 100%)",
    border: "linear-gradient(135deg, rgba(91, 153, 90, 0.2), rgba(248, 241, 127, 0.15))",
  },
  shadows: {
    soft: "0 12px 35px rgba(28, 15, 19, 0.3)",
    medium: "0 18px 40px rgba(28, 15, 19, 0.4)",
    xl: "0 35px 80px rgba(28, 15, 19, 0.5)",
    glow: "0 0 0 1px rgba(91, 153, 90, 0.3), 0 18px 50px rgba(91, 153, 90, 0.2)",
  },
  radii: {
    none: "0px",
    sm: "10px",
    base: "18px",
    lg: "22px",
    xl: "34px",
    full: "999px",
  },
  blurs: {
    none: "0px",
    soft: "12px",
    medium: "22px",
    heavy: "36px",
  },
  transitions: {
    primary: "all 220ms cubic-bezier(0.25, 0.8, 0.25, 1)",
    entrance: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
};

export type ThemeKey = keyof ThemeTokens;

export const themeClassNames = {
  glassPanel:
    "backdrop-blur-[var(--blur-medium)] border border-transparent bg-[var(--gradient-surface)] shadow-[var(--shadow-soft)]",
  pill:
    "rounded-full border border-transparent bg-[var(--gradient-accent)] text-[var(--primary-foreground)]",
  glowRing:
    "shadow-[var(--shadow-glow)]",
} as const;

export type ThemeClassNameKey = keyof typeof themeClassNames;
