import fs from "fs";
import path from "path";
import readline from "readline";

let isHtmlFile = false;
const htmlRx = new RegExp("(?<=class=([\"']))\\s*[^\"']+(?=\\1)", "gi");
const cssRx = new RegExp("(?<=\\.[a-z]+\\s*{)\\s*[^\r\n]+[^{}]+(?=})", "gi");
const filePathRgx = new RegExp("[a-z]+(?=\\.(html|css)$)(\\.(html|css)$)", "gi");

//#region Replace css classes with tailwind or bootstrap classes
export async function replaceClasses(file) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let files = separateDirsFromFiles(file);
    let classes = [];
    let fullPath;

    for (const item of files) {
        classes.push(findClasses(item));
        fullPath = item.replace(item.match(filePathRgx), "");
    }
    compareClasses(files, classes);
    rl.question("Proceed with automatic class swapping? (y/n)\r\n", (answer) => {
        const posRegx = new RegExp("[y YES Yes yes]", "i");
        const negRegx = new RegExp("[NO n No no]", "i");
        if (answer.match(posRegx)) {
            console.log("Proceeding");
            rl.close();
        } else if (answer.match(negRegx)) {
            console.log("Aborting");
            rl.close();
        } else {
            console.log("Aborting");
            rl.close();
        }
    })
}
//#endregion
//#region Separate dirs from files
let dirResults = [];
function separateDirsFromFiles(dir) {
    let results = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
        let fullPath = path.join(item.parentPath, item.name);
        if (item.isDirectory()) {
            dirResults.push(fullPath);
        } else if (item.isFile() && isAppropriateFileExtension(fullPath)) {
            results.push(fullPath);
        }
    }
    return results;
}
//#endregion
//#region Find valid files
function isAppropriateFileExtension(fileName = "") {
    if (fileName.includes("node_module")) {
        return;
    }
    let match = fileName.match(new RegExp("(?<=\\.)(html\|css)$"));
    if (match == null) {
        return false;
    } else {
        return match;
    }
}
//#endregion
//#region find class names in html files 
function findClasses(file = '') {
    let result = [];
    let data = fs.readFileSync(file, "utf-8");

    if (file.endsWith("css")) {
        isHtmlFile = false;
        let names = data.match(new RegExp("\\.[a-z]+(?=\\s*\\{)", "gim"));
        for (const item of names) {
            if (data.includes(item)) {
                result.push(data.match(new RegExp("(?<=" + item + "+\\s*{)\\s*[^\r\n]+[^{}]+(?=})", "gi")).toString().trim());
            }
        }
    } else {
        isHtmlFile = true;
        result = [...new Set(data.match(htmlRx).toString().trim().split(" "))];
        for (const itemToRemove of result) {

            if (itemToRemove.includes("," || ',')) {
                let indexOfItem = itemToRemove.indexOf("," || ',');
                result.push(itemToRemove.slice(0, indexOfItem));
                result.splice(result.indexOf(itemToRemove), 1)
            }
        }
    }
    return [result, isHtmlFile];
}
//#endregion
//#region Packs Css and Html classes together
function compareClasses(files = [], classes) {
    let cssFile;
    let htmlFile;
    let cssClasses;
    let htmlClasses;

    for (const file of files) {
        for (const className of classes) {
            if (file.endsWith("html") && className[1] == true) {
                htmlFile = file;
                htmlClasses = className[0];
                console.log(`\r\nFound: [ ${htmlClasses} ] in file: ${htmlFile}\n`);

            } else if (file.endsWith("css") && className[1] == false) {
                cssFile = file;
                cssClasses = className[0];
                console.log(`\r\nFound: [ ${cssClasses} ] in file: ${cssFile}\n`);
            }
        }
    }
}
//#endregion
//#region Regex builder helper function to clear code
function regexBuilder(str, pattern) {
    const rx = new RegExp(pattern)

}
//#endregion

await replaceClasses("C:/Users/DaskalelisE/Desktop/training/npm/classSwap");