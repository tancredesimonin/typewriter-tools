import { TypewriterClientRouter } from "../client/client.js";
import {
  LocalizationsPaths,
  TypewriterConfig,
} from "../shared/config/typewriter.config.js";
import { MDXArticleRepository } from "./mdx/articles.js";
import { MDXCategoryRepository } from "./mdx/categories.js";
import { MDXTagRepository } from "./mdx/tags.js";
import { Article, PageArticlesList } from "../shared/types/articles.js";
import { Category, PageCategoriesList } from "../shared/types/categories.js";
import { PageTagsList, Tag } from "../shared/types/tags.js";
import { PageSeriesList, Serie } from "../shared/types/series.js";
import { MDXSerieRepository } from "./mdx/series.js";
import { getMDXWebsite } from "./mdx/website.js";
import { Website } from "../shared/types/website.js";
import { MDXArticleListPageRepository } from "./mdx/articles-list.js";
import { MDXCategoryListPageRepository } from "./mdx/categories-list.js";
import { MDXTagListPageRepository } from "./mdx/tags-list.js";
import { MDXSeriesListPageRepository } from "./mdx/series-list.js";
import { Page } from "../shared/index.js";
import { MDXPageBaseRepository } from "./mdx/page-base.repository.js";

export class TypewriterContent<T extends string> {
  private stage: "drafts" | "published";
  private directory: string;
  private repository: {
    articles: MDXArticleRepository;
    articlesList: MDXArticleListPageRepository;
    categories: MDXCategoryRepository;
    categoriesList: MDXCategoryListPageRepository;
    tags: MDXTagRepository;
    tagsList: MDXTagListPageRepository;
    series: MDXSerieRepository;
    seriesList: MDXSeriesListPageRepository;
    homePage: MDXPageBaseRepository<Page>;
  };
  private data: {
    websites: Website[];
    homePages: Page[];
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
    this.directory = config.directory ?? process.cwd();
    this.stage = config.stage ?? "published";
    this.router = router;

    this.repository = {
      articles: new MDXArticleRepository(this.directory),
      articlesList: new MDXArticleListPageRepository(this.directory),
      categories: new MDXCategoryRepository(this.directory),
      categoriesList: new MDXCategoryListPageRepository(this.directory),
      tags: new MDXTagRepository(this.directory),
      tagsList: new MDXTagListPageRepository(this.directory),
      series: new MDXSerieRepository(this.directory),
      seriesList: new MDXSeriesListPageRepository(this.directory),
      homePage: new MDXPageBaseRepository<Page>(this.directory, "home"),
    };

    this.data = {
      websites: getMDXWebsite(this.directory, this.stage),
      homePages: this.repository.homePage.all(this.stage),
      articles: this.repository.articles.all(this.stage),
      articlesBasePage: this.repository.articlesList.all(this.stage),
      categories: this.repository.categories.all(this.stage),
      categoriesBasePage: this.repository.categoriesList.all(this.stage),
      tags: this.repository.tags.all(this.stage),
      tagsBasePage: this.repository.tagsList.all(this.stage),
      series: this.repository.series.all(this.stage),
      seriesBasePage: this.repository.seriesList.all(this.stage),
    };
  }

  private findSinglePageLocalized(
    collection:
      | Page[]
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
      | Page[]
      | PageArticlesList[]
      | PageCategoriesList[]
      | PageSeriesList[]
      | PageTagsList[]
  ) {
    return collection.map((item) => item.locale) as T[];
  }

  get website() {
    return {
      all: { websites: this.data.websites },
      byLocale: (locale: T) => {
        const website = this.data.websites.find(
          (website) => website.locale === locale
        );
        if (!website) {
          throw new Error(`No website found for locale ${locale}`);
        }
        return { website };
      },
    };
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
