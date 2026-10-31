<script>
import { defineComponent, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useChoice } from './composables/useChoice.js';

/** Bootstrap 6 checkbox / radio (`.check` / `.radio` directly on the input, wrapped by `.form-field`). */
export default defineComponent({
    name: 'CheckboxInput',
    emits: ['update:modelValue', 'change', 'focus', 'blur'],
    props: {
        ...fieldProps,
        /** checkbox | radio */
        type: { type: String, default: 'checkbox', validator: (v) => ['checkbox', 'radio'].includes(v) },
        /** Value added to the model (arrays / radios) when this option is checked. */
        value: { type: [String, Number, Boolean, Object], default: 'yes' },
        trueValue: { type: null, default: true },
        falseValue: { type: null, default: false },
        /** Initial checked state (applied only when the model is still empty). */
        checked: { type: Boolean, default: false },
        indeterminate: { type: Boolean, default: false },
        label: { type: String, default: null },
    },
    setup(props, { emit }) {
        const input = ref(null);
        const field = useField(props, emit, { valued: () => props.value });
        useChoice(props, field, input);

        function onChange(event) {
            field.emitChange(field.model.value, event);
        }

        return { ...field, input, onChange };
    },
    expose: ['input'],
});
</script>

<template>
    <div class="form-field">
        <input
            ref="input"
            v-model="model"
            :name="name"
            :id="inputId"
            :type="type"
            :value="value"
            :true-value="trueValue"
            :false-value="falseValue"
            :required="required"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            :class="[type === 'radio' ? 'radio' : 'check', { 'is-invalid': isInvalid }]"
            @click="readonly && $event.preventDefault()"
            @change="onChange"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <label :for="inputId"><slot>{{ label }}</slot></label>
    </div>
</template>
