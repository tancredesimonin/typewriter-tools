import { PageTagsList } from "../../shared/index.js";
import { MDXListPageBaseRepository } from "./list-page-base.repository.js";

const TAGS_COLLECTION_NAME = "tags";

export class MDXTagListPageRepository extends MDXListPageBaseRepository<PageTagsList> {
  constructor(directory: string) {
    super(directory, TAGS_COLLECTION_NAME);
  }
}
