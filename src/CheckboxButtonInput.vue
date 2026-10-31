<script>
import { defineComponent, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useChoice } from './composables/useChoice.js';

/** Toggle button (Bootstrap 6 `.btn-check`): the input is nested inside the label. */
export default defineComponent({
    name: 'CheckboxButtonInput',
    emits: ['update:modelValue', 'change', 'focus', 'blur'],
    props: {
        ...fieldProps,
        type: { type: String, default: 'radio', validator: (v) => ['checkbox', 'radio'].includes(v) },
        value: { type: [String, Number, Boolean, Object], default: 'yes' },
        trueValue: { type: null, default: true },
        falseValue: { type: null, default: false },
        checked: { type: Boolean, default: false },
        /** solid | outline | subtle | text | styled */
        variant: { type: String, default: 'outline' },
        theme: { type: String, default: 'primary' },
    },
    setup(props, { emit }) {
        const input = ref(null);
        const field = useField(props, emit, { valued: () => props.value });
        useChoice(props, field, input);

        return { ...field, input, onChange: (event) => field.emitChange(field.model.value, event) };
    },
    expose: ['input'],
});
</script>

<template>
    <label
        class="btn-check"
        :class="[`btn-${variant}`, `theme-${theme}`, { 'is-invalid': isInvalid, disabled: isDisabled }]"
    >
        <input
            ref="input"
            v-model="model"
            :name="name"
            :type="type"
            :value="value"
            :true-value="trueValue"
            :false-value="falseValue"
            :required="required"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            autocomplete="off"
            :class="{ 'is-invalid': isInvalid }"
            @change="onChange"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <slot />
    </label>
</template>
