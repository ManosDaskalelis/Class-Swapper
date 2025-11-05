import fs from "fs";
import path from "path";

//#region Replace css classes with tailwind or bootstrap classes
export async function replaceClasses(file) {
    let files = separateDirsFromFiles(file);
    let classes;
    for (const item of files) {
        classes = findHtmlClasses(item);
    }
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
    let match = fileName.match(new RegExp("(?<=\\.)(html\|css)$"));
    if (match == null) {
        return false;
    } else {
        console.log(match);
        return match;
    }
}
//#endregion

//#region find class names in html files 
function findHtmlClasses(file = '') {
    const htmlRx = new RegExp("(?<=class=([\"']))\\s*[^\"']+(?=\\1)", "gi");
    const cssRx = new RegExp("(?<=\\.[a-z]+\\s*{)\\s*[^{}]+(?=})", "gi");
    let result;
    let data = fs.readFileSync(file, "utf-8");

    if (file.endsWith("css")) {
        result = data.match(cssRx);
        for (const item of result) {
            result += item.trim().split(";");
        }
        console.log(result);

    } else {
        result = data.match(htmlRx);
    }

    return result;
}
//#endregion

await replaceClasses("C:/Users/DaskalelisE/Desktop/training/npm/classSwap");