var gulp = require('gulp');
var concat = require('gulp-concat');
//var fs = require('fs');
//var extend = require('extend');
var basename = require('path').basename;
//var resolve = require('path').resolve;
var dir = require('path').dirname;
var strip = require('gulp-strip-comments');
var clean = require('gulp-clean');
var bump = require('gulp-bump');
var evstr = require('event-stream');
var symlink = require('gulp-symlink');

var srcPath = {}, buildPath = {}, distPath = {}, buildVersion = {}, meta = {};


meta.package = "package.json";
meta.bower = 'bower.json';

var build = require(meta.package);

srcPath.tablejs = 'src/table.js';
srcPath.quadjs = 'src/quad.js';
srcPath.css = 'src/table.css';
srcPath.license = 'LICENSE';

buildPath.js = 'build/jquery-xtable-' + build.version + '.js';
buildPath.css = 'build/jquery-xtable-' + build.version + '.css';

distPath.dir = 'dist/';
distPath.js = 'dist/jquery-xtable-' + build.version + '.js';
distPath.css = 'dist/jquery-xtable-' + build.version + '.css';
distPath.jslink = 'dist/jquery-xtable.js';
distPath.csslink = 'dist/jquery-xtable.css';

gulp.task('buildjs', function() {
  return evstr.merge(gulp.src(srcPath.quadjs), gulp.src(srcPath.tablejs).pipe(strip()))
      .pipe(concat(basename(buildPath.js)))
      .pipe(gulp.dest(dir(buildPath.js)));
});

gulp.task('css', function() {
  return gulp.src(srcPath.css)
    .pipe(concat(basename(buildPath.css)))
    .pipe(gulp.dest(dir(buildPath.css)));
})

gulp.task('bump', function() {
  var stream = gulp.src([ meta.bower, meta.package ])
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));

  return stream;
});

gulp.task('distpatch', ['buildjs', 'css'], function() {
  return gulp.src([buildPath.js, buildPath.css])
    .pipe(gulp.dest(distPath.dir));
});

gulp.task('mkpatch', ['distpatch'], function() {
  return gulp.src([distPath.js, distPath.css])
    .pipe(symlink([distPath.jslink, distPath.csslink], { force: true }));
});

gulp.task('clean', function() {
  return gulp.src([ distPath.dir, dir(buildPath.js), dir(buildPath.css) ])
    .pipe(clean());
})

gulp.task('watch', function() {
  gulp.watch('src/**', ['mkpatch']);
});
