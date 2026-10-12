// Run after build.py to check offline links and removed private material.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = [path.join(root, 'index.html'), ...fs.readdirSync(path.join(root, 'chapters')).filter(x => x.endsWith('.html')).map(x => path.join(root, 'chapters', x))];
const errors = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  if (/SA\d{8}/.test(html)) errors.push(`${page}: student ID`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|#|data:)/.test(url)) continue;
    const [file] = url.split('#');
    if (!file) continue;
    const target = path.resolve(path.dirname(page), decodeURIComponent(file));
    if (!fs.existsSync(target)) errors.push(`${page}: missing ${url}`);
  }
}
if (fs.existsSync(path.join(root, 'sources/chapter2-answers.pdf'))) errors.push('Unredacted answer PDF is still in sources/');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${pages.length} HTML pages, local links, and privacy checks.`);
