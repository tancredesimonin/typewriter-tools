import { Color } from "../utils/colors.utils.js";
import { IconName } from "../utils/icons.utils.js";
import { ListPageBase } from "./pages.js";

export type Tag = {
  title: string;
  catchline: string;
  slug: string;
  locale: string;
  description: string;
  content: string;
  icon: IconName;
  color: Color;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
};

export type PageTagsList = ListPageBase;
