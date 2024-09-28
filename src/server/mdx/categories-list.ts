import { PageCategoriesList } from "../../shared/index.js";
import { MDXListPageBaseRepository } from "./list-page-base.repository.js";

const CATEGORIES_COLLECTION_NAME = "categories";

export class MDXCategoryListPageRepository extends MDXListPageBaseRepository<PageCategoriesList> {
  constructor(directory: string) {
    super(directory, CATEGORIES_COLLECTION_NAME);
  }
}
