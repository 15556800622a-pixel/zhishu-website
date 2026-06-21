# Zhishu website

The landing page is a standalone static site in this `website` directory. Serve this directory as the web root.

## Local preview

```powershell
python -m http.server 4173 --directory D:\Applications\md-editor\website
```

Then open `http://localhost:4173`.

## Download configuration

Edit `config/download.json` to publish a new download:

- `version`: release version shown on the page.
- `fileName`: displayed download file name.
- `downloadUrl`: external direct URL or a web-root-relative path such as `/downloads/zhishu.zip`.
- `releaseDate`: release date in `YYYY-MM-DD` format.
- `fileSizeLabel`: human-readable package size.

If `downloadUrl` is left as `REPLACE_WITH_REAL_LINK_OR_PATH`, both download entries become disabled and show the Chinese equivalent of "Coming soon". To publish locally, place the archive under `downloads/` and update `downloadUrl` to its root-relative path. Both the hero and footer always read the same configuration.

The public site currently downloads from the `v1.0.0` GitHub Release. Upload future archives as Release assets and replace `downloadUrl` with the new asset URL.

## Tests

```powershell
node --test tests/site.test.mjs
```
