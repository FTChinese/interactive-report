'use strict'
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
const merge = require('merge-stream');
const bourbon = require('bourbon').includePaths;

/*const gutil           = require('gulp-util');
const rimraf          = require('rimraf');
const through         = require('through2');*/

const path            = require('path');
const $               = gulpLoadPlugins();
const reload          = browserSync.reload;

const config          = require('./config.json');

const projectName     = path.basename(__dirname);

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      scss: {
        block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
        detect: {
          css: /@import\s['"](.+css)['"]/gi,
          sass: /@import\s['"](.+sass)['"]/gi,
          scss: /@import\s['"](.+scss)['"]/gi
        },
        replace: {
          css: '@import "{{filePath}}";',
          sass: '@import "{{filePath}}";',
          scss: '@import "{{filePath}}";'
        }
      }
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('styles', () => {
  return gulp.src(config.src.scss)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: [bourbon]
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

/*gulp.task('scripts', function() {
  return gulp.src('interactive-assets/js/*.js')
    .pipe(gulp.dest('.tmp/scripts'));
});*/

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'/*, 'scripts'*/], () => {
  return gulp.src(config.src.html)
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    /*.pipe($.rev())*/
    .pipe($.if('*.html', $.smoosher({
      base: 'app'
    })))
    .pipe($.if('*.html', $.htmlReplace(config.staticAssets)))
    /*.pipe($.revReplace())*/
    .pipe(gulp.dest('dist'))
    /*.pipe($.rev.manifest())
    .pipe(gulp.dest('dist'))*/;
});

gulp.task('images', () => {
  return gulp.src(config.src.images)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('serve', ['styles'/*, 'scripts'*/], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/styles/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', reload);

  gulp.watch(['app/styles/**/*.scss'], ['styles']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch('app/icons/*', ['sprite']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('build', ['lint', 'html', 'images', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', $.sequence('clean', 'build'));

//Go test server
gulp.task('copy:test', function() {
  return gulp.src('dist/**/*')
    .pipe(gulp.dest(config.test.dest + projectName));
});
gulp.task('deploy:test', $.sequence('clean', 'build', 'copy:test'));

//Go Online. Run `gulp dist`
gulp.task('assets:deploy', function() {
  return gulp.src(['dist/**/*', '!dist/*.html'])
    .pipe(gulp.dest(config.deploy.assetsDest + projectName))
});

gulp.task('html:deploy', function() {
  return gulp.src(config.dist.html)
    .pipe($.prefix(config.prefixUrl + projectName))
    .pipe($.rename({basename: projectName, extname: '.html'}))
    .pipe($.minifyHtml())
    .pipe(gulp.dest(config.deploy.htmlDest));
});

/*function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

gulp.task('outdated', function() {
  let cssPath = config.deploy.assetsDest + projectName + '/styles/bundle-*.css';
  let jsPath = config.deploy.assetsDest + projectName + '/scripts/bundle-*.js';

    gulp.src([cssPath, jsPath], {read: false})
        .pipe( $.revOutdated(1) ) // leave 1 latest asset file
        .pipe( cleaner() );

    return;
});*/

gulp.task('deploy', $.sequence('clean', 'build', ['assets:deploy', 'html:deploy']));
