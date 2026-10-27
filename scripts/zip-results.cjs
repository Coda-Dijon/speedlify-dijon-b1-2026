const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");

let inPath = path.join(__dirname, "..", "results");
let outPath = path.join(__dirname, "../_site", "results.zip");

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const zip = new AdmZip();
zip.addLocalFolder(inPath, "results");
zip.writeZip(outPath);