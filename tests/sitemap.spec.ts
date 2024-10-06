import { TypewriterSitemapBuilder } from "../src/server/sitemap";
import { TypewriterClientRouter } from "../src/client/client";
import { TypewriterContent } from "../src/server/content";
import { TypewriterConfig } from "../src/shared/config/typewriter.config";
import { describe, beforeEach, expect, test, jest } from "@jest/globals";

describe("TypewriterSitemapBuilder", () => {
  let config: TypewriterConfig<string>;
  let router: TypewriterClientRouter<string>;
  let content: TypewriterContent<string>;
  let sitemapBuilder: TypewriterSitemapBuilder<string>;

  beforeEach(() => {
    config = {
      defaultLocale: "en",
    } as TypewriterConfig<string>;

    router = {
      home: { canonical: "/" },
      articles: { canonical: "/articles" },
      categories: { canonical: "/categories" },
      series: { canonical: "/series" },
      tags: { canonical: "/tags" },
    } as TypewriterClientRouter<string>;

    content = {
      home: {
        page: jest.fn().mockReturnValue({
          path: "/",
          alternate: { paths: { es: "es/", fr: "fr/", pt: "pt/" } },
        }),
      },
      articles: {
        base: {
          page: jest.fn().mockReturnValue({
            path: "/articles",
            alternate: {
              paths: {
                es: "es/articles/",
                fr: "fr/articles/",
                pt: "pt/articles/",
              },
            },
          }),
        },
        all: jest
          .fn()
          .mockReturnValue({ uniqueSlugs: ["article-1", "article-2"] }),
        bySlug: jest.fn().mockReturnValue({
          article: { updatedAt: "2024-10-05" },
          canonical: "/articles/article-1",
          alternate: {
            paths: {
              es: "es/articles/article-1",
              fr: "fr/articles/article-1",
              pt: "pt/articles/article-1",
            },
          },
        }),
      },
      // Add similar mock implementations for categories, series, and tags
    } as unknown as TypewriterContent<string>;

    sitemapBuilder = new TypewriterSitemapBuilder(config, router, content);
  });

  test("buildHomePageSitemap", () => {
    const result = sitemapBuilder["_buildHomePageSitemap"]();
    expect(result).toEqual({
      url: "/",
      priority: 1,
      changeFrequency: "daily",
      lastModified: expect.any(Date),
      alternates: {
        languages: {
          en: "/",
          es: "es/",
          fr: "fr/",
          pt: "pt/",
        },
      },
    });
  });
});
