'use strict';
var gulp = require('gulp'),
        watch = require('gulp-watch'),
        prefixer = require('gulp-autoprefixer'),
        sass = require('gulp-sass'),
        sourcemaps = require('gulp-sourcemaps'),
        svgSprite = require("gulp-svg-sprites"),
        shorthand = require('gulp-shorthand'),
        rimraf = require('rimraf'),
        browserSync = require("browser-sync"),
        rigger = require('gulp-rigger'),
        fileinclude = require('gulp-file-include'),
        reload = browserSync.reload;
var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        sprite: 'build/css/sprite/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style: 'src/scss/**/*.*',
        img: 'src/img/**/*.*',
        sprite: 'src/img/sprite/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/scss/**/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};
gulp.task('webserver', function () {
    browserSync(config);
});
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
gulp.task('html:build', function () {
    gulp.src(path.src.html)
//        .pipe(rigger())
            .pipe(fileinclude())
            .pipe(gulp.dest(path.build.html))
            .pipe(reload({stream: true}));
});
gulp.task('js:build', function () {
    gulp.src(path.src.js)
            .pipe(rigger())
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.js))
            .pipe(reload({stream: true}));
});
gulp.task('style:build', function () {
    gulp.src(path.src.style)
            .pipe(sourcemaps.init())
            .pipe(sass({
                sourceMap: true,
                errLogToConsole: true
            }))
//        .pipe(prefixer())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.css))
            .pipe(reload({stream: true}));
});
gulp.task('image:build', function () {
    gulp.src(path.src.img)
            .pipe(gulp.dest(path.build.img))
            .pipe(reload({stream: true}));
});
gulp.task('sprite:build', function() {
  var spriteData =
    gulp.src(path.src.sprite)
      .pipe(svgSprite());

  spriteData.img.pipe(gulp.dest(path.build.img));
  spriteData.css.pipe(gulp.dest(path.build.sprite));
});
gulp.task('sprites', function () {
    return gulp.src(path.src.sprite)
        .pipe(svgSprite({
            common: "sprite",
//            preview: false,
//            cssFile: "_sprite.scss"
        }))
        .pipe(gulp.dest(path.build.sprite));
});
//gulp.task('sprite:build', function () {
//    var config = {
//        "dest": "./build/css/sprite/",
//    "log": "debug",
//    "mode": {
//        "css": {
//            "common": "sprite",
//            "render": {
//                "css": true,
//                "scss": true
//            }
//        },
//        "view": true,
//        "defs": true,
//        "symbol": true,
//        "stack": true
//    }
//    };
//    gulp.src(path.src.sprite)
//            .pipe(svgSprite(config)).on('error', function (error) {
//        console.log(error);
//    })
//            .pipe(gulp.dest(path.build.sprite));
//});
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts))
});
gulp.task('build', [
    'html:build',
    'js:build',
//    'sprite:build',
    'fonts:build',
    'style:build',
    'image:build'
]);
gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});
gulp.task('default', ['build', 'watch']);
//gulp.task('default', ['build', 'webserver', 'watch']);

function onError(err) {
    console.log(err);
    this.emit('end');
}