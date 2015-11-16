var gulp                = require('gulp'),
    path                = require('path'),
    htmlmin             = require('gulp-htmlmin'),
    less                = require('gulp-less'),
    autoprefixer        = require('gulp-autoprefixer'),
    minifyCSS           = require('gulp-minify-css'),
    concat              = require('gulp-concat'),
    gutil               = require('gulp-util'),
    uglify              = require('gulp-uglify'),
    browserSync         = require('browser-sync').create(), // Server browserSync
    plumber             = require('gulp-plumber'),
    resolveDependencies = require('gulp-resolve-dependencies'),
    del                 = require('del'),  // delete file and folder
    zip                 = require("gulp-zip"); // make a zip


// Get the actual day and month
var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var newdate = '-'+day+'-'+month;

// Variables à modifier
var zipname = 'gulpwork';

// Tache principal, actualise dist/ et lance le serveur et watch
gulp.task('build', ['html', 'less', 'onecss', 'js', 'plugins-js', 'plugins-css', 'image', 'fonts', 'fontcustom', 'connect', 'watch'], function() {
  console.log('Build OK');
  console.log('Serveur lancé...');
});

// Actualise dist sans lancer le serveur
gulp.task('update', ['html', 'less', 'onecss', 'cleancss', 'js', 'plugins-js', 'plugins-css', 'image', 'fonts', 'fontcustom'], function() {
  console.log('Update OK');
});

// Export le fichier dist après l'avoir actualisé
gulp.task('export', ['update', 'zip'], function() {
  console.log('zip créé');
});

// Connect le server
gulp.task('connect', function() {
  browserSync.init({
      server: "./dist"
  });
});

// Met le html dans dist
gulp.task('html', function () {
  return gulp.src('*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

// Process le less et le minifie
gulp.task('less', function () {
  return gulp.src('css/style.less')
    .pipe(plumber())
    .pipe(plumber( function (error) {
        gutil.log(gutil.colors.red(error.message));
        gutil.beep();
        this.emit('end');
    }))
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'IE 9'],
      cascade: false
    }))
    .pipe(minifyCSS())
    .pipe(concat('style-less.css'))
    .pipe(gulp.dest('./dist/css'));
});

// En présence de CSS dans le dossier /css
// gulp.task('css', function () {
//   return gulp.src('css/**/*.css')
//     .pipe(plumber())
//     .pipe(plumber( function (error) {
//         gutil.log(gutil.colors.red(error.message));
//         gutil.beep();
//         this.emit('end');
//     }))
//     .pipe(concat('style-css.css'))
//     .pipe(minifyCSS())
//     .pipe(gulp.dest('./dist/css'));
// });

// Concatène tous les fichiers CSS de /dist en style.css et le minifie
gulp.task('onecss', ['less'], function () {
  del.sync(['./dist/css/style.css']);
  return gulp.src('dist/css/*.css')
    .pipe(concat('style.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

// Clean le dossier dist pour ne laisser que style.css
gulp.task('cleancss', ['less', 'onecss'], function() {
  del.sync(['./dist/css/*', '!./dist/css/style.css']);
});

// Concatène et minifie le JS en fonction des dependences puis le met dans dist/js
gulp.task('js', function(){
  return gulp.src(['js/main.js'])
    .pipe(resolveDependencies({ pattern: /\* @requires [\s-]*(.*?\.js)/g })).on('error', function(err) {
        console.log(err.message);
      })
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
});

// En cas de présence de CSS pour des plugins
gulp.task('plugins-css', function () {
  return gulp.src('plugins/*.css')
    .pipe(minifyCSS())
    .pipe(concat('plugins.css'))
    .pipe(gulp.dest('./dist/plugins'))
    .pipe(browserSync.stream());
});

// En cas de présence de JS pour des plugins
gulp.task('plugins-js', function () {
  return gulp.src('plugins/*.js')
    .pipe(resolveDependencies({ pattern: /\* @requires [\s-]*(.*?\.js)/g })).on('error', function(err) {
        console.log(err.message);
      })
    .pipe(uglify())
    .pipe(concat('plugins.js'))
    .pipe(gulp.dest('./dist/plugins'));
});

// Met les images dans dist/img
gulp.task('image', function () {
  return gulp.src('img/**/*.{gif,jpg,png,svg}')
    .pipe(gulp.dest('./dist/img'));
});

// Met les fonts dans dist/fonts
gulp.task('fonts', function () {
  return gulp.src('fonts/**/*.{ttf,woff,eof,svg}')
    .pipe(gulp.dest('./dist/fonts'));
});

// FONTCUSTOM
gulp.task('fontcustom', function () {
  return gulp.src('fontcustom/**/*')
    .pipe(gulp.dest('./dist/fontcustom/'));
});

// Export ZIP du dossier dist après update
gulp.task('zip', ['update'], function () {
  del.sync(['./'+zipname+newdate+'.zip']);
  return gulp.src([
    'dist/**/*'
  ])
  .pipe(zip(zipname+newdate+'.zip'))
  .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
  gulp.watch('*.html', ['html']);
  gulp.watch('css/**/*.less', ['less', 'onecss']);
  // gulp.watch('css/*.css', ['css', 'onecss']);
  gulp.watch('plugins/**/*.css', ['plugins-css']);
  gulp.watch('plugins/**/*.js', ['plugins-js']);
  gulp.watch('js/**/*.js', ['js']);
  gulp.watch('img/**/*.{gif,jpg,png,svg}', ['image']);
  gulp.watch('fonts/**/*.{ttf,woff,eof,svg}', ['fonts']);
  gulp.watch('fontcustom/**/*', ['fontcustom']);
});
