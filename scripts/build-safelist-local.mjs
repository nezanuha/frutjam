import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pkg from '../package.json' with { type: "json" };
// --- Add this block for safelist merging ---

const safelistOutput = path.join('dist', 'frutjam.safelist.local.css');
const safelistBanner = `/*! ${pkg.name} v${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author} | Released under the ${pkg.license} License | ${pkg.homepage} */\n`;

// Recursively find safelist.css files in a directory
function findSafelistFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findSafelistFiles(fullPath));
    } else if (entry === 'safelist.css') {
      files.push(fullPath);
    }
  }
  return files;
}

// Set the root directory for searching
const searchRoot = './src'; // Change if needed

// Merge safelist.css files
const safelistFiles = findSafelistFiles(searchRoot);
let mergedSafelist = safelistBanner;
for (const cssFile of safelistFiles) {
  mergedSafelist += fs.readFileSync(cssFile, 'utf8') + '\n';
}

// Minify: collapse whitespace
mergedSafelist = mergedSafelist
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

fs.mkdirSync(path.dirname(safelistOutput), { recursive: true });
fs.writeFileSync(safelistOutput, mergedSafelist);
// Optionally, log file info
const safelistSize = (fs.statSync(safelistOutput).size / 1024).toFixed(2);
console.log(
  `${chalk.green('✔')} All safelist.css merged: ${chalk.cyan(safelistOutput)} ${chalk.gray(`(${safelistSize} KB)`)}`,
);
