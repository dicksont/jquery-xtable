var gulp = require('gulp');
var bump = require('gulp-bump');

gulp.task('bump', function() {
  var stream = gulp.src([ "package.json", "bower.json" ])
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));

  return stream;
});

gulp.task('bump+', function() {
  var stream = gulp.src([ "package.json", "bower.json" ])
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));

  return stream;
});
