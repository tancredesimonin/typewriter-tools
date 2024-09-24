import { Color, validColors } from "../../shared/utils/colors.utils.js";
import { iconKeys, IconName } from "../../shared/utils/icons.utils.js";

export class MDXOptionRepository {
  public readonly colors: Color[];
  public readonly icons: IconName[];
  constructor() {
    this.colors = [...validColors];
    this.icons = [...iconKeys];
  }
}
