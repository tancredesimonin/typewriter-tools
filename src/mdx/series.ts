import fs from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants";
import { Color, getDynamicColor } from "../frontmatter/colors.utils";
import { getDynamicIcon } from "../frontmatter/icons.utils";

type MDXSerieMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

const allowedKeys: Set<keyof MDXSerieMetadata> = new Set<
  keyof MDXSerieMetadata
>(["title", "catchline", "description", "icon", "color"]);

export type Serie = {
  title: string;
  catchline: string;
  slug: string;
  locale: string;
  description: string;
  content: string;
  icon: keyof typeof dynamicIconImports;
  color: Color;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
};

function parseFrontmatter(fileContent: string) {
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

    if (allowedKeys.has(key as keyof MDXSerieMetadata)) {
      let value = valueArr.join(": ").trim();
      switch (key) {
        default:
          metadata[key as keyof MDXSerieMetadata] = removeQuotes(value) as any;
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found in serie: ${key} in file ${frontMatterBlock}`
      );
    }
  });
  return { metadata: metadata as MDXSerieMetadata, content };
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXFileSlug(fileName: string): string {
  const withoutLocale = fileName.slice(0, -3);

  return withoutLocale;
}

export function getMDXSeries(): Serie[] {
  const dir = path.join(process.cwd(), "content/series");

  let mdxFiles = getMDXFilesInDir(dir).filter((file) => !file.startsWith("_"));

  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));

    let fileName = path.basename(file, path.extname(file));

    let locale = getMDXFileLocale(fileName);
    let slug = getMDXFileSlug(fileName);

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
  });
}
