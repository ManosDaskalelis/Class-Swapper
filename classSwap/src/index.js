import { dir, error, log } from "console";
import fs from "fs";
import path from "path";

//#region Replace css classes with tailwind or bootstrap classes
export async function replaceClasses(file) {
    let files = separateDirsFromFiles(file);
    let classes;
    for (const item of files) {
            classes = findHtmlClasses(item);
            console.log(classes);
    }
}

//#endregion
//#region Separate dirs from files
let dirResults = [];
function separateDirsFromFiles(dir) {
    let results = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
        let fullPath = path.join(dir, item.name);
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
    let match = fileName.match(new RegExp("(?<=\\.)html$"));
    if (match == null) {
        return false;
    } else {
        return match;
    }
}
//#endregion

function findHtmlClasses(file) {
    let result = [];
    result.push(file.match(new RegExp(`(class='|")(?=[a-z])`)));
    console.log(result);
    return result;
}

await replaceClasses("C:/Users/DaskalelisE/Desktop/training/npm/classSwap");
