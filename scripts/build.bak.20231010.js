const fs = require('fs');
const path = require('path');

let imports = [];
let content = [];
let index_code = '';
let addedFiles = new Set(); // Set to track added files

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
  
  lines.forEach(line => {
    if (line.startsWith('import')) {
      // check if the import is a relative path or local import
      // check for and skip duplicates
      if (!line.includes('./') && 
          !line.includes('../') && 
          !imports.includes(line)) {
            localImports += line;
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
  if (imports.includes(filePath)) {
    content.unshift(localContent); // add to the start
  } else {
    content.push(localContent); // add to the end
  }
  imports.push(line);
}

function main(startPaths, outputFileName) {
  for (let i = 0; i < startPaths.length; i++) {
    walkFiles(startPaths[i]);
  }
  fs.writeFileSync(outputFileName, imports.join("\n") + '\n' + content.join("\n\n")+'\n'+index_code, 'utf8');
}

const startPaths = process.argv.slice(2, -1); // input directories or files
const outputFile = process.argv.slice(-1)[0]; // output file
main(startPaths, outputFile);
