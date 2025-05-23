#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function fixQuotes(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Replace double single quotes with single quotes
    const fixedContent = content.replace(/''/g, "'");
    
    await writeFile(filePath, fixedContent, 'utf8');
    console.log(`Fixed quotes in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.endsWith('.ts')) {
      await fixQuotes(fullPath);
    }
  }
}

// Start the script
const backendDir = path.resolve(__dirname, '../backend');
console.log('Starting to fix quotes in TypeScript files...');
processDirectory(backendDir)
  .then(() => console.log('Quote fixing completed!'))
  .catch(err => console.error('Error:', err));
