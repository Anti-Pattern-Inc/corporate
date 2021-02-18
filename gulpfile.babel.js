/**
 * Settings
 * Turn on/off build features
 */

const settings = {
  clean: true,
  scripts: true,
  polyfills: false,
  styles: true,
  svgs: true,
  copy: true,
  reload: true
};


/**
 * Paths to project folders
 */
const paths = {
  input: 'src/',
  output: 'docs/',
  scripts: {
    input: 'src/js/*',
    polyfills: '.polyfill.js',
    output: 'docs/js/'
  },
  htmls: {
    input: ['src/pug/**/*.pug', "!src/pug/**/_*.pug"],
    output: 'docs/'
  },
  markdowns: {
    input: ['src/_posts/**/*.md'],
    output: 'docs/',
    template: 'src/_posts/template.pug',
    pageTemplate: 'src/_posts/page_template.pug'
  },
  styles: {
    input: 'src/scss/**/*.{scss,sass}',
    output: 'docs/css/'
  },
  svgs: {
    input: 'src/svg/*.svg',
    output: 'docs/svg/'
  },
  copy: {
    input: 'src/copy/**/*',
    output: 'docs/'
  },
  json: 'src/_data/',
  reload: './docs/'
};


/**
 * Gulp Packages
 */

// General
import {src, dest, watch, series, parallel} from 'gulp'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()


import del from 'del'
import flatmap from 'gulp-flatmap'
import lazypipe from 'lazypipe'
import gulpPug from 'gulp-pug'
import rename from 'gulp-rename'
import eventStream from 'event-stream'
import data from 'gulp-data'

// Scripts
import concat from 'gulp-concat'
import uglify from 'gulp-terser'


// Styles
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import prefix from 'autoprefixer'
import minify from 'cssnano'

// SVGs
import svgmin from 'gulp-svgmin'

// BrowserSync
import browserSync from 'browser-sync'

// Util
import fs from 'fs'
import fm from "front-matter";
import path from 'path';

/**
 * Util Method
 */
const getFiles = (dir) =>
  fs.readdirSync(dir, {withFileTypes: true}).flatMap(dirent =>
    dirent.isFile() ? [`${dir}/${dirent.name}`] : getFiles(`${dir}/${dirent.name}`)
  )

const arrayChunk = ([...array], size = 1) => {
  return array.reduce((acc, value, index) => index % size ? acc : [...acc, array.slice(index, index + size)], []);
}

// json 読み込み
const locals = {
  'site': JSON.parse(fs.readFileSync(paths.json + 'site.json'))
}
// mdファイル読み込み
const listMdFiles = getFiles('src/_posts').filter(md => !!md.match(/.md$/))
// mdファイルからメタのリスト作成
const metas = listMdFiles.map(mdDir => {
  const files = fs.readFileSync(mdDir, 'utf-8');
  const content = fm(files);
  const regexp = /(src\/_posts\/)(.+)(.md)/;

  const link = `/${mdDir.match(regexp)[2]}`;

  // front-matterの情報をデータとして返します
  return Object.assign({
    link: link,
  },content.attributes)
}).sort((a, b) => {
  const regexp = /(\/.*\/)(.*)/
  return parseInt(b.link.match(regexp)[2]) - parseInt(a.link.match(regexp)[2])
})
const postTypes = Array.from(new Set(metas.map(meta => {
  return meta.postType
})))
const formattedMetas = postTypes.flatMap((postType, index) => {
  return {
    [postType]: metas.map((meta) => {
      return Object.assign( meta)
    }).filter(meta => meta.postType === postType)
  }
})

/**
 * Gulp Tasks
 */

// Remove pre-existing content from output folders
const cleanDist = (done) => {

  // Make sure this feature is activated before running
  if (!settings.clean) return done();

  // Clean the dist folder
  del.sync([
    paths.output
  ]);

  // Signal completion
  return done();
};

// Repeated JavaScript tasks
const jsTasks = lazypipe()
  .pipe(dest, paths.scripts.output)
  .pipe(rename, {suffix: '.min'})
  .pipe(uglify)
  .pipe(dest, paths.scripts.output);

const buildScripts = (done) => {

  if (!settings.scripts) return done();

  return src(paths.scripts.input)
    .pipe(flatmap(function (stream, file) {

      if (file.isDirectory()) {

        let suffix = '';

        if (settings.polyfills) {

          suffix = '.polyfills';

          src([file.path + '/*.js', '!' + file.path + '/*' + paths.scripts.polyfills])
            .pipe(concat(file.relative + '.js'))
            .pipe(jsTasks());

        }

        src(file.path + '/*.js')
          .pipe(concat(file.relative + suffix + '.js'))
          .pipe(jsTasks());

        return stream;

      }

      return stream.pipe(jsTasks());

    }));

};

const buildHtmls = () => {
  return src(paths.htmls.input)
    .pipe(data(function (file) {
      locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
    }))
    .pipe(gulpPug({pretty: true}))
    .pipe(dest(paths.htmls.output));
}


const buildMarkdown = (done) => {

  eventStream.merge(
    listMdFiles.map(mdDir => {
      return src(paths.markdowns.template)
        .pipe(data(function (file) {
          locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
          return locals;
        }))
        .pipe(data((file) => {
          let markdown = fs.readFileSync(mdDir, 'utf-8');
          const content = fm(String(markdown));

          markdown = Buffer.from(content.body);

          const mdData = md.render(String(markdown))
          return {
            'mdData': mdData.split('\n').join('')
          }
        }))
        .pipe(data((file) => {
          const files = fs.readFileSync(mdDir, 'utf-8');
          const content = fm(files);
          // front-matterの情報をデータとして返します
          return {meta: content.attributes};
        }))
        .pipe(gulpPug({
          pretty: true,
        }))
        .pipe(rename((path) => {
          const dirName = mdDir.match(/src\/_posts\/(.*).md/)[1]

          return {
            dirname: dirName,
            basename: 'index',
            extname: '.html'
          }
        }))
        .pipe(dest((vinyl) => {
          return paths.markdowns.output
        }))
    })
  )
  done()
}

const buildPagination = (done) => {
  const pageArray = formattedMetas.map(obj => {
    return arrayChunk(obj[Object.keys(obj)[0]], 10).map(meta => {
      return {
        key: meta[0].postType,
        meta
      }
    })
  })

  eventStream.merge(
    pageArray.map((pageDetail) => {
      return pageDetail.map((meta, index) => {
        return src(paths.markdowns.pageTemplate)
          .pipe(data(function (file) {
            locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
            return locals;
          }))
          .pipe(data(() => {
            return {
              'articleList': meta,
              'total': pageDetail.length,
              'current': index + 1,
            }
          }))
          .pipe(gulpPug({
            pretty: true,
          }))
          .pipe(rename(() => {
            const dirName = meta.key === "index" ? 'paged' : `${meta.key}/paged`

            return {
              dirname: `${dirName}/${index + 1}`,
              basename: 'index',
              extname: '.html'
            }
          }))
          .pipe(dest(() => {
            return paths.markdowns.output
          }))
          .pipe(rename(() => {
            if (index !== 0) return

            const dirName = meta.key === "index" ? '' : `${meta.key}`

            return {
              dirname: `${dirName}`,
              basename: 'index',
              extname: '.html'
            }
          }))
          .pipe(dest(() => {
            return paths.markdowns.output
          }))
      })
    }).flatMap(ary => ary)
  )
  done()
}

// Process, lint, and minify Sass files
const buildStyles = (done) => {

  // Make sure this feature is activated before running
  if (!settings.styles) return done();

  // Run tasks on all Sass files
  return src(paths.styles.input)
    .pipe(sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .pipe(postcss([
      prefix({
        cascade: true,
        remove: true
      })
    ]))
    .pipe(dest(paths.styles.output))
    .pipe(rename({suffix: '.min'}))
    .pipe(postcss([
      minify({
        discardComments: {
          removeAll: true
        }
      })
    ]))
    .pipe(dest(paths.styles.output));

};

// Optimize SVG files
const buildSVGs = (done) => {

  // Make sure this feature is activated before running
  if (!settings.svgs) return done();

  // Optimize SVG files
  return src(paths.svgs.input)
    .pipe(svgmin())
    .pipe(dest(paths.svgs.output));

};

// Copy static files into output folder
const copyFiles = (done) => {

  // Make sure this feature is activated before running
  if (!settings.copy) return done();

  // Copy static files
  return src(paths.copy.input)
    .pipe(dest(paths.copy.output));

};

// Watch for changes to the src directory
const startServer = (done) => {

  // Make sure this feature is activated before running
  if (!settings.reload) return done();

  // Initialize BrowserSync
  browserSync.init({
    server: {
      baseDir: paths.reload
    }
  });

  // Signal completion
  done();

};

// Reload the browser when files change
const reloadBrowser = (done) => {
  if (!settings.reload) return done();
  browserSync.reload();
  done();
};

// Watch for changes
const watchSource = (done) => {
  watch(paths.input, series(exports.default, reloadBrowser));
  done();
};

/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
  cleanDist,
  parallel(
    buildScripts,
    buildStyles,
    buildHtmls,
    buildSVGs,
    copyFiles,
    buildMarkdown,
    buildPagination
  )
);

// Watch and reload
// gulp watch
exports.watch = series(
  exports.default,
  startServer,
  watchSource
);
