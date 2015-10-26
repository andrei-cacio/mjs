'use strict';

require('jshint-stylish');

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require('gulp-jshint'),
    header = require('gulp-header'),
    browserify = require('browserify'),
    webserver = require('gulp-webserver'),
    rename = require('gulp-rename'),
    pkg = require('./package.json'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    IW = {};

IW.banner = [
  '/**',
  ' ** <%= pkg.name %> - <%= pkg.description %>',
  ' ** @author <%= pkg.author %>',
  ' ** @version v<%= pkg.version %>',
  ' **/',
  ''
].join('\n');

IW._paths = {
    main: './src/index.js',
    js: './src/**/*.js',
    demo: './demo',
    demoJS: './demo/js'
};
IW.minifiedName = 'ironwing.min.js';

gulp.task('build', ['lint'], function() {
  var b = browserify({
    entries: IW._paths.main,
    debug: true
  });

  return b.bundle()
         .pipe(source('app.min.js'))
         .pipe(buffer())
         .pipe(uglify({
          mangle: false
         }))
        .pipe(header(IW.banner, { pkg: pkg }))
        .pipe(rename('ironwing.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', ['lint'], function() {
  var b = browserify({
    entries: IW._paths.main,
    debug: true
  }).transform(babelify);

  return b.bundle()
         .pipe(source('app.min.js'))
         .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true, debug: true}))
        // .pipe(uglify())
        .pipe(header(IW.banner, { pkg: pkg }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(IW._paths.demoJS));
});

gulp.task('lint', function() {
    return gulp.src(IW._paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('webserver', function() {
  gulp.src(IW._paths.demo)
    .pipe(webserver({
      open: true
    }));
});

gulp.task('default', ['webserver'], function() {
    gulp.watch(IW._paths.js, ['scripts']);
});
