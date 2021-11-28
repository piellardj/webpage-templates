const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");

const MINIFIED_EXTENSION = ".min.js";

function shouldMinify(filename /* string */) /* boolean */ {
    return path.extname(filename) === ".js" &&
        !filename.endsWith(MINIFIED_EXTENSION) && // don't minify already minified files
        filename !== "template-interface.js"; // these are part of the package itself
}

const MAX_RECURSION = 5;

let recursion = 0;
/**
 * Explores the whole subdir and minifies every handler.js found.
 * @param {string} directory
 * @return {void}
 */
function buildHandlersRecursive(directory) {
    recursion++;

    fs.readdirSync(directory).forEach((child) => {
        const childFullpath = path.join(directory, child);

        if (fs.statSync(childFullpath).isDirectory()) {
            if (recursion >= MAX_RECURSION) {
                console.error("Too much recursion");
            } else {
                buildHandlersRecursive(childFullpath);
            }
        } else if (shouldMinify(child)) {
            const code = {
                child: fs.readFileSync(childFullpath).toString(),
            };
            const minified = UglifyJS.minify(code);

            const minifiedFilepath = path.format({
                dir: directory,
                name: path.basename(child, ".js"),
                ext: MINIFIED_EXTENSION
            });
            fs.writeFileSync(minifiedFilepath, minified.code);
        }
    });

    recursion--;
}

const ROOT_DIR = path.resolve(__dirname, "..", "..", "build", "components");
buildHandlersRecursive(ROOT_DIR);
