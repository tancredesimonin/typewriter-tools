import { PageArticlesList } from "../../shared/types/articles.js";
import { MDXListPageBaseRepository } from "./list-page-base.repository.js";

const ARTICLES_COLLECTION_NAME = "articles";

export class MDXArticleListPageRepository extends MDXListPageBaseRepository<PageArticlesList> {
  constructor(directory: string) {
    super(directory, ARTICLES_COLLECTION_NAME);
  }
}
