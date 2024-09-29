import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";
import { formatDate, PageBase } from "../../shared/index.js";

export type MDXPageBaseMetadata = {
  title: string;
  catchline: string;
  description: string;
  updatedAt?: string;
};

export type CreatePageBase = Partial<PageBase> & {
  locale: string;
};

export class MDXPageBaseRepository<U extends PageBase> {
  private readonly directory: string;
  private readonly publishedDir: string;
  private readonly draftsDir: string;
  private readonly pageName: string;
  private readonly fileName: string;

  private readonly allowedKeys: Set<keyof MDXPageBaseMetadata>;

  constructor(
    directory: string,
    /**
     * ex: "home", "about", "contact", "404", etc.
     */
    pageName: string
  ) {
    this.directory = directory;
    this.pageName = pageName;
    this.fileName = pageName;

    this.publishedDir = path.join(this.directory, "content", this.pageName);
    this.draftsDir = path.join(this.publishedDir, "drafts");
    this.allowedKeys = new Set<keyof MDXPageBaseMetadata>([
      "title",
      "catchline",
      "description",
      "updatedAt",
    ]);
  }

  private readMDXFile(filePath: string, stage: TypewriterStage) {
    let rawContent = readFileSync(filePath, "utf-8");
    return parseFrontmatter(rawContent, stage, this.allowedKeys);
  }

  public setup() {
    if (!existsSync(this.publishedDir)) {
      mkdirSync(this.publishedDir);
    }
    if (!existsSync(this.draftsDir)) {
      mkdirSync(this.draftsDir);
    }
  }

  public forceFileCreation(locale: string) {
    this.setup();
    const fileName = `${this.fileName}.${locale}.mdx`;
    const draftFilePath = path.join(this.draftsDir, fileName);
    const publishedFilePath = path.join(this.publishedDir, fileName);

    if (!existsSync(draftFilePath) && !existsSync(publishedFilePath)) {
      this.upsert({ locale }, "drafts");
    }
  }

  public all(stage: TypewriterStage = "published"): U[] {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    let mdxFiles = getMDXFilesInDir(dir).filter((file) =>
      file.startsWith(this.fileName)
    );

    return mdxFiles.map((file) => {
      return this.mapFromMDXToPageList(path.join(dir, file), stage);
    });
  }

  public delete(
    pageList: CreatePageBase,
    stage: TypewriterStage = "published"
  ): void {
    const { filePath } = this.mapFromListPageToMDX(pageList, stage);
    rmSync(filePath);
  }

  public upsert(
    pageList: CreatePageBase,
    stage: TypewriterStage = "published"
  ): void {
    const { content, filePath } = this.mapFromListPageToMDX(pageList, stage);
    writeFileSync(filePath, content);
  }

  public publish(pageList: U): void {
    this.upsert(pageList, "published");
    this.delete(pageList, "drafts");
  }

  public unpublish(pageList: U): void {
    this.upsert(pageList, "drafts");
    this.delete(pageList, "published");
  }

  private mapFromMDXToPageList(filePath: string, stage: TypewriterStage): U {
    let { metadata, content } = this.readMDXFile(filePath, stage);

    let fileName = path.basename(filePath, path.extname(filePath));
    let locale = getMDXFileLocale(fileName);
    const updatedAt =
      metadata.updatedAt ?? formatDate(new Date().toISOString());

    return {
      title: metadata.title,
      catchline: metadata.catchline,
      description: metadata.description,
      locale,
      updatedAt,
      content,
      seo: {
        metaTitle: metadata.title,
        metaDescription: metadata.description,
      },
      meta: {},
    } as U;
  }

  private mapFromListPageToMDX(
    pageListBase: CreatePageBase,
    stage: TypewriterStage = "published"
  ): { content: string; filePath: string } {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;

    const updatedAt =
      pageListBase.updatedAt ?? formatDate(new Date().toISOString());

    const fileName = `${this.fileName}.${pageListBase.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${pageListBase.title ?? ""}"
catchline: "${pageListBase.catchline ?? ""}"
description: "${pageListBase.description ?? ""}"
updatedAt: ${updatedAt ?? ""}
---

${pageListBase.content ?? ""}
`;

    return { content, filePath };
  }
}
