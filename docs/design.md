# Design, speed and access

## From the Imberabyombi template
Tokens (`src/styles/base/tokens.css`), fonts (Figtree, Bricolage Grotesque, JetBrains Mono, served locally), scaling,
buttons, cards, chips, outlined fields, data tables, toasts, the tooltip, the segmented tabs, the OK hand pattern and the
cartoon pictures. Only what the app uses was copied.

- Brand colour: #E01FAD (`--brand`), deep shade #8F146F (`--brand_2`). One token restyles everything.
- Light and dark themes; the page shell applies the saved one before the first paint.
- Patterns are SVG files in `public/patterns`, used as CSS masks so they take any colour.
- Pictures are flat cartoons drawn once with the template's engine and saved in `public/cartoons`.

## Speed
- Lazy pages, React in its own cached chunk, CSS split per chunk.
- face-api.js and its models load only where faces are checked.
- Static assets with long cache headers; fonts preloaded; no third party font service.
- Small files (60 lines at most) keep chunks small and diffs readable.

## Access
- Real labels on every field (the outlined field keeps the label in the box), errors in `role="alert"`.
- Dialogs are native `<dialog>`: focus stays inside, Esc closes.
- Tables sort with buttons that announce `aria-sort`; rows open with Enter.
- Tabs use `role="tablist"`; stage tracks carry text for screen readers.
- Live regions for toasts, verification steps and the exam log.
- Reduced motion is respected; colour is never the only signal (chips have words).
