const validColors = [
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
