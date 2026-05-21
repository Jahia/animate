'use strict';

const fs       = require('fs');
const path     = require('path');
const CleanCSS = require('clean-css');

const root   = __dirname;
const src    = path.join(root, 'node_modules', 'animate.css', 'animate.compat.css');
const dstDir = path.join(root, 'src', 'main', 'resources', 'css');
const dst    = path.join(dstDir, 'animate.min.css');

fs.mkdirSync(dstDir, { recursive: true });

const input  = fs.readFileSync(src, 'utf8');
const output = new CleanCSS({ level: 2 }).minify(input);
if (output.errors.length) {
    console.error('[copy-animate] minification errors:', output.errors);
    process.exit(1);
}
fs.writeFileSync(dst, output.styles, 'utf8');

const srcKB = Buffer.byteLength(input,         'utf8') / 1024;
const dstKB = Buffer.byteLength(output.styles, 'utf8') / 1024;
console.log(`[copy-animate] animate.compat.css -> ${dst} (${srcKB.toFixed(1)}KB -> ${dstKB.toFixed(1)}KB)`);
