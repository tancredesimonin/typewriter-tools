import dynamicIconImports from "lucide-react/dynamicIconImports.js";
import { Color } from "../utils/colors.utils.js";

export type Tag = {
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

export type PageTagsList = {
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
