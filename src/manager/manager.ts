import { MDXArticleListPageRepository } from "../server/mdx/articles-list.js";
import { MDXArticleRepository } from "../server/mdx/articles.js";
import { MDXCategoryListPageRepository } from "../server/mdx/categories-list.js";
import { MDXCategoryRepository } from "../server/mdx/categories.js";
import { MDXOptionRepository } from "../server/mdx/options.js";
import { MDXPageBaseRepository } from "../server/mdx/page-base.repository.js";
import { MDXSeriesListPageRepository } from "../server/mdx/series-list.js";
import { MDXSerieRepository } from "../server/mdx/series.js";
import { MDXTagListPageRepository } from "../server/mdx/tags-list.js";
import { MDXTagRepository } from "../server/mdx/tags.js";
import { TypewriterConfig } from "../shared/config/typewriter.config.js";
import { Page } from "../shared/index.js";

export class TypewriterManager<T extends string> {
  private readonly directory: string;
  private readonly supportedLocales: readonly T[];

  public articles: MDXArticleRepository;
  public articlesList: MDXArticleListPageRepository;
  public categories: MDXCategoryRepository;
  public categoriesList: MDXCategoryListPageRepository;
  public tags: MDXTagRepository;
  public tagsList: MDXTagListPageRepository;
  public series: MDXSerieRepository;
  public seriesList: MDXSeriesListPageRepository;

  public home: MDXPageBaseRepository<Page>;

  public options: MDXOptionRepository;

  constructor(config: TypewriterConfig<T>) {
    this.directory = config.directory ?? process.cwd();
    this.supportedLocales = config.supportedLocales;

    this.articles = new MDXArticleRepository(this.directory);
    this.articlesList = new MDXArticleListPageRepository(this.directory);
    this.categories = new MDXCategoryRepository(this.directory);
    this.categoriesList = new MDXCategoryListPageRepository(this.directory);
    this.tags = new MDXTagRepository(this.directory);
    this.tagsList = new MDXTagListPageRepository(this.directory);
    this.series = new MDXSerieRepository(this.directory);
    this.seriesList = new MDXSeriesListPageRepository(this.directory);
    this.options = new MDXOptionRepository();
    this.home = new MDXPageBaseRepository<Page>(this.directory, "home");
  }

  public setup() {
    this.articles.setup();
    this.articlesList.setup();
    this.categories.setup();
    this.categoriesList.setup();
    this.tags.setup();
    this.tagsList.setup();
    this.series.setup();
    this.seriesList.setup();
    this.home.setup();
  }

  public forceFileCreation() {
    for (const locale of this.supportedLocales) {
      this.articlesList.forceFileCreation(locale);
      this.categoriesList.forceFileCreation(locale);
      this.tagsList.forceFileCreation(locale);
      this.seriesList.forceFileCreation(locale);
      this.home.forceFileCreation(locale);
    }
  }
}
