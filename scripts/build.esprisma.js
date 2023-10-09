const fs = require('fs');
const path = require('path');
const esprima = require('esprima'); // A JavaScript parser, we will use it to parse import statements

let imports = '';
let content = '';
let addedFiles = new Set(); // Set to track added files

// Denotes file dependencies as a graph 
let graph = new Map();

function walkFiles(startPath) {
  const stat = fs.statSync(startPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(startPath, files[i]);
      walkFiles(filePath);
    }
  } else if (stat.isFile() && startPath.endsWith('.mjs')) {
    addDependencies(startPath);
  }
}

function addDependencies(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  let dependencies = [];
  
  esprima.tokenize(data, {}, function(node) {
    if (node.type === 'ImportDeclaration') {
      let importedFilePath = path.resolve(filePath, '..', node.source.value);
      dependencies.push(importedFilePath);
    }
  });
  graph.set(filePath, dependencies);
}

function topologicalSort(graph) {
  let visited = new Set();
  let result = [];

  function dfs(node) {
    visited.add(node);
    let edges = graph.get(node) || [];
    edges.forEach(nextNode => {
      if (!visited.has(nextNode)) {
        dfs(nextNode);
      }
    });
    result.unshift(node);
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });

  return result;
}

function formatFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  addedFiles.add(filePath); // add file to Set
  const lines = data.split('\n');
  let localContent = '';
  
  lines.forEach(line => {
    // Modified code to handle the new dependency parsing
    if (!(line.startsWith('import') && imports.includes(line))) {
      imports += line + '\n';
    } 
    // Rest of the code 
  });
  content += localContent;
}

function main(startPaths, outputFileName) {
  for (let i = 0; i < startPaths.length; i++) {
    walkFiles(startPaths[i]);
  }
  
  const orderedFiles = topologicalSort(graph);
  
  orderedFiles.forEach(filePath => {
    formatFile(filePath);
  });

  fs.writeFileSync(outputFileName, imports + '\n' + content, 'utf8');
}

const startPaths = process.argv.slice(2, -1); // input directories or files
const outputFile = process.argv.slice(-1)[0]; // output file
main(startPaths, outputFile);
