import path from "path";
import { readFileSync } from "fs";
import {
  getMDXFileLocale,
  getMDXFilesInDir,
} from "../frontmatter/frontmatter.utils.js";
import { Website } from "../../shared/types/website.js";
import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { parseFrontmatter } from "../frontmatter/frontmatter.parser.js";

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

function readMDXFile(filePath: string, stage: TypewriterStage) {
  let rawContent = readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent, stage, allowedKeys);
}

export function getMDXWebsite(
  directory: string,
  stage: TypewriterStage = "published"
): Website[] {
  const stageFolder = stage === "drafts" ? "website/drafts" : "website";
  const dir = path.join(directory, "content", stageFolder);

  let mdxFiles = getMDXFilesInDir(dir).filter((file) => !file.startsWith("_"));

  return mdxFiles.map((file) => {
    let { metadata } = readMDXFile(path.join(dir, file), stage);

    let fileName = path.basename(file, path.extname(file));

    let locale = getMDXFileLocale(fileName);
    const currentYear = new Date().getFullYear();

    return {
      name: metadata.name,
      creator: metadata.creator,
      publisher: metadata.publisher,
      twitterProfile: metadata.twitterProfile,
      locale,
      copyright: `© ${currentYear} ${metadata.name}. All rights reserved.`,
    };
  });
}
