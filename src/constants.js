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

// Emitter events
const Event = Object.freeze({
  SetupStart: "setup:start",
  SetupEnd: "setup:end",
  SetupFailure: "setup:failure",
  TeardownStart: "teardown:start",
  TeardownEnd: "teardown:end",
  TeardownFailure: "teardown:failure",
  LiquidLoadStart: "liquid-load:start",
  LiquidLoadEnd: "liquid-load:end",
  LiquidLoadFailure: "liquid-load:failure",
  RenderStart: "render:start",
  RenderEnd: "render:end",
  RenderFailure: "render:failure",
  RenderRetry: "render:retry",
  RenderRetryFailure: "render:retry:failure",
  RenderSuffix: "render:suffix",
  AssertStart: "assert:start",
  AssertSuccess: "assert:success",
  AssertFailure: "assert:failure",
});

// Presenter types
const PresenterType = {
  Default: "default",
  JSON: "json",
};

module.exports = {
  AssetType,
  PresenterType,
  HttpMethod,
  Event,
};
