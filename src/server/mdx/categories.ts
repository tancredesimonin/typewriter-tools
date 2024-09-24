import fs, { existsSync, mkdirSync } from "fs";
import path from "path";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants.js";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils.js";
import { getDynamicColor } from "../../shared/utils/colors.utils.js";
import { getDynamicIcon } from "../../shared/utils/icons.utils.js";
import { Category } from "../../shared/types/categories.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";

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

  private static parseFrontmatter(fileContent: string) {
    let match = frontmatterRegex.exec(fileContent);
    if (!match) {
      throw new Error("No frontmatter found in category file");
    }

    let frontMatterBlock = match[1];
    let content = fileContent.replace(frontmatterRegex, "").trim();

    if (!frontMatterBlock) {
      throw new Error("No frontmatter found in category file");
    }

    let frontMatterLines = frontMatterBlock.trim().split("\n");
    let metadata: Partial<MDXCategoryMetadata> = {};

    frontMatterLines.forEach((line) => {
      let [key, ...valueArr] = line.split(": ");
      if (!key) {
        throw new Error(
          `Invalid frontmatter key found in category: ${key} in file ${frontMatterBlock}`
        );
      }

      if (
        MDXCategoryRepository.allowedKeys.has(key as keyof MDXCategoryMetadata)
      ) {
        let value = valueArr.join(": ").trim();
        switch (key) {
          default:
            metadata[key as keyof MDXCategoryMetadata] = removeQuotes(
              value
            ) as any;
        }
      } else {
        throw new Error(
          `Unknown frontmatter key found in category: ${key} in file ${frontMatterBlock}`
        );
      }
    });
    return { metadata: metadata as MDXCategoryMetadata, content };
  }

  private readMDXFile(filePath: string) {
    let rawContent = fs.readFileSync(filePath, "utf-8");
    return MDXCategoryRepository.parseFrontmatter(rawContent);
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

    return mdxFiles.map((file) => {
      return this.mapFromMDXToCategory(path.join(dir, file));
    });
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

  public mapFromMDXToCategory(filePath: string): Category {
    let { metadata, content } = this.readMDXFile(filePath);

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
title: "${category.title}"
catchline: "${category.catchline}"
description: "${category.description}"
icon: "${category.icon}"
color: "${category.color}"
---

${category.content}
`;

    return { content, filePath };
  }
}
