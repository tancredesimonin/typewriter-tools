import { TypewriterStage } from "../../shared/config/typewriter.config.js";
import { frontmatterRegex } from "./frontmatter.constants.js";
import { removeQuotes } from "./frontmatter.utils.js";

/**
 * Parses the frontmatter from a file content and returns the metadata and content.
 * @template T - The type of the metadata object ex: MDXArticleMetadata.
 * @param {string} fileContent - The content of the file.
 * @param {TypewriterStage} stage - The stage of the Typewriter.
 * @returns {{ metadata: T, content: string }} - The metadata and content.
 */
export function parseFrontmatter<T>(
  fileContent: string,
  stage: TypewriterStage,
  allowedKeys: Set<keyof T>
) {
  let match = frontmatterRegex.exec(fileContent);
  if (!match || !match[1]) {
    throw new Error(`No frontmatter found in file ${fileContent}`);
  }

  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();

  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<T> = {};

  frontMatterLines.forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1 && stage === "published") {
      throw new Error(
        `Invalid frontmatter line: ${line}. Colon not found. in file ${frontMatterBlock}`
      );
    }

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (!key) {
      throw new Error(
        `Invalid frontmatter key found: ${key} in file ${frontMatterBlock}`
      );
    }

    if (allowedKeys.has(key as keyof T)) {
      if (key === "tags") {
        (metadata as any)[key] = value
          ? value
              .replace(/^\[|\]$/g, "")
              .split(",")
              .map((tag) => removeQuotes(tag.trim()))
          : [];
      } else {
        metadata[key as keyof T] = value
          ? removeQuotes(value)
          : (undefined as any);
      }
    } else {
      throw new Error(
        `Unknown frontmatter key found ${key} in file ${frontMatterBlock}`
      );
    }
  });

  return { metadata: metadata as T, content };
}
