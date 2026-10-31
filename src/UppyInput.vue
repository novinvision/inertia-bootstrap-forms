<script>
import { computed, defineAsyncComponent, defineComponent, onMounted, ref, shallowRef, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useDisposables } from './composables/useDisposables.js';
import { useI18n } from './i18n.js';
import { laravelHeaders } from './utils/http.js';

const UppyContextProvider = defineAsyncComponent(() => import('@uppy/vue').then((m) => m.UppyContextProvider));
const FilesList = defineAsyncComponent(() => import('@uppy/vue').then((m) => m.FilesList));
const UppyDropzone = defineAsyncComponent(() => import('@uppy/vue').then((m) => m.Dropzone));

const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB'];
function niceBytes(x) {
    let l = 0;
    let n = parseInt(x, 10) || 0;
    while (n >= 1024 && l < UNITS.length - 1) {
        n /= 1024;
        l++;
    }
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)}${UNITS[l]}`;
}

/**
 * Uppy based uploader. Import `@uppy/vue/css/style.css` in your application.
 * Uppy is created after mount and destroyed on unmount.
 */
export default defineComponent({
    name: 'UppyInput',
    components: { UppyContextProvider, FilesList, UppyDropzone },
    emits: [
        'update:modelValue', 'change', 'ready', 'file-added', 'file-removed', 'beforeUpload', 'progress', 'upload',
        'upload-progress', 'upload-error', 'upload-success', 'upload-pause', 'complete', 'error', 'upload-retry',
        'upload-stalled', 'retry-all', 'cancel-all', 'restriction-failed',
    ],
    props: {
        ...fieldProps,
        multiple: { type: Boolean, default: false },
        useXHR: { type: Boolean, default: true },
        XHRConfig: { type: Object, default: () => ({}) },
        url: { type: String, default: '/upload' },
        /** Uppy core options. */
        config: { type: Object, default: () => ({}) },
        errorHandler: { type: Function, default: null },
        showRestrictionCaption: { type: Boolean, default: true },
        locale: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const d = useDisposables();

        const uppy = shallowRef(null);
        const area = ref(null);
        const caption = ref(null);
        const errorMessage = ref(null);
        const uploadingFiles = ref(0);
        let resetting = false;
        let unmounting = false;

        const setUploading = (v) => {
            if (field.form.value) field.form.value.uploading = v;
        };

        function showError(message) {
            if (props.errorHandler) return props.errorHandler(message);
            if (!message) return;
            errorMessage.value = message;
            d.timeout(() => (errorMessage.value = null), 3000);
        }

        function buildCaption(r) {
            if (!r) return '';
            const parts = [];

            if (r.allowedFileTypes?.length) {
                parts.push(t('uppy.types', { types: r.allowedFileTypes.map((x) => x.replace('.', '')).join(', ') }));
            }
            if (r.maxNumberOfFiles && r.maxNumberOfFiles > 1) parts.push(t('uppy.maxFiles', { count: r.maxNumberOfFiles }));
            if (r.minNumberOfFiles) parts.push(t('uppy.minFiles', { count: r.minNumberOfFiles }));
            if (r.maxFileSize) parts.push(t('uppy.maxSize', { size: niceBytes(r.maxFileSize) }));
            if (r.minFileSize) parts.push(t('uppy.minSize', { size: niceBytes(r.minFileSize) }));
            if (r.maxTotalFileSize) parts.push(t('uppy.maxTotal', { size: niceBytes(r.maxTotalFileSize) }));

            return parts.length ? `${parts.join(', ')} ${t('uppy.suffix')}` : '';
        }

        onMounted(async () => {
            const { default: Uppy } = await import('@uppy/core');
            if (d.isDisposed()) return;

            const instance = new Uppy({
                id: props.name ?? 'uppy',
                autoProceed: true,
                ...props.config,
                restrictions: {
                    maxNumberOfFiles: props.multiple ? null : 1,
                    ...(props.config?.restrictions || {}),
                },
            });

            instance.on('upload', () => {
                uploadingFiles.value = instance.getFiles().filter((f) => !f.progress.uploadComplete).length;
                emit('upload');
            });
            instance.on('before-upload', (files) => emit('beforeUpload', files));

            instance.on('upload-success', (file, response) => {
                uploadingFiles.value = Math.max(0, uploadingFiles.value - 1);
                const result = response.body ?? response;

                if (props.multiple) {
                    const current = Array.isArray(field.model.value) ? field.model.value : [];
                    field.model.value = [...current, result];
                } else {
                    field.model.value = result;
                }
                field.emitChange(field.model.value);
                emit('upload-success', file, response);
            });

            instance.on('file-added', (file) => emit('file-added', file));

            instance.on('file-removed', (file) => {
                const serverResponse = file.response?.body ?? file.response;

                if (props.multiple && Array.isArray(field.model.value)) {
                    field.model.value = field.model.value.filter((item) => JSON.stringify(item) !== JSON.stringify(serverResponse));
                } else {
                    field.model.value = null;
                }
                field.emitChange(field.model.value);

                if (serverResponse && !resetting && !unmounting) {
                    fetch(props.url, {
                        method: 'DELETE',
                        headers: laravelHeaders({ 'Content-Type': 'application/json' }),
                        credentials: 'same-origin',
                        body: JSON.stringify(serverResponse),
                    }).catch(() => {});
                }
                emit('file-removed', file);
            });

            instance.on('progress', (progress) => {
                if (progress <= 0) setUploading(null);
                else if (progress >= 100) setUploading(uploadingFiles.value > 0 ? 99 : null); // still waiting for the server
                else setUploading(progress);
                emit('progress', progress);
            });

            instance.on('upload-progress', (file, progress) => emit('upload-progress', file, progress));
            instance.on('upload-pause', (file, progress) => emit('upload-pause', file, progress));
            instance.on('cancel-all', () => emit('cancel-all'));
            instance.on('retry-all', () => emit('retry-all'));
            instance.on('upload-stalled', (error, files) => emit('upload-stalled', error, files));
            instance.on('upload-retry', (file) => emit('upload-retry', file));
            instance.on('complete', (result) => {
                uploadingFiles.value = 0;
                setUploading(null);
                emit('complete', result);
            });
            instance.on('error', (error) => emit('error', error));

            instance.on('upload-error', (file, error, response) => {
                uploadingFiles.value = Math.max(0, uploadingFiles.value - 1);
                let message = error;
                try {
                    message = JSON.parse(response.response)?.message ?? error;
                } catch (e) { /* not json */ }
                showError(message?.message ?? message);
                emit('upload-error', file, error, response, message);
            });

            instance.on('restriction-failed', (file, error) => {
                showError(error.message);
                emit('restriction-failed', file, error);
            });

            if (props.useXHR) {
                const { default: XHR } = await import('@uppy/xhr-upload');
                if (d.isDisposed()) {
                    instance.destroy?.();
                    return;
                }
                instance.use(XHR, {
                    method: 'POST',
                    endpoint: props.url,
                    headers: laravelHeaders(),
                    ...props.XHRConfig,
                });
            }

            d.add(() => {
                unmounting = true;
                setUploading(null);
                try { instance.destroy?.(); } catch (e) { /* noop */ }
                uppy.value = null;
            });

            uppy.value = instance;
            if (props.showRestrictionCaption) caption.value = buildCaption(instance.opts?.restrictions);
            emit('ready', instance);
        });

        // Form was submitted successfully → forget the files without touching the server
        watch(
            () => field.form.value?.wasSuccessful,
            (now, before) => {
                if (now === true && before === false && uppy.value) {
                    resetting = true;
                    uppy.value.cancelAll();
                    resetting = false;
                    field.model.value = props.multiple ? [] : null;
                }
            }
        );

        expose({ uppy: () => uppy.value });

        return { ...field, uppy, area, caption, errorMessage };
    },
});
</script>

<template>
    <div v-if="uppy" ref="area" class="uppy-input-area" :id="inputId">
        <div v-if="errorMessage" class="alert theme-danger text-center py-1 mb-2" role="alert">{{ errorMessage }}</div>
        <UppyContextProvider :name="'uu' + (name ?? 'uppy')" :uppy="uppy">
            <slot :uppy="uppy">
                <FilesList class="uppy-file-lists" />
                <UppyDropzone class="uppy-drop-zone" />
            </slot>
        </UppyContextProvider>
        <div v-if="caption" class="uppy-input-area--caption form-text text-center fst-italic">{{ caption }}</div>
        <div v-if="isInvalid" class="invalid-feedback d-block">{{ error }}</div>
    </div>
</template>
