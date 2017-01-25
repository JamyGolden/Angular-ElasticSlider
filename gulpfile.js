var gulp = require('gulp');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');
var del = require('del');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pkg = require('./package.json');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');

// Develop build
// ============================================================================
gulp.task('sass', function() {
    return gulp.src('src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('elasticslider.css'))
        .pipe(gulp.dest('src/css'));
});

gulp.task('js', function () {
    return gulp.src('src/angular-elasticslider.js');
});

gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/angular-elasticslider.js', ['js']);
});

gulp.task('webserver', () => {
  return gulp.src('./src')
      .pipe(webserver({
          livereload: true,
          fallback: 'demo.html',
          port: 5000,
          open: true,
      }));
});

// Dist build
// ============================================================================
gulp.task('dist:clean', function (cb) {
    return del(['dist', 'temp'], cb);
});

gulp.task('dist:copyJs', ['dist:clean'], function () {
    return gulp.src('src/angular-elasticslider.js')
        .pipe(gulp.dest('temp'))
});

gulp.task('dist:copyView', ['dist:clean'], function () {
    var TEMPLATE_HEADER = 'angular.module("ngElasticSlider")';
    TEMPLATE_HEADER += '.run(["$templateCache", function($templateCache) {';

    // Angular $templateCache
    return gulp.src('src/angular-elasticslider.html')
      .pipe(templateCache({
          templateHeader: TEMPLATE_HEADER
      }))
      .pipe(gulp.dest('temp'));
});

gulp.task('dist:copyJs', ['dist:clean'], function () {
    return gulp.src('src/angular-elasticslider.js')
        .pipe(gulp.dest('temp'))
});

gulp.task('dist:sass', function() {
    return gulp.src('src/scss/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(rename('elasticslider.css'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('dist:build', ['dist:copyJs', 'dist:copyView'], function () {
    return gulp.src('temp/*.js')
        .pipe(concat('angular-elasticslider.min.js'))
        .pipe(uglify())
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('dist'))
});

// Tasks
// ============================================================================
gulp.task('serve', ['sass', 'js', 'webserver', 'watch']);
gulp.task('default', ['dist:build', 'dist:sass'], function(cb) {
    return del(['temp'], cb);
});
