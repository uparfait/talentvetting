/* tailwind.config.js: the bridge between Tailwind and the design tokens.
   Every colour, radius and spacing utility reads a CSS variable from src/styles/base/01_design_tokens.css,
   so editing ONE token there restyles every page, public and admin. */

/* spacing scale: Tailwind's steps, each a multiple of --space (default 1rem ÷ 4 per step) */
const spacing = { 0: '0px', px: '1px', auto: 'auto' };
for (const step of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96]) {
  spacing[step] = `calc(var(--space) * ${step / 4})`;
}

/* a colour token as a Tailwind colour that supports opacity (bg-brand/10) */
const token_color = name => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: token_color('brand'), 'brand-2': token_color('brand_2'), ink: token_color('ink'),
        bg: token_color('bg'), surface: token_color('surface'), 'surface-2': token_color('surface_2'), 'surface-3': token_color('surface_3'),
        fg: token_color('fg'), muted: token_color('muted'), line: token_color('line'),
        ok: token_color('ok'), warn: token_color('warn'), bad: token_color('bad'), info: token_color('info'),
        /* accessible orange for small text: brand mixed toward the text colour (≥ 4.5:1 in both themes) */
        accent: 'color-mix(in srgb, rgb(var(--brand)) 80%, rgb(var(--fg)))'
      },
      fontFamily: { sans: ['var(--font_sans)'], display: ['var(--font_display)'], mono: ['var(--font_mono)'] },
      borderRadius: {
        sm: 'calc(var(--radius) * .25)', DEFAULT: 'calc(var(--radius) * .375)', md: 'calc(var(--radius) * .5)',
        lg: 'calc(var(--radius) * .625)', xl: 'calc(var(--radius) * .75)', '2xl': 'var(--radius)',
        '3xl': 'calc(var(--radius) * 1.5)', '4xl': 'calc(var(--radius) * 2.25)', full: 'var(--pill)'
      },
      boxShadow: { soft: 'var(--shadow)' },
      padding: spacing, margin: spacing, gap: spacing, space: spacing,
      transitionTimingFunction: { DEFAULT: 'var(--ease)' }
    }
  }
};
