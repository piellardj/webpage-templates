const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "components");
const TEMPLATE_EXTENSION = ".ejs";

const MAX_RECURSION = 50;
let recursion = 0;
let allInterfacesPresent = true;

function checkHandlersRecursive(directory) {
    recursion++;

    fs.readdirSync(directory).forEach((child) => {
        const childFullpath = path.join(directory, child);

        if (fs.statSync(childFullpath).isDirectory()) {
            if (recursion >= MAX_RECURSION) {
                console.error("Too much recursion");
            } else {
                checkHandlersRecursive(childFullpath);
            }
        } else if (path.extname(child) === TEMPLATE_EXTENSION) {
            const templateName = path.basename(child, TEMPLATE_EXTENSION)
            const expectedInterfacePath = path.format({
                dir: directory,
                name: templateName + "-interface",
                ext: ".ts",
            });

            if (!fs.existsSync(expectedInterfacePath)) {
                console.log("NOT FOUND: " + expectedInterfacePath);
                allInterfacesPresent = false;
            }
        }
    });

    recursion--;
}

console.log("Checking that there is a TS interface for each component template file...");
checkHandlersRecursive(ROOT_DIR);

if (!allInterfacesPresent) {
    console.log("Some interfaces are missing!");
    process.exit(1);
}
console.log("Done !");