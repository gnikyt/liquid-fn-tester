const { DataType } = require("@shopify/shopify-api");
const { HttpMethod, AssetType } = require("./constants");

/**
 * Assets handler.
 */
class Assets {
  /**
   * Setup.
   * @param {number} themeId Theme ID.
   * @param {Shopify} api Shopify API client.
   * @param {string} basename Base name for all pages/templates/snippets.
   */
  constructor(themeId, api, basename = "liquid-fn-test") {
    // Theme ID and API instance
    this.themeId = themeId;
    this.api = api;
    this.basename = basename;

    // Track created templates
    this.createdTemplates = [];
  }

  /**
   * Generate a random string to use for page template suffix.
   * @private
   * @static
   * @returns {string}
   */
  static suffixId() {
    return (Math.random() + 1).toString(36).substring(2);
  }

  /**
   * Send a request to Shopify (remote).
   * @param {Object} params Request parameters.
   * @returns {Promise<Object>}
   */
  async request(params) {
    const method = params.method || HttpMethod.Get;
    if (params.method) {
      // eslint-disable-next-line no-param-reassign
      delete params.method;
    }

    return this.api[method]({
      type: DataType.JSON,
      ...params,
    });
  }

  /**
   * Gets the a test asset(s) from remote, if existing.
   * @param {string} type Asset type, "page" or "snippet".
   * @returns {Promise<Object>}
   */
  async fetch(type) {
    let path;
    let params;

    switch (type) {
      case AssetType.Snippet: {
        // Get all assets to check
        path = `themes/${this.themeId}/assets.json`;
        params = {
          query: {
            asset: {
              key: `snippets/${this.basename}.liquid`,
            },
          },
        };
        break;
      }
      case AssetType.Template: {
        // Get all templates to check
        path = `themes/${this.themeId}/assets.json`;
        params = {
          query: {
            asset: {
              key: `templates/page.${this.basename}.liquid`,
            },
          },
        };
        break;
      }
      case AssetType.Page:
      default: {
        // Get all page handles to check
        path = "pages";
        params = {
          query: {
            fields: "handle,id",
          },
        };
        break;
      }
    }

    const { body } = await this.request({
      path,
      ...params,
    });
    return body;
  }

  /**
   * Creates the test page on remote.
   * @returns {Promise<Object>}
   */
  async createPage() {
    // Check if page exists
    const fetch = await this.fetch(AssetType.Page);
    const existingPage = fetch.pages.find(
      ({ handle }) => handle === this.basename,
    );
    if (existingPage) {
      return existingPage;
    }

    // Create page
    return this.request({
      method: HttpMethod.Post,
      path: "pages",
      data: {
        page: {
          title: this.basename,
          handle: this.basename,
          body_html: "Used for testing Liquid snippets.",
          template_suffix: this.basename,
          published: true,
        },
      },
    });
  }

  /**
   * Creates the test page template on remote.
   * @param {string} setupLiquid Setup Liquid file contents.
   * @returns {Promise<string>}
   */
  async createPageTemplate(setupLiquid) {
    // Body setup, replaces the local snippet name with the remote snippet name
    const value = `{%- layout none -%}${setupLiquid}`.replace(
      /render\s+('|")[a-zA-Z0-9_-]+('|")/,
      `render '${this.basename}'`,
    );

    // Create random suffix
    const suffix = Assets.suffixId();

    // Create page template
    await this.request({
      method: HttpMethod.Put,
      path: `themes/${this.themeId}/assets.json`,
      data: {
        asset: {
          value,
          key: `templates/page.${this.basename}-${suffix}.liquid`,
        },
      },
    });

    // Track
    this.createdTemplates.push(suffix);
    return suffix;
  }

  /**
   * Delete a page template on remote.
   * @param {string} suffix Page template suffix.
   * @returns {Promise<void>}
   */
  async deletePageTemplate(suffix) {
    return this.request({
      method: HttpMethod.Delete,
      path: `themes/${this.themeId}/assets.json`,
      query: {
        asset: {
          key: `templates/page.${this.basename}-${suffix}.liquid`,
        },
      },
    });
  }

  /**
   * Creates the test snippet on remote.
   * @param {string} snippetLiquid Snippet Liquid file contents.
   * @returns {Promise<Object>}
   */
  async createSnippet(snippetLiquid) {
    // Body setup
    const value = snippetLiquid;

    // Create (or update) page template
    return this.request({
      method: HttpMethod.Put,
      path: `themes/${this.themeId}/assets.json`,
      data: {
        asset: {
          value,
          key: `snippets/${this.basename}.liquid`,
        },
      },
    });
  }
}

module.exports = Assets;
