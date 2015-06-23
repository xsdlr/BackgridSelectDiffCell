var gulp = require('gulp');
var concat_js = require('gulp-concat');
var concat_css = require('gulp-concat-css');
var uglify = require('gulp-uglify');
var minify_css = require('gulp-minify-css');
var bower = require('gulp-bower');
var bower_files = require('main-bower-files');
var del = require('del');

var paths = {
	lib: {
		js: './lib/js',
		css: './lib/css'
	},
	build: {
		js: './build/js',
		css: './build/css'
	}
};
gulp.task('clean', function(cb) {
	del(['build'], cb);
});

gulp.task('init-bower', function(cb){
	bower();
	cb();
});

gulp.task('init-js', ['init-bower'], function(cb){
	gulp.src(bower_files({
		filter: /\.js$/i,
	})).pipe(gulp.dest(paths.lib.js));
	cb();
});

gulp.task('init-css', ['init-bower'], function(cb){
	gulp.src(bower_files({
		filter: /\.css$/i,
	})).pipe(gulp.dest(paths.lib.css));
	cb();
});

gulp.task('init', ['init-js', 'init-css']);

gulp.task('build-js', ['init'], function(){
	return gulp.src(paths.lib.js + '/*.js')
		.pipe(concat_js('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.build.js));
});

gulp.task('build-css', ['init'], function(){
	return gulp.src(paths.lib.css + '/*.css')
		.pipe(concat_css('app.css'))
		.pipe(minify_css())
		.pipe(gulp.dest(paths.build.css));
});

gulp.task('build', ['build-js', 'build-css']);