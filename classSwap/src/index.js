import fs from "fs";
import path from "path";
import readline from "readline";

//#region variables and consts
let isHtmlFile = false;
const htmlRx = new RegExp("(?<=class=([\"']))\\s*[^\"']+(?=\\1)", "gi");
const cssClassNamesRgx = new RegExp("\\.[a-z]+(?=\\s*\\{)", "gim");
// const cssValuesRgx = new RegExp("(?<=" + item + "+\\s*{)\\s*[^{}]+(?=})", "gi");
const filePathRgx = new RegExp("[a-z]+(?=\\.(html|css)$)(\\.(html|css)$)", "gi");
//#endregion

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
        classes.push(extractClasses(item));
        fullPath = item.replace(item.match(filePathRgx), "");
    }
    fs.writeFileSync(file,file.replace("something", ""),"utf-8")
    rl.question("Proceed with automatic class swapping? (y/n)\r\n", (answer) => {
        const posRegx = new RegExp("[y YES Yes yes]", "i");
        const negRegx = new RegExp("[NO n No no]", "i");
        if (answer.match(posRegx)) {
            console.log("Proceeding");
            const [classDict, fileDict] = compareClasses(files, classes);
            console.log(fileDict);
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
function extractClasses(file = '') {
    let results = [];
    let cssNames = [];
    let data = fs.readFileSync(file, "utf-8");

    if (file.endsWith("css")) {
        isHtmlFile = false;
        cssNames = data.match(cssClassNamesRgx);
        for (const item of cssNames) {
            if (data.includes(item)) {
                // results.push(data.match(new RegExp("(?<=" + item + "+\\s*{)\\s*[^{}]+(?=})", "gi")).toString().trim());
                results = data.split(/(?=\.[A-Za-z0-9_-]+\s*\{)/g)
                    .filter(Boolean)
                    .map(b => b.replace(/\s+/g, ""))
                    .filter(b => b.includes("{") && b.includes("}"));
            }
        }
    } else {
        isHtmlFile = true;
        results = [...new Set(data.match(htmlRx).toString().trim().split(" "))];
        for (const itemToRemove of results) {

            if (itemToRemove.includes("," || ',')) {
                let indexOfItem = itemToRemove.indexOf("," || ',');
                results.push(itemToRemove.slice(0, indexOfItem));
                results.splice(results.indexOf(itemToRemove), 1)
            }
        }
    }
    return [results, cssNames, isHtmlFile];
}
//#endregion
//#region Packs Css and Html classes together
function compareClasses(files = [], classes) {
    let cssFile;
    let htmlFile;
    let cssClasses;
    let htmlClasses;
    let cssNames;

    for (const file of files) {
        for (const className of classes) {
            if (file.endsWith("html") && className[2] == true) {
                htmlFile = file;
                htmlClasses = className[0];
                console.log(`\r\nFound: [✕✕ ${htmlClasses} ✕✕] in file: ${htmlFile}\n`);

            } else if (file.endsWith("css") && className[2] == false) {
                cssFile = file;
                cssClasses = className[0];
                cssNames = className[1];
                console.log(`\r\nFound: [✕✕ ${cssClasses} ✕✕] in file: ${cssFile}\n`);
            }
        }
    }
    let classDict = {};
    let fileDict = {};
    for (let i = 0; i < htmlClasses.length; i++) {
        for (let j = 0; j < cssClasses.length; j++) {
            if (cssClasses[j].toString().includes(htmlClasses[i])) {
                classDict[htmlClasses[i]] = cssClasses[j];
                fileDict[htmlFile] = cssFile;
            }
        }
    }
    console.log(classDict);
    console.log(fileDict);
    return [classDict, fileDict];
}
//#endregion
//#region Regex builder helper function to clear code
function regexBuilder(str, pattern) {
    const rx = new RegExp(pattern)

}
//#endregion

await replaceClasses("C:/Users/DaskalelisE/Desktop/training/npm/classSwap");