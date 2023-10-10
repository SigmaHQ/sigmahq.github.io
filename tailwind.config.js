/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './.vitepress/**/*.js',
        './.vitepress/**/*.vue',
        './.vitepress/**/*.ts',
        './**/*.md',
        './index.html',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
