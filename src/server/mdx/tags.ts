import fs, { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { getDynamicColor } from "../../shared/utils/colors.utils.js";
import { getDynamicIcon } from "../../shared/utils/icons.utils.js";
import { Tag } from "../../shared/types/tags.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

type MDXTagsMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

type CreateTag = Partial<Tag> & {
  slug: string;
  locale: string;
};

export class MDXTagRepository {
  private readonly directory: string;
  private readonly publishedDir: string;
  private readonly draftsDir: string;

  constructor(directory: string) {
    this.directory = directory;
    this.publishedDir = path.join(this.directory, "content", "tags");
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

  private static readonly allowedKeys: Set<keyof MDXTagsMetadata> = new Set<
    keyof MDXTagsMetadata
  >(["title", "catchline", "description", "icon", "color"]);

  private static readMDXFile(filePath: string, stage: TypewriterStage) {
    let rawContent = readFileSync(filePath, "utf-8");
    return parseFrontmatter<MDXTagsMetadata>(
      rawContent,
      stage,
      MDXTagRepository.allowedKeys
    );
  }

  private static getMDXFileSlug(fileName: string): string {
    const withoutLocale = fileName.slice(0, -3);

    return withoutLocale;
  }

  public all(stage: TypewriterStage = "published"): Tag[] {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    let mdxFiles = getMDXFilesInDir(dir).filter(
      (file) => !file.startsWith("_")
    );

    return mdxFiles.map((file) => {
      return this.mapFromMDXToTag(path.join(dir, file), stage);
    });
  }

  public delete(tag: Tag, stage: TypewriterStage = "published"): void {
    const { filePath } = this.mapFromTagToMDX(tag, stage);
    fs.rmSync(filePath);
  }

  public upsert(tag: CreateTag, stage: TypewriterStage = "published"): void {
    const { content, filePath } = this.mapFromTagToMDX(tag, stage);
    fs.writeFileSync(filePath, content);
  }

  public publish(tag: Tag): void {
    this.upsert(tag, "published");
    this.delete(tag, "drafts");
  }

  public mapFromMDXToTag(filePath: string, stage: TypewriterStage): Tag {
    let { metadata, content } = MDXTagRepository.readMDXFile(filePath, stage);

    let fileName = path.basename(filePath, path.extname(filePath));

    let locale = getMDXFileLocale(fileName);
    let slug = MDXTagRepository.getMDXFileSlug(fileName);

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

  public mapFromTagToMDX(
    tag: CreateTag,
    stage: TypewriterStage = "published"
  ): {
    content: string;
    filePath: string;
  } {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;
    const fileName = `${tag.slug}.${tag.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${tag.title ?? ""}"
catchline: "${tag.catchline ?? ""}"
description: "${tag.description ?? ""}"
icon: "${tag.icon ?? ""}"
color: "${tag.color ?? ""}"
---

${tag.content ?? ""}
`;

    return { content, filePath };
  }
}
