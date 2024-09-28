import { MDXArticleListPageRepository } from "../server/mdx/articles-list.js";
import { MDXArticleRepository } from "../server/mdx/articles.js";
import { MDXCategoryListPageRepository } from "../server/mdx/categories-list.js";
import { MDXCategoryRepository } from "../server/mdx/categories.js";
import { MDXOptionRepository } from "../server/mdx/options.js";
import { MDXSeriesListPageRepository } from "../server/mdx/series-list.js";
import { MDXSerieRepository } from "../server/mdx/series.js";
import { MDXTagListPageRepository } from "../server/mdx/tags-list.js";
import { MDXTagRepository } from "../server/mdx/tags.js";
import { TypewriterConfig } from "../shared/config/typewriter.config.js";

export class TypewriterManager<T extends string> {
  private directory: string;

  public articles: MDXArticleRepository;
  public articlesList: MDXArticleListPageRepository;
  public categories: MDXCategoryRepository;
  public categoriesList: MDXCategoryListPageRepository;
  public tags: MDXTagRepository;
  public tagsList: MDXTagListPageRepository;
  public series: MDXSerieRepository;
  public seriesList: MDXSeriesListPageRepository;
  public options: MDXOptionRepository;

  constructor(config: TypewriterConfig<T>) {
    this.directory = config.directory ?? process.cwd();

    this.articles = new MDXArticleRepository(this.directory);
    this.articlesList = new MDXArticleListPageRepository(this.directory);
    this.categories = new MDXCategoryRepository(this.directory);
    this.categoriesList = new MDXCategoryListPageRepository(this.directory);
    this.tags = new MDXTagRepository(this.directory);
    this.tagsList = new MDXTagListPageRepository(this.directory);
    this.series = new MDXSerieRepository(this.directory);
    this.seriesList = new MDXSeriesListPageRepository(this.directory);
    this.options = new MDXOptionRepository();
  }
}
