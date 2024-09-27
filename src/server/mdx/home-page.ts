import { readFileSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { HomePage } from "../../shared/types/pages.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

export const MDX_HOME_PAGE_FILE_NAME = "home";

type MDXHomePageMetadata = {
  title: string;
  catchline: string;
  description: string;
  updatedAt?: string;
  tags: string[];
};
const allowedKeys: Set<keyof MDXHomePageMetadata> = new Set<
  keyof MDXHomePageMetadata
>(["title", "catchline", "description", "updatedAt", "tags"]);

function readMDXFile(filePath: string, stage: TypewriterStage) {
  let rawContent = readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent, stage, allowedKeys);
}

export function getMDXPageHome(
  directory: string,
  stage: TypewriterStage = "published"
): HomePage[] {
  const stageFolder = stage === "drafts" ? "home/drafts" : "home";
  const dir = path.join(directory, "content", stageFolder);

  let mdxFilesInDir = getMDXFilesInDir(dir);

  // filter to get only home.locale.mdx pages
  let mdxFilesPageArticlesList = mdxFilesInDir.filter((file) =>
    file.startsWith(MDX_HOME_PAGE_FILE_NAME)
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
