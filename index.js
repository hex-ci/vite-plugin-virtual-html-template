const path = require('path');
const { promises: fs } = require('fs');
const { template } = require('lodash');

const resolve = (p) => path.resolve(process.cwd(), p);
const relative = (p) => path.relative(process.cwd(), p);

const readHtmlTemplate = async (templatePath) => {
  return await fs.readFile(templatePath, { encoding: 'utf8' })
};

const getHtmlContent = async (payload) => {
  const { templatePath, pageTitle, pageEntry, data } = payload
  let content = ''

  try {
    content = await readHtmlTemplate(templatePath);
  }
  catch (e) {
    console.error(e)
  }

  if (pageEntry) {
    content = content.replace(
      '</body>',
      `  <script type="module" src="/${pageEntry}"></script>\n</body>`
    )
  }

  const compiled = template(content)
  const context = {
    title: pageTitle,
    ...data
  }
  const html = compiled({
    ...context
  })

  return html
}

const virtualHtmlTemplatePlugin = (options) => {
  return {
    name: 'vite-plugin-virtual-html-template',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req._parsedUrl.pathname;
        let pageName;

        if (url === '/') {
          pageName = 'index';
        }
        else {
          pageName = path.posix.join(path.dirname(url), path.basename(url, '.html')).slice(1);
        }

        const page = options?.pages?.[pageName];

        if (!page) {
          return next();
        }

        const templateOption = page.template;
        const templatePath = templateOption ? resolve(templateOption) : resolve('public/index.html');

        const content = await getHtmlContent({
          templatePath,
          pageEntry: page.entry,
          pageTitle: page.title || 'Home Page',
          data: options.data
        });

        res.end(content)
      })
    },

    resolveId(id) {
      if (path.extname(id) === '.html') {
        const relativeId = relative(id);
        const pageName = path.posix.join(path.dirname(relativeId), path.basename(relativeId, '.html'));

        const page = options?.pages?.[pageName];
        if (page) {
          return id;
        }
      }

      return null;
    },

    load(id) {
      if (path.extname(id) === '.html') {
        const relativeId = relative(id);
        const pageName = path.posix.join(path.dirname(relativeId), path.basename(relativeId, '.html'));

        const page = options?.pages?.[pageName];
        if (page) {
          const templateOption = page.template;
          const templatePath = templateOption ? resolve(templateOption) : resolve('public/index.html');

          return getHtmlContent({
            templatePath,
            pageEntry: page.entry || 'main',
            pageTitle: page.title || 'Home Page',
            data: options.data
          });
        }
      }

      return null;
    }
  }
}

module.exports = virtualHtmlTemplatePlugin;
