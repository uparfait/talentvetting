/* postcss.config.js: Vite runs these on every stylesheet.
   tailwindcss turns the @tailwind, @layer and @apply rules into CSS (only the classes the code uses);
   autoprefixer adds vendor prefixes so older browsers get the same look. */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
