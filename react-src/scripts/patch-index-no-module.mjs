import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`[patch-index-no-module] Missing ${indexPath}`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(/type="module"\s+/g, '');
html = html.replace(/\s+crossorigin(?=(\s|>))/g, '');

const onErrorAttr =
  ' onerror="window.__BOOT_RENDER_ERROR__ && window.__BOOT_RENDER_ERROR__(\'Resource load failed\', this && this.src)"';

html = html.replace(
  /<script([^>]*?)src="\.\/assets\/app\.js"([^>]*)><\/script>/,
  (match, pre, post) => {
    let attrs = `${pre}src="./assets/app.js"${post}`;
    if (!/\\sdefer\\b/.test(attrs)) {
      attrs += " defer";
    }
    if (!/\\sonerror=/.test(attrs)) {
      attrs += onErrorAttr;
    }
    return `<script${attrs}></script>`;
  }
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('[patch-index-no-module] Patched index.html for legacy WebView.');
