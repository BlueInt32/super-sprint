var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
//var babelify = require('babelify');

function compile(watch) {
  var bundler = watchify(browserify('./js/Game.js', { debug: true })
  //  .transform(babelify.configure({
  //  // Optional ignore regex - if any filenames **do** match this regex then
  //  // they aren't compiled
  //  ignore: /(jquery.signalR.*\.js)|(Box2dWeb.*\.js)|(pixi.*\.js)|(Stats\.js)/,
  //}))
  );

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .on('end', function(){ console.log("Done");})
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {

      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
