// Load the filesystem and path modules
const fs = require('fs');
const path = require('path');

// Initialize blank string for storing index file code
let index_code = '';

// Create a Set to maintain unique added files
let addedFiles = new Set(); 

// Create a Map to store file data
let fileData = new Map(); 

// Function to recursively walk through all files in a directory
function walkFiles(startPath) {
  const stat = fs.statSync(startPath);
  
  // If startPath is directory, read all files inside
  if (stat.isDirectory()) {
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(startPath, files[i]);
      const stat = fs.statSync(filePath);
      
      // Recursively call walkFiles if filePath is directory, 
      // if it is a file and ends with .mjs, add it to the list of tracked files
      if (stat.isDirectory()) {
        walkFiles(filePath);
      } else if (stat.isFile() && filePath.endsWith('.mjs')) {
        if(!addedFiles.has(filePath)) {
          console.log("Adding "+filePath);
          formatFile(filePath);
        }
      }
    }
  
  // If startPath is a file and ends with .mjs, add it to the list of tracked files
  } else if (stat.isFile() && startPath.endsWith('.mjs')) {
    if(!addedFiles.has(startPath)) {
      console.log("Adding "+startPath);
      formatFile(startPath);
    }
  }
}

// Function to format the content of a file
function formatFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  
  // add the filePath to the Set of tracked files
  addedFiles.add(filePath); 
  
  const lines = data.split('\n');
  let localImports = '';
  let localContent = '';
  
  let importFilePaths = [];
  
  lines.forEach(line => {
    if (line.startsWith('import')) {
      // check if the import is a relative path or local import
      if (line.includes('from')) {
        let importedFilePath = line.split('from')[1].trim();
        importedFilePath = importedFilePath.substring(1, importedFilePath.length - 2);
        let split_importedFilePath = importedFilePath.split('/');
        importFilePaths.push(split_importedFilePath[split_importedFilePath.length - 1]);
        localImports += line + "\n";
      } else {
        console.log("How to handle this line? :: "+line);
      }
    } else if (filePath.endsWith('index.mjs')) {
      // if it is an index file, add the line to index_code string
      index_code += line + '\n';
    } else if (line.startsWith('export') && !filePath.endsWith('index.mjs')) {
      // if it is not an index file and the line starts with export, omit the export keyword
      line = line.replace("export default", '');
      line = line.replace("export", '');
      localContent += line + '\n';
    } else {
      // otherwise, add the line as is to the localContent string
      localContent += line + '\n';
    }
  });
  
  // store the imports, content and dependencies of this file
  fileData.set(extractFinalFileName(filePath), {
    name: filePath,
    imports: localImports,
    content: localContent,
    dependencies: importFilePaths
  });
}
function convertWindowsToUnixPath(windowsPath) {
  let unixPath = windowsPath.replace(/\\/g, '/');
  if (!unixPath.startsWith('./')) {
      unixPath = './' + unixPath;
  }
  return unixPath;
}
function extractFinalFileName(filePath) {
  let unixPath = filePath.replace(/\\/g, '/');
  return unixPath.split('/').pop();
}



// Function to order content based on dependencies between them
function orderContentByDependencies() {
  console.log("BEFORE ORDERING ::");
  ([...fileData.entries()]).forEach(entry => { console.log(" - ",entry[0]); });

  let orderedFileData = [...fileData.entries()].sort((a, b) => {
    if(a[1].dependencies.includes(b[0])) {
      return 1;
    }
    if(b[1].dependencies.includes(a[0])) {
      return -1;
    }
    return 0;
  });
  fileData = new Map(orderedFileData);

  console.log("AFTER ORDERING ::");
  ([...fileData.entries()]).forEach(entry => { console.log(" - ",entry[0]); });
}

// Function to bundle all transforms from the provided startPaths into a single file
function main(startPaths, outputFileName) {
  for (let i = 0; i < startPaths.length; i++) {
    // call walkFiles for all startPaths provided
    walkFiles(startPaths[i]);
  }
  
  // call orderContentByDependencies to organize the imports and content based on their dependencies
  orderContentByDependencies();
  
  let bundledImports = "";
  let bundledContent = "";
  
  // concatenate all the imports and contents
  for(let data of fileData.values()) {
    bundledImports += data.imports;
    bundledContent += data.content;
  }
  
  // write the bundled imports, content and index_code to a single output file
  fs.writeFileSync(outputFileName, bundledImports + '\n' + bundledContent + '\n'+index_code, 'utf8');
}

const startPaths = process.argv.slice(2, -1); // input directories or files
const outputFile = process.argv.slice(-1)[0]; // output file
main(startPaths, outputFile);
