import fs from "fs";
import path from "path";
import readline from "readline";

//#region Replace css classes with tailwind or bootstrap classes
export async function replaceClasses(file) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const filePathRgx = new RegExp("[a-z]+(?=\\.(html|css)$)(\\.(html|css)$)", "gi");
    let files = separateDirsFromFiles(file);
    let classes;
    let fullPath;

    for (const item of files) {
        classes = findHtmlClasses(item);
        fullPath = item.replace(item.match(filePathRgx), "")

        console.log(`\nFound ${classes} in file ${item} in folder ${fullPath}\n`);
    }
    rl.question("Proceed with automatic class swapping? (y/n)\r\n", (answer) => {
        const answerRgx = new RegExp("[y n yes no]", "i");
        if (answer.match(answerRgx)) {
            if (answer == "y" || answer == "yes") {
                console.log("Proceeding");
                rl.close();
            } else {
                console.log("Aborting");
                rl.close();
            }
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
function findHtmlClasses(file = '') {
    const htmlRx = new RegExp("(?<=class=([\"']))\\s*[^\"']+(?=\\1)", "gi");
    const cssRx = new RegExp("(?<=\\.[a-z]+\\s*{)\\s*[^\r\n]+[^{}]+(?=})", "gi");
    let result = [];
    let data = fs.readFileSync(file, "utf-8");

    if (file.endsWith("css")) {
        let names = data.match(new RegExp("\\.[a-z]+(?=\\s*\\{)", "gim"));
        console.log(names);
        for (const item of names) {
            if (data.includes(item)) {
                result = data.match(new RegExp("(?<=" + item + "+\\s*{)\\s*[^\r\n]+[^{}]+(?=})", "gi"))
                console.log(result);
            }
        }
    } else {
        result = [...new Set(data.match(htmlRx))];
    }

    return result;
}
//#endregion

// function compareClasses(file = "") {

// }

//#region Regex builder helper function to clear code
function regexBuilder(str, pattern) {
    const rx = new RegExp(pattern)

}
//#endregion

await replaceClasses("C:/Users/DaskalelisE/Desktop/training/npm/classSwap");