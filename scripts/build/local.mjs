import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pkg from '../../package.json' with { type: "json" };

// List of import paths to ignore
const ignoreImports = [
  // 'tailwind.css',
  'safelist.css'
];

const input = './src/main.build.css';
const output = './dist/frutjam.local.css';

 const banner = `/*! ${pkg.name} v${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author} | Released under the ${pkg.license} License | ${pkg.homepage} */\n`;

function resolveImports(filePath, seen = new Set()) {
  const absPath = path.resolve(filePath);
  if (seen.has(absPath)) return '';
  seen.add(absPath);

  let content = fs.readFileSync(absPath, 'utf8');

  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Inline other @imports
  content = content.replace(/@import\s+["'](.+?)["'];/g, (_, importPath) => {
    if (ignoreImports.some(name => importPath.includes(name))) return ''; // skips imports
    const fullPath = path.resolve(path.dirname(filePath), importPath);
    return resolveImports(fullPath, seen);
  });

  return content;
}

// Run bundler
let result = resolveImports(input);

// Minify: collapse whitespace
result = result
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

// Add banner to top
result = banner + result;

// Ensure output dir exists
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, result);

// Output log with chalk
const sizeKB = (fs.statSync(output).size / 1024).toFixed(2);
console.log(
  `${chalk.green('✔')} CSS built successfully: ${chalk.cyan(output)} ${chalk.gray(`(${sizeKB} KB)`)}`
);