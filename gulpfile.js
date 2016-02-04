var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var del = require('del');
var bourbon = require('bourbon').includePaths;
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var debowerify = require('debowerify');
var babelify = require('babelify');
var cssnext = require('postcss-cssnext');
var inlineSvg = require('postcss-inline-svg');
var $ = require('gulp-load-plugins')();

var config = require('./config.json');
var projectName = path.basename(__dirname);

gulp.task('styles', function () {
  var svgPrefix = 'data:image/svg+xml;charset=utf-8,';

  return gulp.src('client/main.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      outputStyle: 'expanded',/*'compressed',*/
      precision: 10,
      includePaths: ['bower_components', bourbon]
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({
        features: {
          colorRgba: false
        }
      }),
      inlineSvg({
        path: 'bower_components/ftc-icons/build',
        transform: function(data, path, opts) {
          return svgPrefix + encodeURIComponent(data);
        }
      })
    ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('scripts', function() {
  var b = browserify({
    entries: 'client/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [debowerify, babelify],
    plugin: [watchify]
  });

  b.on('update', bundle);
  b.on('log', $.util.log);

  bundle();

  function bundle(ids) {
    $.util.log('Compiling JS...');
    if (ids) {
      console.log('Chnaged Files:\n' + ids);
    }   
    return b.bundle()
      .on('error', function(err) {
        $.util.log(err.message);
        browserSync.notify('Browerify Error!')
        this.emit('end')
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe(browserSync.stream({once:true}));
  }
});

gulp.task('js', function() {
  var b = browserify({
    entries: 'client/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [debowerify, babelify]
  });

  return b.bundle()
    .on('error', function(err) {
      $.util.log(err.message);
      browserSync.notify('Browerify Error!')
      this.emit('end')
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('lint', function() {
  return gulp.src('client/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());  
});

gulp.task('serve', ['styles', 'scripts'], function () {
  browserSync.init({
    server: {
      baseDir: ['.tmp', 'client'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'client/*.html',
    'client/styles/*.css',
    'client/scripts/*.js',
    'client/images/**/*'
  ]).on('change', reload);

  gulp.watch(['client/**/*.scss'], ['styles']);
  gulp.watch(['client/**/*.js'], ['scripts'])
});


gulp.task('serve:dist', function() {
  browserSync.init({
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('html', ['styles', 'js'], function() {
  return gulp.src(config.src.html)
    .pipe($.useref({searchPath: ['.', '.tmp', 'client']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.smoosher({
      base: 'client'
    })))
    .pipe($.if('*.html', $.htmlReplace(config.staticAssets)))
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', function () {
  return gulp.src([
    'client/*.*',
    '!client/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src(config.src.images)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', $.sequence('clean', ['html', 'images']));



//Go test server
gulp.task('copy:test', function() {
  return gulp.src('dist/**/*')
    .pipe(gulp.dest(config.test.dest + projectName));
});
gulp.task('dist:test', $.sequence('build', 'copy:test'));



//Go Online. Run `gulp dist`
gulp.task('deploy:asset', function() {
  return gulp.src(['dist/**/*', '!dist/*.html'])
    .pipe(gulp.dest(config.deploy.assetsDest + projectName))
});

gulp.task('deploy:html', function() {
  return gulp.src(config.dist.html)
    .pipe($.prefix(config.prefixUrl + projectName))
    .pipe($.rename({basename: projectName, extname: '.html'}))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(config.deploy.htmlDest));
});


gulp.task('deploy', $.sequence('build', ['deploy:assets', 'deploy:html']));
