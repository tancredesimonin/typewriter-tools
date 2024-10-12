import fs, { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { getDynamicColor } from "../../shared/utils/colors.utils.js";
import { getDynamicIcon } from "../../shared/utils/icons.utils.js";
import { Category } from "../../shared/types/categories.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

type MDXCategoryMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

type CreateCategory = Partial<Category> & {
  slug: string;
  locale: string;
};

export class MDXCategoryRepository {
  private readonly directory: string;
  private readonly publishedDir: string;
  private readonly draftsDir: string;

  constructor(directory: string) {
    this.directory = directory;
    this.publishedDir = path.join(this.directory, "content", "categories");
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

  private static readonly allowedKeys = new Set<keyof MDXCategoryMetadata>([
    "title",
    "catchline",
    "description",
    "icon",
    "color",
  ] as const);

  private readMDXFile(filePath: string, stage: TypewriterStage) {
    let rawContent = readFileSync(filePath, "utf-8");
    return parseFrontmatter<MDXCategoryMetadata>(
      rawContent,
      stage,
      MDXCategoryRepository.allowedKeys
    );
  }

  private static getMDXFileSlug(fileName: string): string {
    const withoutLocale = fileName.slice(0, -3);

    return withoutLocale;
  }

  public all(stage: TypewriterStage = "published"): Category[] {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    let mdxFiles = getMDXFilesInDir(dir).filter(
      (file) => !file.startsWith("_")
    );

    const categories = mdxFiles.map((file) => {
      return this.mapFromMDXToCategory(path.join(dir, file), stage);
    });

    return categories.sort();
  }

  public delete(
    category: Category,
    stage: TypewriterStage = "published"
  ): void {
    const { filePath } = this.mapFromCategoryToMDX(category, stage);
    fs.rmSync(filePath);
  }

  public upsert(
    category: CreateCategory,
    stage: TypewriterStage = "published"
  ): void {
    const { content, filePath } = this.mapFromCategoryToMDX(category, stage);
    fs.writeFileSync(filePath, content);
  }

  public publish(category: Category): void {
    this.upsert(category, "published");
    this.delete(category, "drafts");
  }

  public unpublish(category: Category): void {
    this.upsert(category, "drafts");
    this.delete(category, "published");
  }

  public mapFromMDXToCategory(
    filePath: string,
    stage: TypewriterStage
  ): Category {
    let { metadata, content } = this.readMDXFile(filePath, stage);

    let fileName = path.basename(filePath, path.extname(filePath));

    let locale = getMDXFileLocale(fileName);
    let slug = MDXCategoryRepository.getMDXFileSlug(fileName);

    return {
      title: metadata.title,
      catchline: metadata.catchline,
      slug,
      locale,
      description: metadata.description,
      icon: getDynamicIcon(metadata.icon),
      color: getDynamicColor(metadata.color),
      content,
      seo: {
        metaTitle: metadata.title,
        metaDescription: metadata.description,
      },
    };
  }

  public mapFromCategoryToMDX(
    category: CreateCategory,
    stage: TypewriterStage = "published"
  ): { content: string; filePath: string } {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;
    const fileName = `${category.slug}.${category.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${category.title ?? ""}"
catchline: "${category.catchline ?? ""}"
description: "${category.description ?? ""}"
icon: "${category.icon ?? ""}"
color: "${category.color ?? ""}"
---

${category.content ?? ""}
`;

    return { content, filePath };
  }
}
