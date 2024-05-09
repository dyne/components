import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  // theme: {},
  plugins: [require('@tailwindcss/line-clamp')],
} satisfies Config;
