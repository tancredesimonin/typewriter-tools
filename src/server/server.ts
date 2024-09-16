import { TypewriterClientRouter } from "../client/client";
import {
  LocalizationsPaths,
  TypewriterConfig,
} from "../shared/config/typewriter.config";
import { getMDXPageHome, HomePage } from "./mdx/home-page";
import { getMDXArticles, Article } from "./mdx/articles";
import { getMDXPageArticlesList, PageArticlesList } from "./mdx/articles-list";
import { getMDXCategories, Category } from "./mdx/categories";
import {
  getMDXPageCategoriesList,
  PageCategoriesList,
} from "./mdx/categories-list";
import { getMDXTags, Tag } from "./mdx/tags";
import { getMDXPageTagsList, PageTagsList } from "./mdx/tags-list";
import { getMDXPageSeriesList, PageSeriesList } from "./mdx/series-list";
import { getMDXSeries, Serie } from "./mdx/series";

export class TypewriterContent<T extends string> {
  private config: TypewriterConfig<T>;
  private data: {
    homePages: HomePage[];
    articles: Article[];
    articlesBasePage: PageArticlesList[];
    categories: Category[];
    categoriesBasePage: PageCategoriesList[];
    tags: Tag[];
    tagsBasePage: PageTagsList[];
    series: Serie[];
    seriesBasePage: PageSeriesList[];
  };
  private router: TypewriterClientRouter<T>;

  constructor(config: TypewriterConfig<T>, router: TypewriterClientRouter<T>) {
    this.config = config;
    this.router = router;
    this.data = {
      homePages: getMDXPageHome(),
      articles: getMDXArticles(),
      articlesBasePage: getMDXPageArticlesList(),
      categories: getMDXCategories(),
      categoriesBasePage: getMDXPageCategoriesList(),
      tags: getMDXTags(),
      tagsBasePage: getMDXPageTagsList(),
      series: getMDXSeries(),
      seriesBasePage: getMDXPageSeriesList(),
    };
  }

  private findSinglePageLocalized(
    collection:
      | HomePage[]
      | PageArticlesList[]
      | PageCategoriesList[]
      | PageSeriesList[]
      | PageTagsList[],
    locale: T
  ) {
    return collection.find((item) => item.locale === locale);
  }

  private listSinglePageSupportedLocales(
    collection:
      | HomePage[]
      | PageArticlesList[]
      | PageCategoriesList[]
      | PageSeriesList[]
      | PageTagsList[]
  ) {
    return collection.map((item) => item.locale) as T[];
  }

  get home() {
    return {
      page: (locale: T) => {
        const page = this.findSinglePageLocalized(this.data.homePages, locale);
        if (!page) {
          throw new Error(`No home page found for locale ${locale}`);
        }

        const path = this.router.home.path(locale);
        const supportedLocales = this.listSinglePageSupportedLocales(
          this.data.homePages
        );

        const alternateLocalizations = this.data.homePages.filter(
          (homePage) => homePage.locale !== locale
        );
        const alternateLocales = alternateLocalizations.map(
          (homePage) => homePage.locale
        ) as T[];

        const alternateLocalizationsPaths: LocalizationsPaths<T> =
          {} as LocalizationsPaths<T>;

        alternateLocalizations.forEach((homePage) => {
          alternateLocalizationsPaths[homePage.locale as T] =
            this.router.home.path(homePage.locale as T);
        });

        return {
          path,
          page,
          canonical: this.router.home.canonical,
          supportedLocales,
          alternate: {
            locales: alternateLocales,
            pages: alternateLocalizations,
            paths: alternateLocalizationsPaths,
          },
        };
      },
    };
  }

  /**
   * Single Page Content For Base Page
   * Dynamic Page Content For Articles
   */

  get articles() {
    return {
      base: {
        page: (locale: T) => {
          const page = this.findSinglePageLocalized(
            this.data.articlesBasePage,
            locale
          );
          if (!page) {
            throw new Error(`No articles base page found for locale ${locale}`);
          }

          const path = this.router.articles.path(locale);
          const supportedLocales = this.listSinglePageSupportedLocales(
            this.data.articlesBasePage
          );

          const alternateLocalizations = this.data.articlesBasePage.filter(
            (pageArticles) => pageArticles.locale !== locale
          );

          const alternateLocales = alternateLocalizations.map(
            (pageArticles) => pageArticles.locale
          ) as T[];

          const alternateLocalizationsPaths: LocalizationsPaths<T> =
            {} as LocalizationsPaths<T>;

          alternateLocalizations.forEach((pageArticles) => {
            alternateLocalizationsPaths[pageArticles.locale as T] =
              this.router.articles.path(pageArticles.locale as T);
          });

          return {
            path,
            page,
            canonical: this.router.articles.canonical,
            supportedLocales,
            alternate: {
              locales: alternateLocales,
              pages: alternateLocalizations,
              paths: alternateLocalizationsPaths,
            },
          };
        },
      },
      all: () => {
        const articles = this.data.articles;

        const uniqueSlugs = articles
          .map((article) => article.slug)
          .filter((slug, index, self) => self.indexOf(slug) === index);

        return { articles, uniqueSlugs };
      },
      allByLocale: (locale: T) => {
        return {
          articles: this.data.articles.filter(
            (article) => article.locale === locale
          ),
        };
      },
      byCategory: (categorySlug: string, locale: T) => {
        const articles = this.data.articles.filter(
          (article) =>
            article.meta.category === categorySlug && article.locale === locale
        );

        return { articles };
      },
      bySerie: (serieSlug: string, locale: T) => {
        const articles = this.data.articles.filter(
          (article) =>
            article.meta.serie &&
            article.meta.serie.slug === serieSlug &&
            article.locale === locale
        );

        return { articles };
      },
      byTag: (tagSlug: string, locale: T) => {
        const articles = this.data.articles.filter(
          (article) =>
            article.meta.tags &&
            article.meta.tags.includes(tagSlug) &&
            article.locale === locale
        );

        return { articles };
      },
      bySlug: (slug: string, locale: T) => {
        const articlesWithSlug = this.data.articles.filter(
          (article) => article.slug === slug
        );
        if (articlesWithSlug.length === 0) {
          throw new Error(`No article found for slug ${slug}`);
        }

        const supportedLocales = articlesWithSlug.map(
          (article) => article.locale
        ) as T[];

        const article = articlesWithSlug.find(
          (article) => article.locale === locale
        );
        if (!article) {
          throw new Error(
            `No article found for slug ${slug} and locale ${locale}`
          );
        }

        const alternateLocalizations = articlesWithSlug.filter(
          (article) => article.locale !== locale
        );

        const alternateLocales = alternateLocalizations.map(
          (article) => article.locale
        ) as T[];

        const alternateLocalizationsPaths: LocalizationsPaths<T> =
          {} as LocalizationsPaths<T>;

        alternateLocalizations.forEach((article) => {
          alternateLocalizationsPaths[article.locale as T] =
            this.router.articles.bySlug(article.slug).path(article.locale as T);
        });

        const path = this.router.articles.bySlug(article.slug).path(locale);
        const canonical = this.router.articles.bySlug(article.slug).canonical;
        return {
          path,
          canonical,
          article,
          supportedLocales,
          alternate: {
            locales: alternateLocales,
            articles: alternateLocalizations,
            paths: alternateLocalizationsPaths,
          },
        };
      },
    };
  }

  get categories() {
    return {
      base: {
        page: (locale: T) => {
          const page = this.data.categoriesBasePage.find(
            (pageCategories) => pageCategories.locale === locale
          );
          if (!page) {
            throw new Error(
              `No categories base page found for locale ${locale}`
            );
          }

          const path = this.router.categories.path(locale);
          const canonical = this.router.categories.canonical;
          const supportedLocales = this.data.categoriesBasePage.map(
            (page) => page.locale
          ) as T[];

          const alternateLocalizations = this.data.categoriesBasePage.filter(
            (pageCategories) => pageCategories.locale !== locale
          );

          const alternateLocales = alternateLocalizations.map(
            (pageCategories) => pageCategories.locale
          ) as T[];

          const alternateLocalizationsPaths: LocalizationsPaths<T> =
            {} as LocalizationsPaths<T>;

          alternateLocalizations.forEach((pageCategories) => {
            alternateLocalizationsPaths[pageCategories.locale as T] =
              this.router.categories.path(pageCategories.locale as T);
          });

          return {
            path,
            page,
            canonical,
            supportedLocales,
            alternate: {
              locales: alternateLocales,
              pages: alternateLocalizations,
              paths: alternateLocalizationsPaths,
            },
          };
        },
      },
      all: () => {
        const categories = this.data.categories;

        const uniqueSlugs = categories
          .map((category) => category.slug)
          .filter((slug, index, self) => self.indexOf(slug) === index);

        return { categories, uniqueSlugs };
      },
      allByLocale: (locale: T) => {
        const categories = this.data.categories.filter(
          (category) => category.locale === locale
        );

        return { categories };
      },
      bySlug: (slug: string, locale: T) => {
        const categoriesWithSlug = this.data.categories.filter(
          (category) => category.slug === slug
        );
        if (categoriesWithSlug.length === 0) {
          throw new Error(`No category found for slug ${slug}`);
        }

        const supportedLocales = categoriesWithSlug.map(
          (category) => category.locale
        ) as T[];

        const category = categoriesWithSlug.find(
          (category) => category.locale === locale
        );
        if (!category) {
          throw new Error(
            `No category found for slug ${slug} and locale ${locale}`
          );
        }

        const alternateLocalizations = categoriesWithSlug.filter(
          (category) => category.locale !== locale
        );

        const alternateLocales = alternateLocalizations.map(
          (category) => category.locale
        ) as T[];

        const alternateLocalizationsPaths: LocalizationsPaths<T> =
          {} as LocalizationsPaths<T>;

        alternateLocalizations.forEach((category) => {
          alternateLocalizationsPaths[category.locale as T] =
            this.router.categories
              .bySlug(category.slug)
              .path(category.locale as T);
        });

        const path = this.router.categories.bySlug(category.slug).path(locale);
        const canonical = this.router.categories.bySlug(
          category.slug
        ).canonical;

        return {
          path,
          category,
          canonical,
          supportedLocales,
          alternate: {
            locales: alternateLocales,
            categories: alternateLocalizations,
            paths: alternateLocalizationsPaths,
          },
        };
      },
    };
  }

  get tags() {
    return {
      base: {
        page: (locale: T) => {
          const page = this.data.tagsBasePage.find(
            (pageTags) => pageTags.locale === locale
          );
          if (!page) {
            throw new Error(`No tags base page found for locale ${locale}`);
          }
          const canonical = this.router.tags.canonical;
          const path = this.router.tags.path(locale);
          const supportedLocales = this.data.tagsBasePage.map(
            (page) => page.locale
          ) as T[];

          const alternateLocalizations = this.data.tagsBasePage.filter(
            (pageTags) => pageTags.locale !== locale
          );

          const alternateLocales = alternateLocalizations.map(
            (pageTags) => pageTags.locale
          ) as T[];

          const alternateLocalizationsPaths: LocalizationsPaths<T> =
            {} as LocalizationsPaths<T>;

          alternateLocalizations.forEach((pageTags) => {
            alternateLocalizationsPaths[pageTags.locale as T] =
              this.router.tags.path(pageTags.locale as T);
          });

          return {
            path,
            canonical,
            page,
            supportedLocales,
            alternate: {
              locales: alternateLocales,
              pages: alternateLocalizations,
              paths: alternateLocalizationsPaths,
            },
          };
        },
      },
      all: () => {
        const tags = this.data.tags;

        const uniqueSlugs = tags
          .map((tag) => tag.slug)
          .filter((slug, index, self) => self.indexOf(slug) === index);

        return { tags, uniqueSlugs };
      },
      allByLocale: (locale: T) => {
        const tags = this.data.tags.filter((tag) => tag.locale === locale);

        return { tags };
      },
      bySlug: (slug: string, locale: T) => {
        const tagsWithSlug = this.data.tags.filter((tag) => tag.slug === slug);
        if (tagsWithSlug.length === 0) {
          throw new Error(`No tag found for slug ${slug}`);
        }

        const supportedLocales = tagsWithSlug.map((tag) => tag.locale) as T[];

        const tag = tagsWithSlug.find((tag) => tag.locale === locale);
        if (!tag) {
          throw new Error(
            `No category found for slug ${slug} and locale ${locale}`
          );
        }

        const alternateLocalizations = tagsWithSlug.filter(
          (tag) => tag.locale !== locale
        );

        const alternateLocales = alternateLocalizations.map(
          (tag) => tag.locale
        ) as T[];

        const alternateLocalizationsPaths: LocalizationsPaths<T> =
          {} as LocalizationsPaths<T>;

        alternateLocalizations.forEach((tag) => {
          alternateLocalizationsPaths[tag.locale as T] = this.router.tags
            .bySlug(tag.slug)
            .path(tag.locale as T);
        });

        const path = this.router.tags.bySlug(tag.slug).path(locale);
        const canonical = this.router.tags.bySlug(tag.slug).canonical;

        return {
          path,
          canonical,
          tag,
          supportedLocales,
          alternate: {
            locales: alternateLocales,
            tags: alternateLocalizations,
            paths: alternateLocalizationsPaths,
          },
        };
      },
    };
  }

  get series() {
    return {
      base: {
        page: (locale: T) => {
          const page = this.data.seriesBasePage.find(
            (pageSeries) => pageSeries.locale === locale
          );
          if (!page) {
            throw new Error(`No series base page found for locale ${locale}`);
          }

          const path = this.router.series.path(locale);
          const canonical = this.router.series.canonical;
          const supportedLocales = this.data.seriesBasePage.map(
            (page) => page.locale
          ) as T[];

          const alternateLocalizations = this.data.seriesBasePage.filter(
            (pageSeries) => pageSeries.locale !== locale
          );

          const alternateLocales = alternateLocalizations.map(
            (pageSeries) => pageSeries.locale
          ) as T[];

          const alternateLocalizationsPaths: LocalizationsPaths<T> =
            {} as LocalizationsPaths<T>;

          alternateLocalizations.forEach((pageSeries) => {
            alternateLocalizationsPaths[pageSeries.locale as T] =
              this.router.series.path(pageSeries.locale as T);
          });

          return {
            path,
            canonical,
            page,
            supportedLocales,
            alternate: {
              locales: alternateLocales,
              pages: alternateLocalizations,
              paths: alternateLocalizationsPaths,
            },
          };
        },
      },
      all: () => {
        const series = this.data.series;

        const uniqueSlugs = series
          .map((serie) => serie.slug)
          .filter((slug, index, self) => self.indexOf(slug) === index);

        return { series, uniqueSlugs };
      },
      allByLocale: (locale: T) => {
        const series = this.data.series.filter(
          (series) => series.locale === locale
        );

        return { series };
      },
      bySlug: (slug: string, locale: T) => {
        const seriesWithSlug = this.data.series.filter(
          (series) => series.slug === slug
        );
        if (seriesWithSlug.length === 0) {
          throw new Error(`No series found for slug ${slug}`);
        }

        const supportedLocales = seriesWithSlug.map(
          (series) => series.locale
        ) as T[];

        const serie = seriesWithSlug.find((series) => series.locale === locale);
        if (!serie) {
          throw new Error(
            `No series found for slug ${slug} and locale ${locale}`
          );
        }

        const alternateLocalizations = seriesWithSlug.filter(
          (series) => series.locale !== locale
        );

        const alternateLocales = alternateLocalizations.map(
          (series) => series.locale
        ) as T[];

        const alternateLocalizationsPaths: LocalizationsPaths<T> =
          {} as LocalizationsPaths<T>;

        alternateLocalizations.forEach((series) => {
          alternateLocalizationsPaths[series.locale as T] = this.router.series
            .bySlug(series.slug)
            .path(series.locale as T);
        });

        const path = this.router.series.bySlug(serie.slug).path(locale);
        const canonical = this.router.series.bySlug(serie.slug).canonical;
        return {
          path,
          canonical,
          serie,
          supportedLocales,
          alternate: {
            locales: alternateLocales,
            series: alternateLocalizations,
            paths: alternateLocalizationsPaths,
          },
        };
      },
    };
  }
}

export class TypewriterServer<T extends string> {
  public router: TypewriterClientRouter<T>;
  public content: TypewriterContent<T>;
  public sitemapBuilder: TypewriterSitemapBuilder<T>;

  constructor(config: TypewriterConfig<T>) {
    this.router = new TypewriterClientRouter<T>(config);
    this.content = new TypewriterContent<T>(config, this.router);
    this.sitemapBuilder = new TypewriterSitemapBuilder<T>(
      config,
      this.router,
      this.content
    );
  }
}

type Sitemap<T extends string> = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: LocalizationsPaths<T>;
  };
};

export class TypewriterSitemapBuilder<T extends string> {
  private config: TypewriterConfig<T>;
  private router: TypewriterClientRouter<T>;
  private content: TypewriterContent<T>;

  constructor(
    config: TypewriterConfig<T>,
    router: TypewriterClientRouter<T>,
    content: TypewriterContent<T>
  ) {
    this.config = config;
    this.router = router;
    this.content = content;
  }

  private appendDefaultLocalePathToAlternates(
    defaultLocalizedPath: string,
    alternates: LocalizationsPaths<T>
  ) {
    const alternatesWithDefault = {
      ...alternates,
      [this.config.defaultLocale]: defaultLocalizedPath,
    };
    return alternatesWithDefault;
  }

  private buildHomePageSitemap(): Sitemap<T> {
    const defaultLocaleHomePage = this.content.home.page(
      this.config.defaultLocale
    ).path;

    const alternates = this.content.home.page(this.config.defaultLocale)
      .alternate.paths;

    return {
      url: this.router.home.canonical,
      priority: 1,
      changeFrequency: "daily",
      lastModified: new Date(),
      alternates: {
        languages: this.appendDefaultLocalePathToAlternates(
          defaultLocaleHomePage,
          alternates
        ),
      },
    };
  }

  private buildArticlesBasePageSitemap(): Sitemap<T> {
    const defaultLocaleArticlesBasePagePath = this.content.articles.base.page(
      this.config.defaultLocale
    ).path;
    const alternates = this.content.articles.base.page(
      this.config.defaultLocale
    ).alternate.paths;

    return {
      url: this.router.articles.canonical,
      priority: 0.9,
      changeFrequency: "daily",
      lastModified: new Date(),
      alternates: {
        languages: this.appendDefaultLocalePathToAlternates(
          defaultLocaleArticlesBasePagePath,
          alternates
        ),
      },
    };
  }

  private buildCategoriesBasePageSitemap(): Sitemap<T> {
    const defaultLocaleCategoriesBasePagePath =
      this.content.categories.base.page(this.config.defaultLocale).path;
    const alternates = this.content.categories.base.page(
      this.config.defaultLocale
    ).alternate.paths;

    return {
      url: this.router.categories.canonical,
      priority: 0.7,
      changeFrequency: "weekly",
      lastModified: new Date(),
      alternates: {
        languages: this.appendDefaultLocalePathToAlternates(
          defaultLocaleCategoriesBasePagePath,
          alternates
        ),
      },
    };
  }

  private buildSeriesBasePageSitemap(): Sitemap<T> {
    const defaultLocaleSeriesBasePagePath = this.content.series.base.page(
      this.config.defaultLocale
    ).path;
    const alternates = this.content.series.base.page(this.config.defaultLocale)
      .alternate.paths;

    return {
      url: this.router.series.canonical,
      priority: 0.5,
      changeFrequency: "weekly",
      lastModified: new Date(),
      alternates: {
        languages: this.appendDefaultLocalePathToAlternates(
          defaultLocaleSeriesBasePagePath,
          alternates
        ),
      },
    };
  }

  private buildTagsBasePageSitemap(): Sitemap<T> {
    const defaultLocaleTagsBasePagePath = this.content.tags.base.page(
      this.config.defaultLocale
    ).path;
    const alternates = this.content.tags.base.page(this.config.defaultLocale)
      .alternate.paths;

    return {
      url: this.router.tags.canonical,
      priority: 0.6,
      changeFrequency: "weekly",
      lastModified: new Date(),
      alternates: {
        languages: this.appendDefaultLocalePathToAlternates(
          defaultLocaleTagsBasePagePath,
          alternates
        ),
      },
    };
  }

  private buildAllArticlesPagesSitemap(): Sitemap<T>[] {
    const allUniqueArticlesSlugs = this.content.articles.all().uniqueSlugs;

    const articlesPagesSitemaps = allUniqueArticlesSlugs.map<Sitemap<T>>(
      (slug) => {
        const { article, canonical, alternate } = this.content.articles.bySlug(
          slug,
          this.config.defaultLocale
        );

        return {
          url: canonical,
          lastModified: article.updatedAt,
          changeFrequency: "daily",
          priority: 0.8,
          alternates: {
            languages: this.appendDefaultLocalePathToAlternates(
              canonical,
              alternate.paths
            ),
          },
        };
      }
    );

    return articlesPagesSitemaps;
  }

  private buildAllCategoriesPagesSitemap(): Sitemap<T>[] {
    const allUniqueCategoriesSlugs = this.content.categories.all().uniqueSlugs;

    const categoriesPagesSitemaps = allUniqueCategoriesSlugs.map<Sitemap<T>>(
      (slug) => {
        const { canonical, alternate } = this.content.categories.bySlug(
          slug,
          this.config.defaultLocale
        );

        return {
          url: canonical,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages: this.appendDefaultLocalePathToAlternates(
              canonical,
              alternate.paths
            ),
          },
        };
      }
    );

    return categoriesPagesSitemaps;
  }

  private buildAllSeriesPagesSitemap(): Sitemap<T>[] {
    const allUniqueSeriesSlugs = this.content.series.all().uniqueSlugs;

    const seriesPagesSitemaps = allUniqueSeriesSlugs.map<Sitemap<T>>((slug) => {
      const { canonical, alternate } = this.content.series.bySlug(
        slug,
        this.config.defaultLocale
      );

      return {
        url: canonical,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: {
          languages: this.appendDefaultLocalePathToAlternates(
            canonical,
            alternate.paths
          ),
        },
      };
    });

    return seriesPagesSitemaps;
  }

  private buildAllTagsPagesSitemap(): Sitemap<T>[] {
    const allUniqueTagsSlugs = this.content.tags.all().uniqueSlugs;

    const tagsPagesSitemaps = allUniqueTagsSlugs.map<Sitemap<T>>((slug) => {
      const { canonical, alternate } = this.content.tags.bySlug(
        slug,
        this.config.defaultLocale
      );

      return {
        url: canonical,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: this.appendDefaultLocalePathToAlternates(
            canonical,
            alternate.paths
          ),
        },
      };
    });

    return tagsPagesSitemaps;
  }

  public buildAllPagesSitemap(): Sitemap<T>[] {
    return [
      this.buildHomePageSitemap(),
      this.buildArticlesBasePageSitemap(),
      this.buildCategoriesBasePageSitemap(),
      this.buildSeriesBasePageSitemap(),
      this.buildTagsBasePageSitemap(),
      ...this.buildAllArticlesPagesSitemap(),
      ...this.buildAllCategoriesPagesSitemap(),
      ...this.buildAllSeriesPagesSitemap(),
      ...this.buildAllTagsPagesSitemap(),
    ];
  }
}
