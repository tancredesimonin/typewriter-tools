import {
  publishMDXArticle,
  renameMDXArticleSlug,
  upsertMDXArticle,
} from "../server/mdx/articles.js";
import {
  TypewriterConfig,
  TypewriterStage,
} from "../shared/config/typewriter.config.js";
import { Article } from "../shared/types/articles.js";

export class TypewriterManager<T extends string> {
  private directory: string;
  constructor(config: TypewriterConfig<T>) {
    this.directory = config.directory ?? process.cwd();
  }

  get articles() {
    return {
      rename: (
        file: string,
        newSlug: string,
        stage: TypewriterStage = "published"
      ) => renameMDXArticleSlug(this.directory, file, newSlug, stage),
      upsert: (article: Article, stage: TypewriterStage = "published") =>
        upsertMDXArticle(this.directory, article, stage),
      publish: (article: Article) => publishMDXArticle(this.directory, article),
    };
  }
}
