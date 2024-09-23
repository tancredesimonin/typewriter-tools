import { MDXArticleRepository } from "../server/mdx/articles.js";
import { MDXCategoryRepository } from "../server/mdx/categories.js";
import { MDXSerieRepository } from "../server/mdx/series.js";
import { MDXTagRepository } from "../server/mdx/tags.js";
import { TypewriterConfig } from "../shared/config/typewriter.config.js";

export class TypewriterManager<T extends string> {
  private directory: string;
  public articles: MDXArticleRepository;
  public categories: MDXCategoryRepository;
  public tags: MDXTagRepository;
  public series: MDXSerieRepository;

  constructor(config: TypewriterConfig<T>) {
    this.directory = config.directory ?? process.cwd();

    this.articles = new MDXArticleRepository(this.directory);
    this.categories = new MDXCategoryRepository(this.directory);
    this.tags = new MDXTagRepository(this.directory);
    this.series = new MDXSerieRepository(this.directory);
  }
}
