export type LocalizationsPaths<T extends string> = { [locale in T]: string };
export type TypewriterStage = "drafts" | "published";

export type TypewriterConfig<T extends string> = {
  baseUrl: string;
  supportedLocales: readonly T[];
  defaultLocale: T;
  stage?: TypewriterStage;
  home: {
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
