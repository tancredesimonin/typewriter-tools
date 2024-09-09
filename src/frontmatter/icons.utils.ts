import dynamicIconImports from "lucide-react/dynamicIconImports";

function isValidIconKey(icon: string): icon is keyof typeof dynamicIconImports {
  return icon in dynamicIconImports;
}

/**
 * will return a default icon if nothing is found
 * quietly console warn if not found
 */
export function getDynamicIcon(icon?: string): keyof typeof dynamicIconImports {
  if (icon && isValidIconKey(icon)) return icon;
  else {
    console.warn(`invalid lucid icon key: ${icon}`);
    return "circle-dot";
  }
}
