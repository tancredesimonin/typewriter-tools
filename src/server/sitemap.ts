import { TypewriterClientRouter } from "../client/client.js";
import {
  LocalizationsPaths,
  TypewriterConfig,
} from "../shared/config/typewriter.config.js";
import { TypewriterContent } from "./content.js";

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

  public _buildHomePageSitemap(): Sitemap<T> {
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

  public _buildArticlesBasePageSitemap(): Sitemap<T> {
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

  public _buildCategoriesBasePageSitemap(): Sitemap<T> {
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

  public _buildSeriesBasePageSitemap(): Sitemap<T> {
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

  public _buildTagsBasePageSitemap(): Sitemap<T> {
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

  public _buildAllArticlesPagesSitemap(): Sitemap<T>[] {
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

  public _buildAllCategoriesPagesSitemap(): Sitemap<T>[] {
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

  public _buildAllSeriesPagesSitemap(): Sitemap<T>[] {
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

  public _buildAllTagsPagesSitemap(): Sitemap<T>[] {
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
      this._buildHomePageSitemap(),
      this._buildArticlesBasePageSitemap(),
      this._buildCategoriesBasePageSitemap(),
      this._buildSeriesBasePageSitemap(),
      this._buildTagsBasePageSitemap(),
      ...this._buildAllArticlesPagesSitemap(),
      ...this._buildAllCategoriesPagesSitemap(),
      ...this._buildAllSeriesPagesSitemap(),
      ...this._buildAllTagsPagesSitemap(),
    ];
  }
}
