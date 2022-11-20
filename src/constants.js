// Asset type
const AssetType = Object.freeze({
  Page: "page",
  Snippet: "snippet",
  Template: "template",
});

// HTTP method, maps for use on Shopify API.
const HttpMethod = Object.freeze({
  Get: "get",
  Post: "post",
  Put: "put",
  Delete: "delete",
});

module.exports = {
  AssetType,
  HttpMethod,
};
