import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Color } from "../utils/colors.utils";

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

export type PageCategoriesList = {
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
