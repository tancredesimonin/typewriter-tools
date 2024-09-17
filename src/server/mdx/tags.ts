import fs from "fs";
import path from "path";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils";
import { getDynamicColor } from "../../shared/utils/colors.utils";
import { getDynamicIcon } from "../../shared/utils/icons.utils";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants";
import { Tag } from "../../shared/types/tags";

type MDXTagsMetadata = {
  title: string;
  catchline: string;
  description: string;
  content: string;
  icon?: string;
  color?: string;
};

const allowedKeys: Set<keyof MDXTagsMetadata> = new Set<keyof MDXTagsMetadata>([
  "title",
  "catchline",
  "description",
  "icon",
  "color",
]);

function parseFrontmatter(fileContent: string) {
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

    if (allowedKeys.has(key as keyof MDXTagsMetadata)) {
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

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXFileSlug(fileName: string): string {
  const withoutLocale = fileName.slice(0, -3);

  return withoutLocale;
}

export function getMDXTags(): Tag[] {
  const dir = path.join(process.cwd(), "content/tags");

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
