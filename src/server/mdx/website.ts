import path from "path";
import fs from "fs";
import { frontmatterRegex } from "../frontmatter/frontmatter.constants";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
  removeQuotes,
} from "../frontmatter/frontmatter.utils";
import { Website } from "../../shared/types/website";

type MDXWebsite = {
  name: string;
  creator: string;
  publisher: string;
  twitterProfile: string;
  locale: string;
};

const allowedKeys: Set<keyof MDXWebsite> = new Set<keyof MDXWebsite>([
  "name",
  "creator",
  "publisher",
  "twitterProfile",
  "locale",
]);

function parseFrontmatter(fileContent: string) {
  let match = frontmatterRegex.exec(fileContent);
  if (!match) {
    throw new Error("No frontmatter found in website file");
  }

  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();

  if (!frontMatterBlock) {
    throw new Error("No frontmatter found in website file");
  }

  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<MDXWebsite> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    if (!key) {
      throw new Error(
        `Invalid frontmatter key found in website: ${key} in file ${frontMatterBlock}`
      );
    }

    if (allowedKeys.has(key as keyof MDXWebsite)) {
      let value = valueArr.join(": ").trim();
      switch (key) {
        default:
          metadata[key as keyof MDXWebsite] = removeQuotes(value) as any;
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found in website: ${key} in file ${frontMatterBlock}`
      );
    }
  });

  return { metadata: metadata as MDXWebsite, content };
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

export function getMDXWebsite(): Website[] {
  const dir = path.join(process.cwd(), "content/website");

  let mdxFiles = getMDXFilesInDir(dir).filter((file) => !file.startsWith("_"));

  return mdxFiles.map((file) => {
    let { metadata } = readMDXFile(path.join(dir, file));

    let fileName = path.basename(file, path.extname(file));

    let locale = getMDXFileLocale(fileName);

    return {
      name: metadata.name,
      creator: metadata.creator,
      publisher: metadata.publisher,
      twitterProfile: metadata.twitterProfile,
      locale,
    };
  });
}
