import { TypewriterConfig } from "../shared/config/typewriter.config.js";

export class TypewriterClientRouter<T extends string> {
  public baseUrl: string;
  private config: TypewriterConfig<T>;

  constructor(config: TypewriterConfig<T>) {
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  private getSegment(
    type: "home" | "license" | "series" | "categories" | "tags" | "articles"
  ): string {
    switch (type) {
      case "home":
        return "/";
      case "license":
        return this.config.license.segment;
      case "series":
        return this.config.series.segment;
      case "categories":
        return this.config.categories.segment;
      case "tags":
        return this.config.tags.segment;
      case "articles":
        return this.config.articles.segment;
    }
  }

  private getLabel(
    type: "home" | "license" | "series" | "categories" | "tags" | "articles",
    locale: T
  ): string {
    switch (type) {
      case "home":
        return this.config.home.label[locale];
      case "license":
        return this.config.license.label[locale];
      case "series":
        return this.config.series.label[locale];
      case "categories":
        return this.config.categories.label[locale];
      case "tags":
        return this.config.tags.label[locale];
      case "articles":
        return this.config.articles.label[locale];
    }
  }

  private createRouteObject(
    type: "home" | "license" | "series" | "categories" | "tags" | "articles"
  ) {
    const segment = this.getSegment(type);
    return {
      segment,
      canonical: segment,
      path: (locale: T) => `${locale}${segment}`,
      label: (locale: T) => this.getLabel(type, locale),
      bySlug: (slug: string) => ({
        canonical: `${segment}/${slug}`,
        path: (locale: T) => `${locale}${segment}/${slug}`,
      }),
    };
  }

  get home() {
    return this.createRouteObject("home");
  }
  get license() {
    return this.createRouteObject("license");
  }
  get series() {
    return this.createRouteObject("series");
  }
  get categories() {
    return this.createRouteObject("categories");
  }
  get tags() {
    return this.createRouteObject("tags");
  }
  get articles() {
    return this.createRouteObject("articles");
  }

  is = {
    home: (path: string) => this.isPathOf(path, "home"),
    categories: (path: string) => this.isPathOf(path, "categories"),
    series: (path: string) => this.isPathOf(path, "series"),
    tags: (path: string) => this.isPathOf(path, "tags"),
    articles: (path: string) => this.isPathOf(path, "articles"),
  };

  private isPathOf(
    path: string,
    type: "home" | "license" | "series" | "categories" | "tags" | "articles"
  ): boolean {
    const firstPath = this.getFirstPath(path);
    return firstPath === this.getSegment(type);
  }

  private getFirstPath(localizedPath: string): string {
    const array = localizedPath.split("/");
    return array.length === 1 ? "/" : "/" + array[1];
  }
}

export class TypewriterClient<T extends string> {
  public router: TypewriterClientRouter<T>;

  constructor(config: TypewriterConfig<T>) {
    this.router = new TypewriterClientRouter<T>(config);
  }
}
