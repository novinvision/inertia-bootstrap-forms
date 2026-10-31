<script>
import { computed, defineComponent, inject, provide } from 'vue';
import * as Vue from 'vue';
import FormLabel from './FormLabel.vue';

let uid = 0;

/**
 * Bootstrap 6 `.form-field` wrapper: label + control + help text + validation feedback.
 * Child inputs pick up the generated `id` automatically, so the label always points to the control.
 */
export default defineComponent({
    name: 'FormField',
    components: { FormLabel },
    props: {
        /** Field key. Used to read the server-side error of the field. */
        name: { type: String, default: null },
        label: { type: String, default: null },
        help: { type: String, default: null },
        /** Override the error text (otherwise it is read from the form errors). */
        error: { type: String, default: null },
        required: { type: Boolean, default: false },
        id: { type: String, default: null },
    },
    setup(props) {
        const form = inject('form', null);
        const generated = Vue.useId ? Vue.useId() : `ff-${++uid}`;
        const fieldId = computed(() => props.id || (props.name ? `${props.name}-${generated}` : generated));

        provide('formField', {
            get id() {
                return fieldId.value;
            },
            get name() {
                return props.name;
            },
        });

        const errorText = computed(() => props.error ?? (props.name ? form?.value?.errors?.[props.name] : null) ?? null);

        return { fieldId, errorText };
    },
});
</script>

<template>
    <div class="form-field">
        <slot name="label">
            <FormLabel v-if="label" :for="fieldId" :required="required">{{ label }}</FormLabel>
        </slot>
        <slot />
        <slot name="help">
            <div v-if="help" :id="fieldId + '-help'" class="form-text">{{ help }}</div>
        </slot>
        <slot name="error" :error="errorText">
            <div v-if="errorText" :id="fieldId + '-error'" class="invalid-feedback d-block" role="alert">{{ errorText }}</div>
        </slot>
    </div>
</template>
