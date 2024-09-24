import fs, { existsSync, mkdirSync } from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils.js";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants.js";
import { getDynamicColor } from "../../shared/utils/colors.utils.js";
import { getDynamicIcon } from "../../shared/utils/icons.utils.js";
import { Serie } from "../../shared/types/series.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";

type MDXSerieMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

type CreateSerie = Partial<Serie> & {
  slug: string;
  locale: string;
};

export class MDXSerieRepository {
  private readonly directory: string;
  private readonly publishedDir: string;
  private readonly draftsDir: string;

  constructor(directory: string) {
    this.directory = directory;
    this.publishedDir = path.join(this.directory, "content", "series");
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
  private static readonly allowedKeys = new Set<keyof MDXSerieMetadata>([
    "title",
    "catchline",
    "description",
    "icon",
    "color",
  ]);

  private static parseFrontmatter(fileContent: string) {
    let match = frontmatterRegex.exec(fileContent);
    if (!match) {
      throw new Error("No frontmatter found in serie file");
    }

    let frontMatterBlock = match[1];
    let content = fileContent.replace(frontmatterRegex, "").trim();

    if (!frontMatterBlock) {
      throw new Error("No frontmatter found in serie file");
    }

    let frontMatterLines = frontMatterBlock.trim().split("\n");
    let metadata: Partial<MDXSerieMetadata> = {};

    frontMatterLines.forEach((line) => {
      let [key, ...valueArr] = line.split(": ");
      if (!key) {
        throw new Error(
          `Invalid frontmatter key found in serie: ${key} in file ${frontMatterBlock}`
        );
      }

      if (MDXSerieRepository.allowedKeys.has(key as keyof MDXSerieMetadata)) {
        let value = valueArr.join(": ").trim();
        switch (key) {
          default:
            metadata[key as keyof MDXSerieMetadata] = removeQuotes(
              value
            ) as any;
        }
      } else {
        throw new Error(
          `Unknown frontmatter key found in serie: ${key} in file ${frontMatterBlock}`
        );
      }
    });
    return { metadata: metadata as MDXSerieMetadata, content };
  }

  private static readMDXFile(filePath: string) {
    let rawContent = fs.readFileSync(filePath, "utf-8");
    return MDXSerieRepository.parseFrontmatter(rawContent);
  }

  private static getMDXFileSlug(fileName: string): string {
    const withoutLocale = fileName.slice(0, -3);

    return withoutLocale;
  }

  public all(stage: TypewriterStage = "published"): Serie[] {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;
    let mdxFiles = getMDXFilesInDir(dir).filter(
      (file) => !file.startsWith("_")
    );

    return mdxFiles.map((file) => {
      return this.mapFromMDXToSerie(path.join(dir, file));
    });
  }

  public delete(serie: Serie, stage: TypewriterStage = "published"): void {
    const { filePath } = this.mapFromSerieToMDX(serie, stage);
    fs.rmSync(filePath);
  }

  public upsert(
    serie: CreateSerie,
    stage: TypewriterStage = "published"
  ): void {
    const { content, filePath } = this.mapFromSerieToMDX(serie, stage);
    fs.writeFileSync(filePath, content);
  }

  public publish(serie: Serie): void {
    this.upsert(serie, "published");
    this.delete(serie, "drafts");
  }

  public mapFromMDXToSerie(filePath: string): Serie {
    let { metadata, content } = MDXSerieRepository.readMDXFile(filePath);

    let fileName = path.basename(filePath, path.extname(filePath));

    let locale = getMDXFileLocale(fileName);
    let slug = MDXSerieRepository.getMDXFileSlug(fileName);

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

  public mapFromSerieToMDX(
    serie: CreateSerie,
    stage: TypewriterStage = "published"
  ): { content: string; filePath: string } {
    const dir = stage === "drafts" ? this.draftsDir : this.publishedDir;
    const fileName = `${serie.slug}.${serie.locale}.mdx`;
    const filePath = path.join(dir, fileName);

    const content = `---
title: "${serie.title}"
catchline: "${serie.catchline}"
description: "${serie.description}"
icon: "${serie.icon}"
color: "${serie.color}"
---

${serie.content}
`;

    return { content, filePath };
  }
}
