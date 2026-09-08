# Bangla font

`noto-sans-bengali-400.woff2` — Noto Sans Bengali, Bengali subset, **instanced
at wght=400** (44 KB, down from the 108 KB variable file).

Every Bangla string on the site is a caption at weight 400 and no post contains
Bengali, so the 100–900 axis was 63 KB of bytes nothing rendered. Instancing
keeps the same 123 codepoints, the same 405 glyphs and the full GSUB/GPOS
shaping tables, so Bangla conjuncts still form correctly. Bold Bangla, if it
ever appears, is synthesised by the browser.

## Rebuilding it

```bash
npm i @fontsource-variable/noto-sans-bengali
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = TTFont('node_modules/@fontsource-variable/noto-sans-bengali/files/noto-sans-bengali-bengali-wght-normal.woff2')
o = instancer.instantiateVariableFont(f, {'wght': 400}, inplace=False, updateFontNames=True)
o.flavor = 'woff2'
o.save('public/fonts/noto-sans-bengali-400.woff2')
PY
```

## Two rules

1. **Renaming is mandatory when the bytes change.** `functions/_middleware.js`
   serves `/fonts/*` with `max-age=31536000, immutable`, so a replaced file
   under the same name is pinned in browsers for a year. Bump the name.
2. **Keep the preload in `Layout.astro`.** Without it Chrome discovers the face
   during layout and fetches it at VeryHigh priority, which Lighthouse's model
   treats as render-blocking — measured at ~300 ms of First Contentful Paint.
   A preload is fetched at High, which is not.

The build works without the file (falls back to the system Bangla face), but
SHIP with it.
