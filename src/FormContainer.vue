<script>
import { useForm } from '@inertiajs/vue3';
import { computed, defineComponent, provide, reactive, ref, watch } from 'vue';
import { toEnglishDigits } from './utils/digits.js';

const isPlainObject = (v) =>
    v !== null && typeof v === 'object' && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/** Recursively converts Persian/Arabic digits inside strings; leaves File/Blob/Date untouched. */
function normalizeDigits(value) {
    if (typeof value === 'string') return toEnglishDigits(value);
    if (Array.isArray(value)) return value.map(normalizeDigits);
    if (isPlainObject(value)) {
        return Object.keys(value).reduce((carry, key) => {
            carry[key] = normalizeDigits(value[key]);
            return carry;
        }, {});
    }
    return value;
}

function safeEqual(a, b) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
        return false;
    }
}

export default defineComponent({
    name: 'FormContainer',
    emits: [
        'update:modelValue',
        'change',
        'submit',
        'reset',
        'before',
        'start',
        'progress',
        'success',
        'error',
        'cancel',
        'finish',
        // Legacy (v2) event names
        'onStart',
        'onFinish',
        'onSuccess',
        'onError',
    ],
    props: {
        /** The object that holds the value of every field (v-model). */
        modelValue: { type: Object, default: () => ({}) },
        url: { type: String, default: '' },
        method: { type: String, default: 'post' },
        /** Only reload these props after a successful visit (Inertia `only`). */
        only: { type: Array, default: () => [] },
        /** Extra form fields that are not part of `modelValue`. */
        options: { type: Object, default: () => ({}) },
        /** Extra Inertia visit options (preserveScroll, preserveState, headers, …). */
        visitOptions: { type: Object, default: () => ({}) },
        autoTab: { type: Boolean, default: true },
        resetOnSuccess: { type: Boolean, default: false },
        /** Replace the default submit behaviour. Receives (event, form). */
        submitHandler: { type: Function, default: null },
        /** Convert Persian/Arabic digits to English digits before submitting. */
        normalizeDigits: { type: Boolean, default: true },
        /** Enable Bootstrap 6 client-side validation (`data-bs-validate`). */
        validate: { type: Boolean, default: false },
        /** Render server messages as HTML (only enable for trusted messages). */
        htmlMessages: { type: Boolean, default: false },
        /** Hide the built-in error / success alerts. */
        hideAlerts: { type: Boolean, default: false },
    },
    setup(props, { emit, expose }) {
        const formEl = ref(null);
        const ui = reactive({ hasMessage: false, successMessage: null });

        const form = useForm({
            ...props.options,
            ...props.modelValue,
        });

        // Upload components write their progress here; SubmitButton reads it.
        form.uploading = null;

        form.getID = function (el = {}) {
            const output = [];

            if (formEl.value?.id) output.push(formEl.value.id);
            if (typeof el === 'string') output.push(el);

            if (el.group) {
                if (el.group.name) output.push(el.group.name);
                if (el.group.index !== undefined && el.group.index !== null) output.push(el.group.index);
            }

            if (el.name) output.push(el.name);
            if (el.value !== undefined && el.value !== null && el.value !== '') output.push(el.value);

            return output.join('-');
        };

        // Keys that exist on the Inertia form object right now (its own state, methods and the initial fields).
        // Fields that are not part of the initial v-model are added later by the inputs themselves.
        const baseKeys = new Set(Object.keys(form));
        const dynamicKeys = () =>
            Object.keys(form).filter((key) => !baseKeys.has(key) && typeof form[key] !== 'function' && form[key] !== undefined);

        const currentData = () => {
            const data = typeof form.data === 'function'
                ? { ...form.data() }
                : Object.keys(form).reduce((carry, key) => {
                    if (baseKeys.has(key) && typeof form[key] !== 'function') carry[key] = form[key];
                    return carry;
                }, {});

            // v-model objects do not have to declare every field up front
            dynamicKeys().forEach((key) => {
                data[key] = form[key];
            });

            return data;
        };

        const resetAll = () => {
            dynamicKeys().forEach((key) => delete form[key]);
            form.reset();
        };

        // form -> parent (v-model)
        watch(
            () => currentData(),
            (data) => {
                emit('change', data);
                emit('update:modelValue', data);
            },
            { deep: true }
        );

        // parent -> form (external changes of the v-model object)
        watch(
            () => props.modelValue,
            (incoming) => {
                if (!incoming || safeEqual(incoming, currentData())) return;
                Object.keys(incoming).forEach((key) => {
                    if (!safeEqual(form[key], incoming[key])) form[key] = incoming[key];
                });
            },
            { deep: true }
        );

        function focusNextField(current) {
            const focusable = Array.from(formEl.value.querySelectorAll('input, select, textarea')).filter(
                (el) => !el.disabled && el.tabIndex !== -1 && el.type !== 'hidden' && el.offsetParent !== null
            );
            const next = focusable[focusable.indexOf(current) + 1];

            if (next) {
                next.focus();
                if (next.tagName !== 'SELECT' && typeof next.select === 'function') next.select();
            }
        }

        function handleInput(event) {
            const el = event.target;
            if (!['INPUT', 'TEXTAREA'].includes(el.tagName)) return;

            if (props.autoTab && el.maxLength > 0 && el.value.length >= el.maxLength) {
                focusNextField(el);
            }

            const autoSubmitLength = parseInt(el.dataset.autoSubmitLength, 10);
            if (!isNaN(autoSubmitLength) && el.value.length >= autoSubmitLength) {
                submit();
            }
        }

        function reset() {
            resetAll();
            form.clearErrors();
            ui.hasMessage = false;
            ui.successMessage = null;
            emit('reset');
        }

        async function submit(event) {
            if (props.submitHandler) {
                return props.submitHandler(event, form);
            }

            emit('submit', event);

            form
                .transform((data) => {
                    const merged = { ...props.modelValue, ...data, ...currentData() };
                    return props.normalizeDigits ? normalizeDigits(merged) : merged;
                })
                .submit((props.method || 'post').toString().toLowerCase(), props.url, {
                    only: props.only,
                    ...props.visitOptions,
                    onBefore: (visit) => {
                        emit('before', visit);
                        return props.visitOptions.onBefore?.(visit);
                    },
                    onStart: (visit) => {
                        ui.hasMessage = false;
                        ui.successMessage = null;
                        form.clearErrors();
                        emit('start', visit);
                        emit('onStart', visit);
                        props.visitOptions.onStart?.(visit);
                    },
                    onProgress: (progress) => {
                        emit('progress', progress);
                        props.visitOptions.onProgress?.(progress);
                    },
                    onCancel: () => {
                        emit('cancel');
                        props.visitOptions.onCancel?.();
                    },
                    onFinish: (visit) => {
                        emit('finish', visit);
                        emit('onFinish', visit);
                        props.visitOptions.onFinish?.(visit);
                    },
                    onError: (errors) => {
                        emit('error', errors);
                        emit('onError', errors);
                        props.visitOptions.onError?.(errors);
                    },
                    onSuccess: (page) => {
                        if (props.resetOnSuccess) resetAll();

                        if (page?.props?.message) {
                            ui.hasMessage = true;
                            ui.successMessage = page.props.message;
                        }

                        emit('success', page);
                        emit('onSuccess', page);
                        props.visitOptions.onSuccess?.(page);
                    },
                });
        }

        provide('form', computed(() => form));
        provide('formApi', { submit, reset, el: formEl });

        expose({ submit, reset, form, el: formEl });

        return { form, formEl, ui, handleInput, reset, submit };
    },
});
</script>

<template>
    <form
        ref="formEl"
        :action="url || undefined"
        :method="method"
        :data-bs-validate="validate ? '' : undefined"
        :novalidate="!validate || form.hasErrors ? true : undefined"
        :class="{ 'form-processing': form.processing }"
        @input="handleInput"
        @submit.prevent="submit"
        @reset.prevent="reset"
    >
        <template v-if="!hideAlerts">
            <slot name="errors" :errors="form.errors" :form="form">
                <div v-if="form.hasErrors" class="alert theme-danger" role="alert">
                    <ul class="list-unstyled p-0 m-0 fanum">
                        <li v-for="(error, key) in form.errors" :key="key">
                            <span v-if="htmlMessages" v-html="error"></span>
                            <template v-else>{{ error }}</template>
                        </li>
                    </ul>
                </div>
            </slot>
            <slot name="message" :message="ui.successMessage">
                <div v-if="ui.hasMessage && ui.successMessage" class="alert theme-success" role="status">
                    <span v-if="htmlMessages" v-html="ui.successMessage"></span>
                    <span v-else>{{ ui.successMessage }}</span>
                </div>
            </slot>
        </template>
        <slot :form="form" :submit="submit" :reset="reset" />
    </form>
</template>
