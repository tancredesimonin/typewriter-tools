import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "path";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants.js";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils.js";
import { Article } from "../../shared/types/articles.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";

type MDXArticleMetadata = {
  title: string;
  catchline: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  serie?: string;
  serieOrder?: number;
  category: string;
  tags: string[];
};
const allowedKeys: Set<keyof MDXArticleMetadata> = new Set<
  keyof MDXArticleMetadata
>([
  "title",
  "catchline",
  "description",
  "publishedAt",
  "updatedAt",
  "serie",
  "serieOrder",
  "category",
  "tags",
]);

function parseFrontmatter(fileContent: string) {
  let match = frontmatterRegex.exec(fileContent);
  if (!match) {
    throw new Error("No frontmatter found in article file");
  }

  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();

  if (!frontMatterBlock) {
    throw new Error("No frontmatter found in article file");
  }

  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<MDXArticleMetadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    if (!key) {
      throw new Error(
        `Invalid frontmatter key found in article: ${key} in file ${frontMatterBlock}`
      );
    }

    if (allowedKeys.has(key as keyof MDXArticleMetadata)) {
      let value = valueArr.join(": ").trim();
      switch (key) {
        case "tags":
          // Remove the brackets and split by commas
          value = value.replace(/^\[|\]$/g, "");
          metadata[key as keyof MDXArticleMetadata] = value
            .split(",")
            .map((tag) => removeQuotes(tag.trim())) as any;
          break;
        default:
          metadata[key as keyof MDXArticleMetadata] = removeQuotes(
            value
          ) as any;
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found in article: ${key} in file ${frontMatterBlock}`
      );
    }
  });

  return { metadata: metadata as MDXArticleMetadata, content };
}

function readMDXFile(filePath: string) {
  let rawContent = readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXFileSlug(fileName: string): string {
  const withoutDate = fileName.slice(11);
  const withoutLocale = withoutDate.slice(0, -3);

  return withoutLocale;
}

function getMDXFileDate(fileName: string): string {
  return fileName.slice(0, 10);
}

function validateCategoryExists(_categorySlug: string, _locale: string): void {
  // const categoryExists = getCategoryBySlugForLocale(categorySlug, locale);
  // if (!categoryExists) {
  //   throw new Error(
  //     `Category with slug ${categorySlug} does not exist for locale ${locale}`
  //   );
  // }
}

function validateSerieExists(_serieSlug: string, _locale: string): void {
  // const serieExists = getSerieBySlugForLocale(serieSlug, locale);
  // if (!serieExists) {
  //   throw new Error(
  //     `Serie with slug ${serieSlug} does not exist for locale ${locale}`
  //   );
  // }
}

export function getMDXArticles(
  directory: string,
  stage: TypewriterStage = "published"
): Article[] {
  const stageFolder = stage === "drafts" ? "articles/drafts" : "articles";
  const dir = path.join(directory, "content", stageFolder);

  let mdxFiles = getMDXFilesInDir(dir).filter((file) => !file.startsWith("_"));

  return mdxFiles.map((file) => {
    return mapFromMDXToArticle(dir, file);
  });
}

export function renameMDXArticleSlug(
  directory: string,
  file: string,
  newSlug: string,
  stage: TypewriterStage = "published"
): void {
  const stageFolder = stage === "drafts" ? "articles/drafts" : "articles";
  const dir = path.join(directory, "content", stageFolder);

  const filePath = path.join(dir, file);
  if (!existsSync(filePath)) {
    throw new Error(`File ${file} does not exist`);
  }

  let fileName = path.basename(file, path.extname(file));
  let date = getMDXFileDate(fileName);
  let locale = getMDXFileLocale(fileName);

  const newFilePath = path.join(dir, `${date}-${newSlug}.${locale}.mdx`);
  renameSync(path.join(dir, file), newFilePath);
}

export function deleteMDXArticle(
  directory: string,
  article: Article,
  stage: TypewriterStage = "published"
): void {
  const { filePath } = mapFromArticleToMDX(directory, article, stage);
  rmSync(filePath);
}

export function upsertMDXArticle(
  directory: string,
  article: Article,
  stage: TypewriterStage = "published"
): void {
  const { content, filePath } = mapFromArticleToMDX(directory, article, stage);

  writeFileSync(filePath, content);
}

export function publishMDXArticle(directory: string, article: Article): void {
  upsertMDXArticle(directory, article, "published");
  deleteMDXArticle(directory, article, "drafts");
}

export function mapFromMDXToArticle(dir: string, file: string): Article {
  let { metadata, content } = readMDXFile(path.join(dir, file));

  let fileName = path.basename(file, path.extname(file));
  let locale = getMDXFileLocale(fileName);
  let slug = getMDXFileSlug(fileName);
  let isInSerie: { slug: string; order: number } | undefined = undefined;

  validateCategoryExists(metadata.category, locale);

  if (metadata.serie && metadata.serieOrder) {
    validateSerieExists(metadata.serie, locale);
    isInSerie = {
      slug: metadata.serie,
      order: metadata.serieOrder,
    };
  }

  return {
    title: metadata.title,
    catchline: metadata.catchline,
    slug,
    locale,
    description: metadata.description,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt ?? metadata.publishedAt,
    content,
    seo: {
      metaTitle: metadata.title,
      metaDescription: metadata.description,
    },
    meta: {
      tags: metadata.tags,
      category: metadata.category,
      serie: isInSerie,
    },
  };
}

export function mapFromArticleToMDX(
  directory: string,
  article: Article,
  stage: TypewriterStage = "published"
): { content: string; filePath: string } {
  const stageFolder = stage === "drafts" ? "articles/drafts" : "articles";
  const dir = path.join(directory, "content", stageFolder);
  const articleFileName = `${article.publishedAt}-${article.slug}.${article.locale}.mdx`;
  const articleFilePath = path.join(dir, articleFileName);

  const articleContent = `---
title: "${article.title}"
catchline: "${article.catchline}"
description: "${article.description}"
publishedAt: ${article.publishedAt}
updatedAt: ${article.updatedAt}
category: ${article.meta.category}
tags: [${article.meta.tags.map((tag) => `"${tag}"`).join(", ")}]
${article.meta.serie ? `serie: ${article.meta.serie.slug}` : ""}
${article.meta.serie ? `serieOrder: ${article.meta.serie.order}` : ""}
---

${article.content}
`;

  return { content: articleContent, filePath: articleFilePath };
}
