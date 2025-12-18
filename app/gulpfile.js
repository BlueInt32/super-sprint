var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');
//var babelify = require('babelify');

function compile(watch) {
  var opts = { debug: true };
  if (watch) {
    opts.cache = {};
    opts.packageCache = {};
  }
  var bundler = browserify('./js/Game.js', opts);
  if (watch) {
    bundler = watchify(bundler);
  }
  //  bundler.transform(babelify.configure({
  //  // Optional ignore regex - if any filenames **do** match this regex then
  //  // they aren't compiled
  //  ignore: /(jquery.signalR.*\.js)|(Box2dWeb.*\.js)|(pixi.*\.js)|(Stats\.js)/,
  //}));

  function rebundle(cb) {
    var stream = bundler.bundle()
      .on('error', function(err) {
        console.error(err);
        if (cb) cb(err);
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));

    if (cb) {
      stream.on('end', function() {
        console.log("Build complete!");
        cb();
      });
    } else {
      stream.on('end', function() {
        console.log("Build complete!");
      });
    }

    return stream;
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
    return rebundle();
  } else {
    return rebundle;
  }
}

function watchTask() {
  return compile(true);
}

gulp.task('build', function(cb) {
  return compile(false)(cb);
});

gulp.task('watch', watchTask);

gulp.task('default', gulp.series('build'));
