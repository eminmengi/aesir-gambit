/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                viking: {
                    gold: '#d4af37',
                    wood: '#5d4037',
                    stone: '#78909c',
                    dark: '#263238',
                    blood: '#880e4f',
                }
            },
            fontFamily: {
                serif: ['"Cinzel"', 'serif'], // Viking style font
                sans: ['"Inter"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
