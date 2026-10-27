import zip from "cross-zip";
import path from "path";

let inPath = path.join(__dirname, "_data", "results");
let outPath = path.join(__dirname, "_site", "results.zip");

zip.zipSync(inPath, outPath);