/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: { xs: '420px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    extend: {
      colors: {
        bg: v('bg'), panel: v('panel'), panel2: v('panel2'), line: v('line'),
        ink: v('ink'), mute: v('mute'),
        cool: v('cool'), amber: v('amber'), hot: v('hot'), ok: v('ok'),
      },
      fontFamily: {
        sans: ['Hind', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        head: ['Rajdhani', 'Hind', 'Noto Sans Devanagari', 'Arial Narrow', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgb(var(--cool) / .5)' }, '100%': { boxShadow: '0 0 0 12px rgb(var(--cool) / 0)' } },
        flow: { to: { strokeDashoffset: '-24' } },
      },
      animation: { rise: 'rise .4s ease-out both', pulseRing: 'pulseRing 1.6s ease-out infinite', flow: 'flow 1s linear infinite' },
    },
  },
  plugins: [],
};
