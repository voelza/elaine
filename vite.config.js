const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/Elaine.ts'),
            name: 'ELAINE',
            fileName: (format) => `elaine.${format}.js`
        },
        rollupOptions: {
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    elaine: 'ELAINE'
                }
            }
        }
    }
})
