<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useDisposables } from './composables/useDisposables.js';
import { useI18n } from './i18n.js';
import { laravelHeaders } from './utils/http.js';

/**
 * Dropzone.js uploader. Import `dropzone/dist/dropzone.css` (and `basic.css`) in your application.
 * Stored value: the JSON object returned by the endpoint (single) or an array of them (multiple).
 */
export default defineComponent({
    name: 'DropzoneInput',
    emits: ['update:modelValue', 'change', 'ready', 'added', 'success', 'error', 'removed', 'complete'],
    props: {
        ...fieldProps,
        multiple: { type: Boolean, default: false },
        url: { type: String, default: '/upload' },
        /** Dropzone options (merged over the defaults). */
        options: { type: Object, default: () => ({}) },
        headers: { type: Object, default: () => ({}) },
        locale: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const d = useDisposables();

        const el = ref(null);
        let dz = null;
        let resetting = false;

        const asArray = () => (Array.isArray(field.model.value) ? field.model.value : []);

        onMounted(async () => {
            const { default: Dropzone } = await import('dropzone');
            if (d.isDisposed() || !el.value) return;

            Dropzone.autoDiscover = false;

            dz = new Dropzone(el.value, {
                url: props.url,
                addRemoveLinks: true,
                maxFiles: props.multiple ? null : 1,
                headers: laravelHeaders(props.headers),
                ...props.options,
            });

            dz.on('addedfile', (file) => emit('added', file));
            dz.on('complete', (file) => emit('complete', file));

            dz.on('error', (file, response) => {
                let message = t('upload.failed');
                if (typeof response === 'string') message = response;
                if (response?.message) message = response.message;

                file.previewElement?.classList.add('dz-error');
                const target = file.previewElement?.querySelector('[data-dz-errormessage]');
                if (target) target.textContent = message;
                emit('error', file, message);
            });

            dz.on('success', (file, response) => {
                const result = response?.data ?? response;
                field.model.value = props.multiple ? [...asArray(), result] : result;
                field.emitChange(field.model.value);
                emit('success', file, result);
            });

            dz.on('removedfile', async (file) => {
                emit('removed', file);
                if (resetting) return;

                let data = file.xhr?.response;
                if (!data) return;

                try {
                    data = JSON.parse(data);
                    const info = data.data ?? data;

                    field.model.value = props.multiple
                        ? asArray().filter((f) => (f?.path ?? f) !== info.path)
                        : null;
                    field.emitChange(field.model.value);

                    await fetch(props.url, {
                        method: 'DELETE',
                        headers: laravelHeaders({ 'Content-Type': 'application/json', ...props.headers }),
                        credentials: 'same-origin',
                        body: info.path,
                    });
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('[inertia-bootstrap-forms] Could not delete the uploaded file on the server', e);
                }
            });

            // Release the dropzone (listeners, hidden input, previews) when the component unmounts
            d.add(() => {
                resetting = true;
                try { dz?.destroy(); } catch (e) { /* noop */ }
                dz = null;
            });

            emit('ready', dz);
        });

        // The form was reset: clear the previews without calling the DELETE endpoint
        watch(
            () => field.model.value,
            (v) => {
                const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
                if (empty && dz?.files?.length) {
                    resetting = true;
                    dz.removeAllFiles(true);
                    resetting = false;
                }
            }
        );

        expose({ dropzone: () => dz });

        return { ...field, el };
    },
});
</script>

<template>
    <div ref="el" class="inertia-dropzone-input dropzone" :class="{ 'is-invalid': isInvalid }" :id="inputId"></div>
</template>
