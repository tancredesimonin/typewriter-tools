import { readFileSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { PageTagsList } from "../../shared/types/tags.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

export const MDX_TAGS_LIST_PAGE_FILE_NAME = "_tags";

type MDXPageTagsListMetadata = {
  title: string;
  catchline: string;
  description: string;
  updatedAt?: string;
};
const allowedKeys: Set<keyof MDXPageTagsListMetadata> = new Set<
  keyof MDXPageTagsListMetadata
>(["title", "catchline", "description", "updatedAt"]);

function readMDXFile(filePath: string, stage: TypewriterStage) {
  let rawContent = readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent, stage, allowedKeys);
}

export function getMDXPageTagsList(
  directory: string,
  stage: TypewriterStage = "published"
): PageTagsList[] {
  const stageFolder = stage === "drafts" ? "tags/drafts" : "tags";
  const dir = path.join(directory, "content", stageFolder);

  let mdxFilesInDir = getMDXFilesInDir(dir);

  // filter to get only _tags.locale.mdx pages
  let mdxFilesPageArticlesList = mdxFilesInDir.filter((file) =>
    file.startsWith(MDX_TAGS_LIST_PAGE_FILE_NAME)
  );

  return mdxFilesPageArticlesList.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file), stage);

    let fileName = path.basename(file, path.extname(file));

    let locale = getMDXFileLocale(fileName);

    return {
      title: metadata.title,
      catchline: metadata.catchline,
      locale,
      description: metadata.description,
      updatedAt: metadata.updatedAt ?? new Date().toDateString(),
      content,
      seo: {
        metaTitle: metadata.title,
        metaDescription: metadata.description,
      },
      meta: {},
    };
  });
}
