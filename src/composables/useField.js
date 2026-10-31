import { computed, inject, ref, watch } from 'vue';
import * as Vue from 'vue';

let fallbackUid = 0;

/**
 * Props shared by every field component.
 * Spread them into a component: `props: { ...fieldProps, ... }`.
 */
export const fieldProps = {
    /** Key of the field inside the FormContainer's v-model object. */
    name: { type: String, default: null },
    /** Standalone v-model (only used when the field is NOT inside a FormContainer). */
    modelValue: { type: null, default: undefined },
    id: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    /** Force the invalid state. By default it follows the server-side errors of the form. */
    invalid: { type: Boolean, default: null },
};

/**
 * Connects a field to the parent <FormContainer>.
 *
 * The value of every field lives in the form object that FormContainer exposes
 * through its own `v-model`. Fields never need a v-model of their own; when a
 * field is used outside a FormContainer it falls back to a regular
 * `v-model` / `update:modelValue` pair.
 */
export function useField(props, emit, options = {}) {
    const formRef = inject('form', null);
    const groupRef = inject('group', null);
    const fieldCtx = inject('formField', null);
    const formApi = inject('formApi', null);

    const form = computed(() => formRef?.value ?? null);
    const group = computed(() => (groupRef?.value?.name ? groupRef.value : null));
    const standalone = computed(() => !form.value);

    const local = ref(
        props.modelValue === undefined ? (options.defaultValue ?? null) : props.modelValue
    );

    watch(
        () => props.modelValue,
        (v) => {
            if (standalone.value && v !== undefined) local.value = v;
        }
    );

    const value = computed({
        get() {
            if (standalone.value) return local.value;
            if (group.value) return group.value.getData(props.name);
            return form.value[props.name];
        },
        set(next) {
            if (standalone.value) local.value = next;
            else if (group.value) group.value.setData(props.name, next);
            else form.value[props.name] = next;

            emit('update:modelValue', next);
        },
    });

    const errorKeys = computed(() => {
        const keys = [];
        if (group.value) {
            keys.push(`${group.value.name}.${group.value.index}.${props.name}`);
            keys.push(`${group.value.name}.${props.name}`);
        }
        keys.push(props.name);
        return keys;
    });

    const error = computed(() => {
        const errors = form.value?.errors;
        if (!errors) return null;
        for (const key of errorKeys.value) {
            if (key && errors[key] !== undefined) return errors[key];
        }
        return null;
    });

    const isInvalid = computed(() => props.invalid === true || (props.invalid === null && error.value !== null));
    const isDisabled = computed(() => props.disabled || !!form.value?.processing);

    const uid = Vue.useId ? Vue.useId() : `ibf-${++fallbackUid}`;

    const inputId = computed(() => {
        if (props.id) return props.id;
        if (fieldCtx?.id && !options.valued) return fieldCtx.id;

        if (form.value?.getID && props.name) {
            return form.value.getID({
                name: props.name,
                value: options.valued ? options.valued() : undefined,
                group: group.value,
            });
        }

        return props.name ? `${props.name}-${uid}` : uid;
    });

    const emitChange = (next, event) => emit('change', next, event);

    return {
        form,
        group,
        standalone,
        model: value,
        error,
        isInvalid,
        isDisabled,
        inputId,
        emitChange,
        formApi,
        fieldCtx,
    };
}
