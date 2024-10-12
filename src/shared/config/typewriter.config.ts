export type LocalizationsPaths<T extends string> = { [locale in T]: string };
export type TypewriterStage = "drafts" | "published";

export type TypewriterConfig<T extends string> = {
  directory?: string;
  stage?: TypewriterStage;
  supportedLocales: readonly T[];
  defaultLocale: T;
  baseUrl: string;
  home: {
    label: Record<T, string>;
  };
  license: {
    segment: string;
    label: Record<T, string>;
  };
  series: {
    segment: string;
    label: Record<T, string>;
  };
  categories: {
    segment: string;
    label: Record<T, string>;
  };
  tags: {
    segment: string;
    label: Record<T, string>;
  };
  articles: {
    segment: string;
    label: Record<T, string>;
  };
};
