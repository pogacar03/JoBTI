import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4efe5',
        ink: '#18221f',
        pine: '#184b3c',
        vermilion: '#c85136',
        mustard: '#d5a33d',
        fog: '#d9d6cc',
        mint: '#dfe9dc',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        file: '7px 7px 0 rgba(24,34,31,0.13)',
        stamp: '3px 3px 0 rgba(24,34,31,0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
