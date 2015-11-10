var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

var browserification = function () {
  gulp.src('./js/game.js')
    .pipe(browserify({
      debug: !gulp.env.production
    }))
    .pipe(gulp.dest('./build/js'));
};


gulp.task('default', function () {
  browserification();
});

gulp.task('watch', function(){
  browserification();
  watch('js/**/*.js', function () {
    browserification();
  });
})