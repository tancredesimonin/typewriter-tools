import fs from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants";

export const MDX_CATEGORIES_LIST_PAGE_FILE_NAME = "_categories";

type MDXPageCategoriesListMetadata = {
  title: string;
  catchline: string;
  description: string;
  updatedAt?: string;
};
const allowedKeys: Set<keyof MDXPageCategoriesListMetadata> = new Set<
  keyof MDXPageCategoriesListMetadata
>(["title", "catchline", "description", "updatedAt"]);

export type PageCategoriesList = {
  title: string;
  catchline: string;
  locale: string;
  description: string;
  updatedAt: string;
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  meta: {};
};

function parseFrontmatter(fileContent: string) {
  let match = frontmatterRegex.exec(fileContent);
  if (!match) {
    throw new Error("No frontmatter found in page categories list file");
  }

  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();

  if (!frontMatterBlock) {
    throw new Error("No frontmatter found in page categories list file");
  }

  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<MDXPageCategoriesListMetadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    if (!key) {
      throw new Error(
        `Invalid frontmatter key found in page categories list: ${key} in file ${frontMatterBlock}`
      );
    }

    if (allowedKeys.has(key as keyof MDXPageCategoriesListMetadata)) {
      let value = valueArr.join(": ").trim();
      switch (key) {
        case "tags":
          // Remove the brackets and split by commas
          value = value.replace(/^\[|\]$/g, "");
          metadata[key as keyof MDXPageCategoriesListMetadata] = value
            .split(",")
            .map((tag) => removeQuotes(tag.trim())) as any;
          break;
        default:
          metadata[key as keyof MDXPageCategoriesListMetadata] = removeQuotes(
            value
          ) as any;
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found in page categories list: ${key} in file ${frontMatterBlock}`
      );
    }
  });

  return { metadata: metadata as MDXPageCategoriesListMetadata, content };
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

export function getMDXPageCategoriesList(): PageCategoriesList[] {
  const dir = path.join(process.cwd(), "content/categories");

  let mdxFilesInDir = getMDXFilesInDir(dir);

  // filter to get only _categories.locale.mdx pages
  let mdxFilesPageArticlesList = mdxFilesInDir.filter((file) =>
    file.startsWith(MDX_CATEGORIES_LIST_PAGE_FILE_NAME)
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
