var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');

gulp.task('default', function() {
    return gulp.src('./runner/src/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(concat('./runner/dist/perfix.min.js'))
        .pipe(uglify({outSourceMap: false}))
        .pipe(gulp.dest('./'));
});