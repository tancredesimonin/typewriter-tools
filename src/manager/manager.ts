import {
  mapFromMDXToArticle,
  renameMDXArticleSlug,
  upsertMDXArticle,
} from "../server/mdx/articles.js";
import { TypewriterStage } from "../shared/config/typewriter.config.js";
import { Article } from "../shared/types/articles.js";

export class TypewriterManager {
  constructor() {}

  get articles() {
    return {
      readFromFile: (file: string, stage: TypewriterStage = "published") =>
        mapFromMDXToArticle(file, stage),
      rename: (
        file: string,
        newSlug: string,
        stage: TypewriterStage = "published"
      ) => renameMDXArticleSlug(file, newSlug, stage),
      upsert: (article: Article, stage: TypewriterStage = "published") =>
        upsertMDXArticle(article, stage),
    };
  }
}
