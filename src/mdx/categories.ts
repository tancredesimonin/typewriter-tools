import fs from "fs";
import path from "path";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils";
import { Color, getDynamicColor } from "../frontmatter/colors.utils";
import { getDynamicIcon } from "../frontmatter/icons.utils";

type MDXCategoryMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

const allowedKeys: Set<keyof MDXCategoryMetadata> = new Set<
  keyof MDXCategoryMetadata
>(["title", "catchline", "description", "icon", "color"]);

export type Category = {
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

    if (allowedKeys.has(key as keyof MDXCategoryMetadata)) {
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

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXFileSlug(fileName: string): string {
  const withoutLocale = fileName.slice(0, -3);

  return withoutLocale;
}

export function getMDXCategories(): Category[] {
  const dir = path.join(process.cwd(), "content/categories");

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
