import fs from "fs";
import path from "path";

export function removeQuotes(value: string) {
  return value.replace(/^['"](.*)['"]$/, "$1");
}

export function getMDXFilesInDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export function getMDXFileLocale(
  fileName: string,
  supportedLocales?: string[]
): string {
  const locale = fileName.slice(-2);

  if (supportedLocales && !supportedLocales.includes(locale)) {
    throw new Error(
      `Unsupported locale: ${locale} found in file name ${fileName}`
    );
  }

  return locale;
}
