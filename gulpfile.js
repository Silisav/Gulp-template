var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('browserSync', function() {
  // Starts the local web server
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
})

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass({
      // We can always comment out any unnecessary bootstrap css in \src\scss\_bootstrap.css
      includePaths: 'node_modules/bootstrap-sass/assets/stylesheets'
    }))
    .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
    }))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('bootstrapJS', function() {
  return gulp.src([
    // Simply comment out any of the following bootstrap js that is not needed
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/transition.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/alert.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/carousel.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/tooltip.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/popover.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/scrollspy.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/tab.js',
    'node_modules/bootstrap-sass/assets/javascripts/bootstrap/affix.js'
  ])
    .pipe(concat('bootstrap.js'))
    .pipe(gulp.dest('src/js/lib/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'sass', 'bootstrapJS'], function (){
  gulp.watch('src/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', ['bootstrapJS']);
});

gulp.task('useref', function() {
  return gulp.src('src/*.html')
    .pipe(useref())
    // Minifies and concatenates only if it's a js files (see html file)
    .pipe(gulpIf('*.js', uglify()))
    // Minifies and concatenates only if it's a css files (see html file)
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|JPG|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
});

gulp.task('build', function (callback) {
  // Creates the production code
  runSequence(
    'clean:dist',
    'sass',
    'bootstrapJS',
    ['useref', 'images', 'fonts'],
    callback
  )
});

gulp.task('default', function (callback) {
  // Starts the server for development work
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
});
