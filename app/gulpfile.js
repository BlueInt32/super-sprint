var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');
var babelify = require('babelify')
var gutil = require('gulp-util')
var chalk = require('chalk')

var browserification = function () {
  gulp.src('./js/Game.js')
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
});

gulp.task('batard', function(){

})