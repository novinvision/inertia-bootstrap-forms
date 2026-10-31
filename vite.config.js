import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// Everything that is not part of this package stays external, so the host application
// decides which versions of Vue / Bootstrap / third-party widgets are used.
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

export default defineConfig({
    plugins: [vue()],
    build: {
        cssCodeSplit: false,
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'InertiaBootstrapForms',
            formats: ['es', 'cjs'],
            fileName: (format) => `inertia-bootstrap-forms.${format}.js`,
        },
        rollupOptions: {
            external,
            output: { exports: 'named', globals: { vue: 'Vue' } },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
    },
});
