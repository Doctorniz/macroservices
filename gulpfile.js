var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build1', function () {
    return browserify({entries: './app/react/pollForm.jsx', extensions: ['.jsx'], debug: true})
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('pollForm.js'))
        .pipe(gulp.dest('client/js'));
});

gulp.task('build2', function () {
    return browserify({entries: './app/d3/pollResults.jsx', extensions: ['.jsx'], debug: true})
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('pollResults.js'))
        .pipe(gulp.dest('client/js'));
});


gulp.task('watch', ['build1', 'build2'], function () {
    gulp.watch('*.jsx', ['build1', 'build2']);
});

gulp.task('default', ['watch']);