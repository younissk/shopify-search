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
    background: "#f5f7fb",
    surface: "rgba(255, 255, 255, 0.95)",
    overlay: "rgba(37, 99, 235, 0.08)",
    border: "rgba(15, 23, 42, 0.08)",
    borderStrong: "rgba(37, 99, 235, 0.3)",
    muted: "rgba(148, 163, 184, 0.35)",
    mutedStrong: "rgba(100, 116, 139, 0.65)",
    foreground: "#0f172a",
    foregroundSoft: "rgba(15, 23, 42, 0.62)",
    primary: "#2563eb",
    primaryForeground: "#f8fafc",
    secondary: "#0f172a",
    secondaryForeground: "#f8fafc",
    accent: "#0ea5e9",
    accentForeground: "#f0f9ff",
    success: "#047857",
    successForeground: "#ecfdf5",
    danger: "#b91c1c",
    dangerForeground: "#fef2f2",
  },
  gradients: {
    page: "linear-gradient(180deg, #f7f9fd 0%, #eef2f8 100%)",
    spotlight: "radial-gradient(circle at 25% 20%, rgba(37, 99, 235, 0.18), transparent 60%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.14), transparent 70%)",
    surface: "linear-gradient(150deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 247, 253, 0.92) 100%)",
    accent: "linear-gradient(120deg, rgba(37, 99, 235, 0.96) 0%, rgba(14, 165, 233, 0.88) 100%)",
    border: "linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(14, 165, 233, 0.12))",
  },
  shadows: {
    soft: "0 12px 35px rgba(15, 23, 42, 0.08)",
    medium: "0 18px 40px rgba(15, 23, 42, 0.12)",
    xl: "0 35px 80px rgba(15, 23, 42, 0.14)",
    glow: "0 0 0 1px rgba(37, 99, 235, 0.18), 0 18px 50px rgba(14, 165, 233, 0.16)",
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
