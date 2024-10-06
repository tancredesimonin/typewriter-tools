import { TypewriterClientRouter } from "../client/client.js";
import { TypewriterConfig } from "../shared/config/typewriter.config.js";
import { TypewriterContent } from "./content.js";
import { TypewriterSitemapBuilder } from "./sitemap.js";

export class TypewriterServer<T extends string> {
  public router: TypewriterClientRouter<T>;
  public content: TypewriterContent<T>;
  public sitemapBuilder: TypewriterSitemapBuilder<T>;

  constructor(config: TypewriterConfig<T>) {
    this.router = new TypewriterClientRouter<T>(config);
    this.content = new TypewriterContent<T>(config, this.router);
    this.sitemapBuilder = new TypewriterSitemapBuilder<T>(
      config,
      this.router,
      this.content
    );
  }
}
