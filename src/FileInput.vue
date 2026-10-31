<script>
import { defineComponent, reactive, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useDisposables } from './composables/useDisposables.js';
import { useI18n } from './i18n.js';
import { laravelHeaders } from './utils/http.js';

let counter = 0;

/**
 * File input that uploads every selected file immediately to `endpoint` (XMLHttpRequest, with progress)
 * and stores the returned path(s) in the form.
 *
 * Endpoint contract: POST multipart `file` → JSON `{ data: { path } }` (or `{ path }`);
 *                    DELETE with the raw `path` as request body.
 */
export default defineComponent({
    name: 'FileInput',
    emits: ['update:modelValue', 'change', 'added', 'progress', 'uploaded', 'error', 'removed'],
    props: {
        ...fieldProps,
        multiple: { type: Boolean, default: false },
        endpoint: { type: String, default: '/upload' },
        accept: { type: String, default: null },
        headers: { type: Object, default: () => ({}) },
        /** Name of the multipart field. */
        fieldName: { type: String, default: 'file' },
        locale: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const d = useDisposables();

        const input = ref(null);
        const files = ref([]);
        const requests = new Map();

        d.add(() => {
            requests.forEach((xhr) => xhr.abort());
            requests.clear();
            if (field.form.value) field.form.value.uploading = null;
        });

        const paths = () => files.value.filter((f) => f.path).map((f) => f.path);

        function publish(event) {
            const next = props.multiple ? paths() : (paths()[0] ?? null);
            field.model.value = next;
            field.emitChange(next, event);
        }

        function updateProgress() {
            const form = field.form.value;
            if (!form) return;
            const active = files.value.filter((f) => f.uploading);
            form.uploading = active.length ? Math.min(99, Math.round(active.reduce((s, f) => s + f.percent, 0) / active.length)) : null;
        }

        function upload(item) {
            item.error = '';
            item.percent = 0;
            item.uploading = true;
            updateProgress();

            const body = new FormData();
            body.append(props.fieldName, item.file);

            const xhr = new XMLHttpRequest();
            requests.set(item.id, xhr);
            xhr.open('POST', props.endpoint);
            Object.entries(laravelHeaders(props.headers)).forEach(([k, v]) => xhr.setRequestHeader(k, v));

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    item.percent = Math.round((e.loaded / e.total) * 100);
                    emit('progress', item, item.percent);
                    updateProgress();
                }
            };

            const fail = (message) => {
                item.uploading = false;
                item.error = message || t('upload.failed');
                requests.delete(item.id);
                updateProgress();
                emit('error', item, item.error);
            };

            xhr.onerror = () => fail();
            xhr.onload = () => {
                let json = null;
                try {
                    json = JSON.parse(xhr.responseText);
                } catch (e) { /* not json */ }

                if (xhr.status < 200 || xhr.status >= 300) {
                    const first = json?.errors ? Object.values(json.errors)[0] : null;
                    return fail(json?.message || (Array.isArray(first) ? first[0] : first));
                }

                const path = json?.data?.path ?? json?.path;
                if (!path) return fail();

                item.path = path;
                item.percent = 100;
                item.uploading = false;
                requests.delete(item.id);
                updateProgress();
                publish();
                emit('uploaded', item);
            };

            xhr.send(body);
        }

        function add(file) {
            const item = reactive({ id: `f${++counter}`, file, percent: 0, error: '', path: null, uploading: false });
            files.value = props.multiple ? [...files.value, item] : [item];
            emit('added', item);
            upload(item);
        }

        function onSelect(event) {
            Array.from(event.target.files).forEach(add);
            event.target.value = '';
        }

        async function remove(item) {
            requests.get(item.id)?.abort();
            requests.delete(item.id);
            files.value = files.value.filter((f) => f.id !== item.id);
            updateProgress();

            if (item.path) {
                publish();
                try {
                    await fetch(props.endpoint, {
                        method: 'DELETE',
                        headers: laravelHeaders(props.headers),
                        credentials: 'same-origin',
                        body: item.path,
                    });
                } catch (e) { /* the file is already detached from the form */ }
            }
            emit('removed', item);
        }

        // The form was reset (e.g. resetOnSuccess): forget the list without touching the server
        watch(
            () => field.model.value,
            (v) => {
                const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
                if (empty && files.value.some((f) => f.path)) files.value = files.value.filter((f) => !f.path);
            }
        );

        expose({ clear: () => files.value.slice().forEach(remove) });

        return { ...field, t, input, files, onSelect, remove, retry: upload, size: (b) => `${Math.round(b / 1024)}KB` };
    },
});
</script>

<template>
    <div class="file-input-uploader">
        <input
            ref="input"
            type="file"
            class="form-control"
            :class="{ 'is-invalid': isInvalid }"
            :name="name"
            :id="inputId"
            :multiple="multiple"
            :accept="accept || undefined"
            :required="required && !files.length"
            :disabled="isDisabled || readonly"
            :aria-invalid="isInvalid || undefined"
            @change="onSelect"
        />
        <ul v-if="files.length" class="list-group mt-2">
            <li v-for="item in files" :key="item.id" class="list-group-item">
                <div class="d-flex align-items-center justify-content-between gap-2">
                    <span class="text-truncate">{{ item.file.name }}</span>
                    <span class="d-flex align-items-center gap-2">
                        <span class="fg-secondary fanum" dir="ltr">{{ size(item.file.size) }}</span>
                        <button
                            v-if="item.error"
                            type="button"
                            class="btn-text theme-secondary btn-icon"
                            :aria-label="t('file.retry')"
                            @click="retry(item)"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3v3.5H10" /><path d="M3.2 6.5A5.5 5.5 0 0 1 13 6.5M12.8 9.5A5.5 5.5 0 0 1 3 9.5M2.5 13V9.5H6" /></svg>
                        </button>
                        <button
                            v-if="item.path || item.error"
                            type="button"
                            class="btn-text theme-danger btn-icon"
                            :aria-label="t('file.remove')"
                            @click="remove(item)"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
                        </button>
                    </span>
                </div>
                <div v-if="item.uploading" class="progress mt-2" role="progressbar" :aria-valuenow="item.percent" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" :style="{ width: item.percent + '%' }"></div>
                </div>
                <div v-if="item.error" class="fg-danger mt-1" role="alert">{{ item.error }}</div>
            </li>
        </ul>
    </div>
</template>
