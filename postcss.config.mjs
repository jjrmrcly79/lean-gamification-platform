// postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
    // Convierte lab()/lch()/oklab()/oklch() a rgb() en el build
    'postcss-preset-env': {
      stage: 1,
      features: {
        'lab-function': true,
        'lch-function': true,
        'oklab-function': true,
        'oklch-function': true,
        'color-functional-notation': true
      }
    }
  }
};
