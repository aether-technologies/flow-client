const fs = require('fs');
const path = require('path');
function walkFiles(startPath) {
  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(startPath, files[i]);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkFiles(filePath);
    } else if (stat.isFile() && filePath.endsWith('.mjs')) {
      formatFile(filePath);
    }
  }
}
let imports = '';
let content = '';
function formatFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n');
  let localContent = '';
  
  lines.forEach(line => {
    if (line.startsWith('import')) {
      imports += line + '\n';
    } else if (!line.startsWith('export') || filePath.endsWith('index.mjs')) {
      localContent += line + '\n';
    }
  });
  content += localContent;
}
function main(startPaths, outputFileName) {
  for (let i = 0; i < startPaths.length; i++) {
    walkFiles(startPaths[i]);
  }
  fs.writeFileSync(outputFileName, imports + '\n' + content, 'utf8');
}
const startPaths = process.argv.slice(2, -1); // input directories or files
const outputFile = process.argv.slice(-1)[0]; // output file
main(startPaths, outputFile);
