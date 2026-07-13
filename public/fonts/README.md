# Bangla font

Place `noto-sans-bengali.woff2` here (variable weight subset).

Fetch it once:
- Download from https://fonts.google.com/noto/specimen/Noto+Sans+Bengali
  (or `npm i @fontsource-variable/noto-sans-bengali` and copy the woff2 out of
  `node_modules/@fontsource-variable/noto-sans-bengali/files/*bengali*.woff2`).
- Rename to `noto-sans-bengali.woff2`.

The build works without the file (falls back to system-ui), but SHIP with it.
