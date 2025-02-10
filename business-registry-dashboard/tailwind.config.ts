/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**.{html,ts,js,vue}'],
  presets: [require('@daxiom/nuxt-core-layer-test/tailwind.config')],
  theme: {
    extend: {
      width: {
        '45': '11.25rem',
      },
    },
  },
}
