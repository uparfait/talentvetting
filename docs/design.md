# Design, speed and access

## From the Imberabyombi template
Tokens (`src/styles/base/tokens.css`), fonts (Figtree, Bricolage Grotesque, JetBrains Mono, served locally), scaling,
buttons, cards, chips, outlined fields (required asterisk, help icons instead of hint lines), the searchable picker every
select opens, password fields with rules, the chips input, the file box, checkboxes, radios and switches, segmented
controls, table cards (column searches, sort, Export, full screen, pages), tile menus with 3D icons (the glossy engine),
empty states, dialogs and notifications in the top layer, the tooltip, the sidebar and header, the public site (header,
brand hero with its wave, partners marquee, page heroes, footer), the document editor's look, the OK hand pattern and
the cartoons (public pages only). Only what the app uses was copied.

- Brand colour: #E01FAD (`--brand`), deep shade #8F146F (`--brand_2`). One token restyles everything.
- Light only; text can be selected anywhere; every control shows the pointer.
- Patterns are SVG files in `public/patterns`, used as CSS masks so they take any colour.
- Pictures are flat cartoons drawn once with the template's engine and saved in `public/cartoons`; inside the app, empty
  states use 3D icons instead.
- The logo: two hands greeting each other in a brand circle (`public/favicon.svg`).

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
