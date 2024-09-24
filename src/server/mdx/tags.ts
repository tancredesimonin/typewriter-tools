import fs from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils.js";
import { getDynamicColor } from "../../shared/utils/colors.utils.js";
import { getDynamicIcon } from "../../shared/utils/icons.utils.js";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants.js";
import { Tag } from "../../shared/types/tags.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";

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

  constructor(directory: string) {
    this.directory = directory;
  }

  private static readonly allowedKeys: Set<keyof MDXTagsMetadata> = new Set<
    keyof MDXTagsMetadata
  >(["title", "catchline", "description", "icon", "color"]);

  private static parseFrontmatter(fileContent: string) {
    let match = frontmatterRegex.exec(fileContent);
    if (!match) {
      throw new Error("No frontmatter found in tag file");
    }

    let frontMatterBlock = match[1];
    let content = fileContent.replace(frontmatterRegex, "").trim();

    if (!frontMatterBlock) {
      throw new Error("No frontmatter found in tag file");
    }

    let frontMatterLines = frontMatterBlock.trim().split("\n");
    let metadata: Partial<MDXTagsMetadata> = {};

    frontMatterLines.forEach((line) => {
      let [key, ...valueArr] = line.split(": ");
      if (!key) {
        throw new Error(
          `Invalid frontmatter key found in tag: ${key} in file ${frontMatterBlock}`
        );
      }

      if (MDXTagRepository.allowedKeys.has(key as keyof MDXTagsMetadata)) {
        let value = valueArr.join(": ").trim();
        switch (key) {
          default:
            metadata[key as keyof MDXTagsMetadata] = removeQuotes(value) as any;
        }
      } else {
        throw new Error(
          `Unknown frontmatter key found in tag: ${key} in file ${frontMatterBlock}`
        );
      }
    });
    return { metadata: metadata as MDXTagsMetadata, content };
  }

  private static readMDXFile(filePath: string) {
    let rawContent = fs.readFileSync(filePath, "utf-8");
    return MDXTagRepository.parseFrontmatter(rawContent);
  }

  private static getMDXFileSlug(fileName: string): string {
    const withoutLocale = fileName.slice(0, -3);

    return withoutLocale;
  }

  public all(stage: TypewriterStage = "published"): Tag[] {
    const stageFolder = stage === "drafts" ? "tags/drafts" : "tags";
    const dir = path.join(this.directory, "content", stageFolder);

    let mdxFiles = getMDXFilesInDir(dir).filter(
      (file) => !file.startsWith("_")
    );

    return mdxFiles.map((file) => {
      return this.mapFromMDXToTag(file);
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

  public mapFromMDXToTag(file: string): Tag {
    let { metadata, content } = MDXTagRepository.readMDXFile(
      path.join(this.directory, file)
    );

    let fileName = path.basename(file, path.extname(file));

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
    const stageFolder = stage === "drafts" ? "tags/drafts" : "tags";
    const dir = path.join(this.directory, "content", stageFolder);
    const fileName = `${tag.slug}.${tag.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${tag.title}"
catchline: "${tag.catchline}"
description: "${tag.description}"
icon: "${tag.icon}"
color: "${tag.color}"
---

${tag.content}
`;

    return { content, filePath };
  }
}
