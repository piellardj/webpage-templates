const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-es");

const ROOT_DIR = path.resolve(__dirname, "..", "..", "build", "components");

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
        } else if (child === "handler.js") {
            const code = {
                "handler.js": fs.readFileSync(childFullpath).toString(),
            };
            const minified = UglifyJS.minify(code);

            const minifiedFilepath = path.join(directory, "handler.min.js");
            fs.writeFileSync(minifiedFilepath, minified.code);
        }
    });

    recursion--;
}

buildHandlersRecursive(ROOT_DIR);
