const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

// copy favicon
fs.copyFileSync(path.resolve(__dirname, '.github/assets/favicon.ico'), path.resolve(__dirname, 'docs/favicon.ico'));
// create empty .nojekyll file
fs.closeSync(fs.openSync(path.resolve(__dirname, 'docs/.nojekyll'), 'w'));

// add favicon in HTML
const results = replace.sync({
  files: './docs/*.html',
  from: /<head>/g,
  to: `<head>\n  <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">`,
});

const success = results.length === 2 && results.every(r => r.hasChanged);
if (!success) {
  console.error('Adding favicon to HTML files failed');
  process.exit(1);
}
