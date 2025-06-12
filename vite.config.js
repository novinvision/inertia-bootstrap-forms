import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'InertiaBootstrapForms',
            fileName: (format) => `inertia-bootstrap-forms.${format}.js`,
        },
        rollupOptions: {
            external: [
                'vue',
                '@inertiajs/vue3',
                '@vue-leaflet/vue-leaflet',
                'vue-tel-input',
                'vue3-persian-datetime-picker',
                '@tinymce/tinymce-vue',
            ],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});
