const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const UglifyJS = require("uglify-es");

const SRC_DIR = path.resolve(__dirname);
const DST_DIR = path.resolve(__dirname, "..", "build");

const MAX_RECURSION = 5;

let recursion = 0;
/**
 * Explores the whole subdir and minifies every handler.js found.
 * @param {string} dir
 * @return {void}
 */
function buildHandlersRecursive(dir) {
    recursion++;

    const fulldir = path.resolve(SRC_DIR, dir);

    fs.readdirSync(fulldir).forEach((child) => {
        const childFullpath = path.join(fulldir, child);

        if (fs.statSync(childFullpath).isDirectory()) {
            if (recursion >= MAX_RECURSION) {
                console.error("Too much recursion");
            } else {
                buildHandlersRecursive(path.join(dir, child));
            }
        } else if (child === "handler.js") {
            const fullSrcPath = path.join(SRC_DIR, dir, child);
            const fullDstDir = path.join(DST_DIR, dir);

            const code = {
                "handler.js": fs.readFileSync(fullSrcPath).toString(),
            };
            const minified = UglifyJS.minify(code);

            fse.ensureDirSync(fullDstDir);
            fs.copyFileSync(fullSrcPath, path.join(fullDstDir, "handler.js"));
            const fullDstFilepath = path.join(fullDstDir, "handler.min.js");
            fs.writeFileSync(fullDstFilepath, minified.code);
        }
    });

    recursion--;
}

buildHandlersRecursive("components");
