import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// Everything that is not part of this package stays external, so the host application
// decides which versions of Vue / Bootstrap / third-party widgets are used (and which ones are installed at all).
const external = [
    /^vue$/,
    /^@inertiajs\//,
    /^bootstrap(\/.*)?$/,
    /^@floating-ui\//,
    /^@uppy\//,
    /^@vue-leaflet\//,
    /^@tinymce\//,
    /^vue-tel-input(\/.*)?$/,
    /^vue3-persian-datetime-picker(\/.*)?$/,
    /^dropzone(\/.*)?$/,
    /^leaflet(\/.*)?$/,
];

const r = (file) => path.resolve(__dirname, file);

export default defineConfig({
    plugins: [vue()],
    build: {
        cssCodeSplit: false,
        lib: {
            // One entry per optional heavy dependency: the main entry never references them.
            entry: {
                index: r('src/index.js'),
                uppy: r('src/entries/uppy.js'),
                'uppy-dashboard': r('src/entries/uppy-dashboard.js'),
                dropzone: r('src/entries/dropzone.js'),
                editor: r('src/entries/editor.js'),
                location: r('src/entries/location.js'),
                tel: r('src/entries/tel.js'),
                'persian-date': r('src/entries/persian-date.js'),
                'country-codes': r('src/entries/country-codes.js'),
            },
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external,
            output: [
                { format: 'es', entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
                { format: 'cjs', exports: 'named', entryFileNames: '[name].cjs', chunkFileNames: 'chunks/[name]-[hash].cjs', globals: { vue: 'Vue' } },
            ],
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
    },
});
