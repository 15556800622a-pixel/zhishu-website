import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8');
}

test('download configuration has documented fields and a public release URL', async () => {
  const config = JSON.parse(await read('config/download.json'));

  assert.equal(config.version, '1.0.0');
  assert.equal(config.fileName, '\u77e5\u67a2.zip');
  assert.match(config.downloadUrl, /^https:\/\/github\.com\/15556800622a-pixel\/zhishu-website\/releases\/download\/v1\.0\.0\//);
  assert.equal(config.releaseDate, '2026-06-21');
  assert.ok(config.fileSizeLabel);
});

test('landing page exposes required sections and accessible controls', async () => {
  const html = await read('index.html');

  for (const id of ['hero', 'write', 'connect', 'see', 'about']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /aria-label=["']\u5207\u6362\u7eb8\u58a8\u4e3b\u9898["']/u);
  assert.match(html, /data-download-link/);
  assert.match(html, /prefers-reduced-motion/);
});

test('client script shares one config across download entries and supports link completion', async () => {
  const script = await read('assets/site.js');

  assert.match(script, /config\/download\.json/);
  assert.match(script, /querySelectorAll\('\[data-download-link\]'\)/);
  assert.match(script, /\[\[/);
});
