# vite-plugin-virtual-html-template

[![npm version](https://badgen.net/npm/v/vite-plugin-virtual-html-template)](https://www.npmjs.com/package/vite-plugin-virtual-html-template)

HTML template for vite app, support flexible virtual URL.

The idea and part of the code for this plugin comes from [vite-plugin-html-template](https://github.com/IndexXuan/vite-plugin-html-template).

## Motivation

- Vite need html for entry file, which means we must have
  - projectRoot/index.html for SPA
  - projectRoot/app1.html, projectRoot/app2.html, projectRoot/sub/page/app3.html for MPA
- Why not we use html template for all entry html
- Also we should support lodash.template syntax for the html content, like setting `<title></title>`.

## Usage

```sh
npm i --save-dev vite-plugin-virtual-html-template
```

```js
// vite.config.js
import virtualHtmlTemplate from 'vite-plugin-virtual-html-template'

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ...other plugins
    virtualHtmlTemplate(/* options */)
  ]
})
```

## Options

```js
// you can custom template path(default is public/index.html) and page title
{
  // define pages, if SPA uses this plugin, the index page must be set
  pages: {
    index: {
      template: 'public/index.html',
      title: 'Home Page',
      entry: 'src/main.js'
    },
    app: {
      template: 'public/index.html',
      title: 'App Page',
      entry: 'src/app/main.js'
    },
    'sub/other': {
      template: 'public/index.html',
      title: 'Sub Page',
      entry: 'src/sub/other/main.js'
    }
  },
  // expose to template
  data: {
    title: 'Home Page',
  }
}
```

The `key` of `pages` and the URL are associated with the following rules: `http://127.0.0.1/${key}.html`, where `key` supports multi-level paths.

After starting the dev server, browse:

* http://127.0.0.1/index.html : Use `public/index.html` as the template and `src/main.js` as the entry.
* http://127.0.0.1/app.html : Use `public/index.html` as the template and `src/app/main.js` as the entry.
* http://127.0.0.1/sub/other.html : Use `public/index.html` as the template and `src/sub/other/main.js` as the entry.

The URL structure after the project is constructed is the same as that during development:

* http://domain.com/index.html
* http://domain.com/app.html
* http://domain.com/sub/other.html

For MPA, The `key` of `pages` and the `build.rollupOptions.input` are associated with the following rules:

```js
{
  build: {
    rollupOptions: {
      input: {
        app1: path.resolve(__dirname, `index.html`), // The file name is associated with `pages.index` after removing the extension.
        app1: path.resolve(__dirname, `app.html`), // The file name is associated with `pages.app` after removing the extension.
        app2: path.resolve(__dirname, `sub/other.html`), // The file name is associated with `pages['sub/other']` after removing the extension.
      }
    }
  }
}
```
