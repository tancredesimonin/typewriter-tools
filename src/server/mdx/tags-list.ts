import fs from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils.js";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants.js";
import { PageTagsList } from "../../shared/types/tags.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";

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

function parseFrontmatter(fileContent: string) {
  let match = frontmatterRegex.exec(fileContent);
  if (!match) {
    throw new Error("No frontmatter found in page tags list file");
  }

  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();

  if (!frontMatterBlock) {
    throw new Error("No frontmatter found in page tags list file");
  }

  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<MDXPageTagsListMetadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    if (!key) {
      throw new Error(
        `Invalid frontmatter key found in page tags list: ${key} in file ${frontMatterBlock}`
      );
    }

    if (allowedKeys.has(key as keyof MDXPageTagsListMetadata)) {
      let value = valueArr.join(": ").trim();
      switch (key) {
        case "tags":
          // Remove the brackets and split by commas
          value = value.replace(/^\[|\]$/g, "");
          metadata[key as keyof MDXPageTagsListMetadata] = value
            .split(",")
            .map((tag) => removeQuotes(tag.trim())) as any;
          break;
        default:
          metadata[key as keyof MDXPageTagsListMetadata] = removeQuotes(
            value
          ) as any;
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found in page tags list: ${key} in file ${frontMatterBlock}`
      );
    }
  });

  return { metadata: metadata as MDXPageTagsListMetadata, content };
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
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
    let { metadata, content } = readMDXFile(path.join(dir, file));

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
