const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', function() {
	return gulp.src('./public/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./public/css'));
});


// Watch any changes in the src directory
gulp.task('watch', function() {
	gulp.watch('./public/scss/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);