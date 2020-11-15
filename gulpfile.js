const {src, dest, series } = require("gulp");

exports.default = series(copyFiles, deps);

function copyFiles(){
    return src('src/*').pipe(dest('dist/'))
}

function deps() {
    return src(['node_modules/jspdf/dist/jspdf.es.min.js', 'node_modules/jspdf/dist/jspdf.es.min.js.map' ])
        .pipe(dest('dist/jspdf'))
  }
