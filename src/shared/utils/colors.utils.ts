export const validColors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "primary",
  "secondary",
] as const;

export type Color = (typeof validColors)[number];
export const defaultColors: { name: Color; hex: string }[] = [
  { name: "red", hex: "#ef4444" },
  { name: "orange", hex: "#f97316" },
  { name: "amber", hex: "#eab308" },
  { name: "yellow", hex: "#eab308" },
  { name: "lime", hex: "#84cc16" },
  { name: "green", hex: "#10b981" },
  { name: "teal", hex: "#06b6d4" },
  { name: "sky", hex: "#0ea5e9" },
  { name: "blue", hex: "#3b82f6" },
  { name: "indigo", hex: "#6366f1" },
  { name: "violet", hex: "#8b5cf6" },
  { name: "purple", hex: "#a855f7" },
  { name: "fuchsia", hex: "#ec4899" },
  { name: "pink", hex: "#f472b6" },
  { name: "rose", hex: "#f43f5e" },
];

export function isValidColor(color: string): color is Color {
  return (validColors as readonly string[]).includes(color);
}

export function getDynamicColor(color?: string): Color {
  if (color && isValidColor(color)) return color;
  else {
    console.warn(`using invalid color ${color} fallback to primary`);
    return "primary";
  }
}
