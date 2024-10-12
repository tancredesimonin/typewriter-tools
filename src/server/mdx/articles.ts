import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { Article } from "../../shared/types/articles.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { formatDate } from "../../shared/index.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

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
  }

  public setup() {
    if (!existsSync(this.publishedDir)) {
      mkdirSync(this.publishedDir);
    }
    if (!existsSync(this.draftsDir)) {
      mkdirSync(this.draftsDir);
    }
  }

  private static readonly allowedKeys = new Set<keyof MDXArticleMetadata>([
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

  private static readMDXFile(filePath: string, stage: TypewriterStage) {
    let rawContent = readFileSync(filePath, "utf-8");
    return parseFrontmatter<MDXArticleMetadata>(
      rawContent,
      stage,
      this.allowedKeys
    );
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

    const articles = mdxFiles.map((file) => {
      return this.mapFromMDXToArticle(path.join(dir, file), stage);
    });

    return articles.sort((a, b) => {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
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

  public unpublish(article: Article): void {
    this.upsert(article, "drafts");
    this.delete(article, "published");
  }

  public mapFromMDXToArticle(
    filePath: string,
    stage: TypewriterStage
  ): Article {
    let { metadata, content } = MDXArticleRepository.readMDXFile(
      filePath,
      stage
    );

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
title: "${article.title ?? ""}"
catchline: "${article.catchline ?? ""}"
description: "${article.description ?? ""}"
publishedAt: ${publishedAt ?? ""}
updatedAt: ${updatedAt ?? ""}
category: "${article.meta?.category ?? ""}"
tags: [${article.meta?.tags.map((tag) => `"${tag}"`).join(", ")}]
${
  article.meta?.serie && article.meta.serie.slug
    ? `serie: "${article.meta.serie.slug}"`
    : ""
}
${
  article.meta?.serie && article.meta.serie.order
    ? `serieOrder: ${article.meta.serie.order}`
    : ""
}
---

${article.content ?? ""}
`;

    return { content, filePath };
  }
}
