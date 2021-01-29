// hacky implementation of optional yaml spec
// https://stackoverflow.com/questions/41063361/what-is-the-double-left-arrow-syntax-in-yaml-called-and-wheres-it-specced

const path = require("path");
const fs = require("fs");
const util = require("util");

const [ _, currFile, ...args ] = process.argv;

if (args.length !== 1)
    return;

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const genPath = path.normalize(
    path.join(
        path.dirname(currFile),
        "../",
        args[0]
    )
);

(async () => {
    const content = await readFile(genPath);
    const minified = JSON.stringify(JSON.parse(content));

    const modified = minified.replace(/"<<":\s?{(.+?)},/g, "$1,");
    const formatted = JSON.stringify(JSON.parse(modified), null, 2);
    await writeFile(genPath, formatted, "utf-8");

})();
