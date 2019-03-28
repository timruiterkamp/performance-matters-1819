const gulp = require('gulp')
const uglify = require('gulp-uglify')
const clean = require('gulp-clean')
const concat = require('gulp-concat')

gulp.task('clean', function() {
  return gulp.src('dist/*', { read: false }).pipe(clean())
})

gulp.task('minifyJS', function() {
  return gulp
    .src('./src/scripts/client/*.js') // path to your files
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/'))
})

gulp.task('move', function() {
  gulp.src('manifest.json', { base: './' }).pipe(gulp.dest('dist/'))
  gulp.src('./service-worker.js', { base: './' }).pipe(gulp.dest('dist/'))
  gulp.src('./src/icons/', { base: './' }).pipe(gulp.dest('dist/icons/'))
})

if (process.env.NODE_ENV !== 'production') {
  gulp.watch(['scripts/**/*.js'], gulp.series('minifyJS'))
}
