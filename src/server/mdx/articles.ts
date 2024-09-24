import {
  existsSync,
  mkdirSync,
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
import { formatDate } from "../../shared/index.js";

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

type CreateArticle = Partial<Article> & {
  slug: string;
  locale: string;
};

export class MDXArticleRepository {
  private readonly directory: string;
  private readonly publishedDir: string;
  private readonly draftsDir: string;

  constructor(directory: string) {
    this.directory = directory;
    this.publishedDir = path.join(this.directory, "content", "articles");
    this.draftsDir = path.join(this.publishedDir, "drafts");

    if (!existsSync(this.publishedDir)) {
      mkdirSync(this.publishedDir);
      if (!existsSync(this.draftsDir)) {
        mkdirSync(this.draftsDir);
      }
    }
  }

  private static readonly allowedKeys = new Set([
    "title",
    "catchline",
    "description",
    "publishedAt",
    "updatedAt",
    "serie",
    "serieOrder",
    "category",
    "tags",
  ] as const);

  private static parseFrontmatter(fileContent: string) {
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

      if (
        MDXArticleRepository.allowedKeys.has(key as keyof MDXArticleMetadata)
      ) {
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

  private static readMDXFile(filePath: string) {
    let rawContent = readFileSync(filePath, "utf-8");
    return this.parseFrontmatter(rawContent);
  }

  private static getMDXFileSlug(fileName: string): string {
    const withoutDate = fileName.slice(11);
    const withoutLocale = withoutDate.slice(0, -3);

    return withoutLocale;
  }

  private static getMDXFileDate(fileName: string): string {
    return fileName.slice(0, 10);
  }

  public all(stage: TypewriterStage = "published"): Article[] {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;
    let mdxFiles = getMDXFilesInDir(dir).filter(
      (file) => !file.startsWith("_")
    );

    return mdxFiles.map((file) => {
      return this.mapFromMDXToArticle(path.join(dir, file));
    });
  }

  public renameSlug(
    file: string,
    newSlug: string,
    stage: TypewriterStage = "published"
  ): void {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    const filePath = path.join(dir, file);
    if (!existsSync(filePath)) {
      throw new Error(`File ${file} does not exist`);
    }

    let fileName = path.basename(file, path.extname(file));
    let date = MDXArticleRepository.getMDXFileDate(fileName);
    let locale = getMDXFileLocale(fileName);

    const newFilePath = path.join(dir, `${date}-${newSlug}.${locale}.mdx`);
    renameSync(path.join(dir, file), newFilePath);
  }

  public delete(article: Article, stage: TypewriterStage = "published"): void {
    const { filePath } = this.mapFromArticleToMDX(article, stage);
    rmSync(filePath);
  }

  public upsert(
    article: CreateArticle,
    stage: TypewriterStage = "published"
  ): void {
    const { content, filePath } = this.mapFromArticleToMDX(article, stage);

    writeFileSync(filePath, content);
  }

  public publish(article: Article): void {
    this.upsert(article, "published");
    this.delete(article, "drafts");
  }

  public mapFromMDXToArticle(filePath: string): Article {
    let { metadata, content } = MDXArticleRepository.readMDXFile(filePath);

    let fileName = path.basename(filePath, path.extname(filePath));
    let locale = getMDXFileLocale(fileName);
    let slug = MDXArticleRepository.getMDXFileSlug(fileName);
    let isInSerie: { slug: string; order: number } | undefined = undefined;

    if (metadata.serie && metadata.serieOrder) {
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

  public mapFromArticleToMDX(
    article: CreateArticle,
    stage: TypewriterStage = "published"
  ): { content: string; filePath: string } {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    const publishedAt =
      article.publishedAt ?? formatDate(new Date().toISOString());
    const updatedAt = article.updatedAt ?? formatDate(new Date().toISOString());

    const fileName = `${publishedAt}-${article.slug}.${article.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${article.title}"
catchline: "${article.catchline}"
description: "${article.description}"
publishedAt: ${publishedAt}
updatedAt: ${updatedAt}
category: ${article.meta?.category}
tags: [${article.meta?.tags.map((tag) => `"${tag}"`).join(", ")}]
${article.meta?.serie ? `serie: ${article.meta.serie.slug}` : ""}
${article.meta?.serie ? `serieOrder: ${article.meta.serie.order}` : ""}
---

${article.content}
`;

    return { content, filePath };
  }
}
