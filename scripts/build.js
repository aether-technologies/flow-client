
const fs = require('fs');
const path = require('path');
let index_code = '';
let addedFiles = new Set(); // Set to track added files
let fileData = new Map(); 
function walkFiles(startPath) {
  const stat = fs.statSync(startPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(startPath, files[i]);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkFiles(filePath);
      } else if (stat.isFile() && filePath.endsWith('.mjs')) {
        if(!addedFiles.has(filePath)) {
          console.log("Adding "+filePath);
          formatFile(filePath);
        }
      }
    }
  } else if (stat.isFile() && startPath.endsWith('.mjs')) {
    if(!addedFiles.has(startPath)) {
      console.log("Adding "+startPath);
      formatFile(startPath);
    }
  }
}
function formatFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  addedFiles.add(filePath); // add file to Set
  const lines = data.split('\n');
  let localImports = '';
  let localContent = '';
  
  let importFilePaths = [];
  
  lines.forEach(line => {
    if (line.startsWith('import')) {
      // check if the import is a relative path or local import
      if (line.includes('from')) {
        let importedFilePath = line.split('from')[1].trim();
        importedFilePath = importedFilePath.substring(1, importedFilePath.length - 1); // remove quotes
        importFilePaths.push(importedFilePath);
        localImports += line + "\n";
      }
    } else if (filePath.endsWith('index.mjs')) {
      index_code += line + '\n';
    } else if (line.startsWith('export') && !filePath.endsWith('index.mjs')) {
      line = line.replace("export default", '');
      line = line.replace("export", '');
      localContent += line + '\n';
    } else {
      localContent += line + '\n';
    }
  });
  
  fileData.set(filePath, {
    imports: localImports,
    content: localContent,
    dependencies: importFilePaths
  });
}
function orderContentByDependencies() {
  let orderedFileData = [...fileData.entries()].sort((a, b) => {
    if(a[1].dependencies.includes(b[0])) return 1;
    if(b[1].dependencies.includes(a[0])) return -1;
    return 0;
  });
  fileData = new Map(orderedFileData);
}
function main(startPaths, outputFileName) {
  for (let i = 0; i < startPaths.length; i++) {
    walkFiles(startPaths[i]);
  }
  
  orderContentByDependencies();
  let bundledImports = "";
  let bundledContent = "";
  
  for(let data of fileData.values()) {
    bundledImports += data.imports;
    bundledContent += data.content;
  }
  
  fs.writeFileSync(outputFileName, bundledImports + '\n' + bundledContent + '\n'+index_code, 'utf8');
}

const startPaths = process.argv.slice(2, -1); // input directories or files
const outputFile = process.argv.slice(-1)[0]; // output file
main(startPaths, outputFile);
