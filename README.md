# Liquid Function Tester

Designed as a boilerplate to test snippets. Allowing you to define a test suite to test your snippet results.

How it works:

1. Dynamically creates a page on the Shopify store called `liquid-fn-test` with a page template assigned to it
2. For each test case, a dynamically created page template with the snippet setup is included
3. Store URL containing the dynamically created page is then fetched
4. Fetched page content is compared against expected result
5. Results are outputted to the terminal
6. Cleanup of page templates

Because it runs _on_ the Shopify store, any Liquid will be in the context of the shop including all variables (local, `all_products`, `product`, `request`, etc).

## Installation

### Docker

`docker build -t liquid_fn .` to build the image.

See _Creating a test_ section for next steps.

### Manual

`npm install` to install dependencies.

See _Creating a test_ section for next steps.

## Creating a test

### 1. Snippet

Place your snippet into the `tests` directory.

### 2. Test

Copy the `tests/example.js` file and rename it to the same as your snippet's name. For example: If your snippet is called `monkey.liquid`, then create a test file called `monkey.js`.

Modify the contents of the newly created test file to suit your testing needs.

#### Setup & Teardown

If you would like to extend the setup or teardown methods with your own code, you can do so as such:

```js
class Example {
  // ...

  async setup() {
    await super.setup();
    // your code
  }

  async teardown() {
    await super.teardown();
    // your code
  }

  // ...
}
```

## Running

Three items are required for running a test:

1. Publicly accessible store (not behind password)
2. An access token with ability to `read_themes` and `write_themes`
3. A theme's ID to modify assets

### Docker

`docker run -it -v .:/app:z liquid_fn node index.js (store) (token) (theme_id) (test_name)`

Example: `docker run -it -v .:/app:z liquid_fn node index.js someone.myshopify.com 89yurui389389ryiuriuu488 89389838 example`.

### Manual

`node index.js (store) (token) (theme_id) (test_name)`

Example: `node index.js someone.myshopify.com 89yurui389389ryiuriuu488 89389838 example`

## Examples

See [tests/example.liquid](./tests/example.liquid) and [tests/example.js](./tests/example.js).

Example output:

![Output](./example.png)
