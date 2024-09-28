import { PageSeriesList } from "../../shared/index.js";
import { MDXListPageBaseRepository } from "./list-page-base.repository.js";

const SERIES_COLLECTION_NAME = "series";

export class MDXSeriesListPageRepository extends MDXListPageBaseRepository<PageSeriesList> {
  constructor(directory: string) {
    super(directory, SERIES_COLLECTION_NAME);
  }
}
