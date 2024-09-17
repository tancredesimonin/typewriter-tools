export type Article = {
  title: string;
  catchline: string;
  slug: string;
  locale: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  meta: {
    tags: string[];
    category: string;
    serie?: {
      slug: string;
      order: number;
    };
  };
};

export type PageArticlesList = {
  title: string;
  catchline: string;
  locale: string;
  description: string;
  updatedAt: string;
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  meta: {};
};
