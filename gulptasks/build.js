import {execSync, spawn} from 'child_process';
import path from 'path';
import rmdir from 'rmdir';
import findup from 'findup-sync';
import through2 from 'through2';
import gulp from 'gulp';
import gulputil from 'gulp-util';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import babel from 'gulp-babel';
import encapsulateCss from 'gulp-encapsulate-css';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import concatCss from 'gulp-concat-css';
import autoprefixer from 'gulp-autoprefixer';
import webpack from 'webpack-stream';
import {
  MODULE_PREFIX,
  ENTRY_MODULE,
  SRC_DIR,
  SERVER_DIR,
  PUBLIC_DIR,
  MODULES_BUILD_DIR,
  DEPLOY_DIR
} from './build-constants.js';

/*******************************************************************************
*  Tests if the file's extension is .js or .jsx
* @param file
* @returns {boolean}
*******************************************************************************/
function isJsFile(file) {
  const extname = path.extname(file.path);
  return extname === '.js' || extname === '.jsx';
}

/*******************************************************************************
* Tests if the file's extension is .scss
* @param file
* @returns {boolean}
*******************************************************************************/
function isScssFile(file) {
  const extname = path.extname(file.path);
  return extname === '.scss';
}

/*******************************************************************************
* Tests if te file's name is `package.json`
* @param file
* @returns {boolean}
*******************************************************************************/
function isPackageJsonFile(file) {
  const filename = path.basename(file.path);
  return filename === 'package.json';
}

/*******************************************************************************
* Gulp plugin to update a custom module's package.json in two ways:
*
* 1. if the package's `main` field points to a `.jsx` file rename it to a `.js`
*     extension to match Babel's output
*
* 2. update any dependencies on custom modules to point locally where those
*     modules are built, used by npm during the install step
*******************************************************************************/
function updateModulesPackages() {
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gulputil.PluginError('convertPackageMain', 'Streaming not supported'));
      return;
    }

    const pkg = JSON.parse(file.contents.toString());

    // Update package.main to point at babel-renamed files
    if (pkg.main && path.extname(pkg.main) === '.jsx') {
      pkg.main = pkg.main.substr(0, pkg.main.length - 1);
    }

    // Update dependencies to load shrine modules locally
    pkg.dependencies = Object.keys(pkg.dependencies || {}).reduce(
      (dependencies, dependencyName) => {
        if (dependencyName.indexOf(`${MODULE_PREFIX}/`) === 0) {
          dependencies[dependencyName] = path.resolve(path.join(MODULES_BUILD_DIR, dependencyName));
        } else {
          dependencies[dependencyName] = pkg.dependencies[dependencyName];
        }

        return dependencies;
      },
      {}
    );

    file.contents = new Buffer(JSON.stringify(pkg, null, 2));
    this.push(file);

    cb();
  });
}

function rebaseModuleStyles() {
  const RESOLVED_MODULES_BUILD_DIR = path.resolve(MODULES_BUILD_DIR);
  const moduleRegex = new RegExp(`${MODULE_PREFIX}\/`, 'g');

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('rebaseModuleStyles', 'Streaming not supported'));
      return;
    }

    const fileContents = file.contents.toString();
    const rebasedContents = fileContents.replace(moduleRegex, `${RESOLVED_MODULES_BUILD_DIR}${path.sep}${MODULE_PREFIX}${path.sep}`);

    file.contents = new Buffer(rebasedContents);
    this.push(file);

    cb();
  });
}

const packageRebasing = new RegExp(`^.*?(\\${path.sep}|$)`);
gulp.task('transpile-src', () =>
  gulp.src(path.join(SRC_DIR, '**', '*'), {nodir: true})
    .pipe(gulpif(isJsFile, babel()))
    .pipe(gulpif(isScssFile, rebaseModuleStyles()))
    .pipe(gulpif(isPackageJsonFile, updateModulesPackages()))
    .pipe(rename((filepath) => {
      const pkgLocation = findup('package.json', {cwd: path.join(SRC_DIR, filepath.dirname)});
      const {name: moduleName} = require(pkgLocation);
      filepath.dirname = path.join(moduleName, filepath.dirname.replace(packageRebasing, ''));
    }))
    .pipe(gulp.dest(MODULES_BUILD_DIR))
);

gulp.task('transpile-helpers', () =>
  gulp.src(['server/helpers/*.js', 'server/helpers/*.jsx'])
    .pipe(babel())
    .pipe(gulp.dest(path.join(PUBLIC_DIR, 'helpers')))
);

/*******************************************************************************
* Copies all the modules
*******************************************************************************/
gulp.task('copy-entry-module', ['transpile-src'], () =>
  gulp.src(path.join(MODULES_BUILD_DIR, ENTRY_MODULE, '**', '*'))
    .pipe(gulp.dest(DEPLOY_DIR))
);

/*******************************************************************************
* Installs dependencies for each component
*******************************************************************************/
gulp.task('install-dependencies', ['copy-entry-module'], (cb) => {
  // remove the existing `node_modules/MODULE_PREFIX` directory to make way for changes
  rmdir(path.join(DEPLOY_DIR, 'node_modules', MODULE_PREFIX), () => {
    // install all dependencies, custom and external
    execSync('npm install', {cwd: DEPLOY_DIR});
    cb();
  });
});

/*******************************************************************************
* Build JS
*******************************************************************************/
gulp.task('build-js', ['install-dependencies'], () =>
  gulp.src(path.join(DEPLOY_DIR, 'client.js'))
    .pipe(webpack(require('../webpack.config')))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(path.join(PUBLIC_DIR)))
);

/*******************************************************************************
* Build SCSS - Sourcemaps, Encapsulate & Concat
*******************************************************************************/
gulp.task('build-scss', ['install-dependencies'], () =>
  gulp.src([
      path.join(DEPLOY_DIR, '**', '!_*.scss'),
      path.join(DEPLOY_DIR, '**', 'global.scss'),
      path.join(DEPLOY_DIR, '**', '*.scss')
    ])
    // .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    // .pipe(sourcemaps.write())
    .pipe(encapsulateCss({optKey: 'encapsulateOptOut'}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest(path.join(PUBLIC_DIR)))
);


/*******************************************************************************
* Copies assets folder to the public directory
*******************************************************************************/
gulp.task('copy-assets', () =>
  gulp.src(path.join('assets', '**', '*'))
    .pipe(gulp.dest(PUBLIC_DIR))
);

/*******************************************************************************
* Base build
*******************************************************************************/
gulp.task('build', ['build-js', 'build-scss', 'copy-assets', 'transpile-helpers']);

/*******************************************************************************
* Start Server
*******************************************************************************/
gulp.task('server', ['build'], () => {
  spawn(
    'node',
    ['server'],
    {
      cwd: SERVER_DIR,
      stdio: 'inherit'
    }
  );
});
