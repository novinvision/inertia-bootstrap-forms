<script>
import { defineComponent, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useChoice } from './composables/useChoice.js';

/** Selectable card (Bootstrap 6 `.form-field-card`): the whole card toggles the checkbox / radio. */
export default defineComponent({
    name: 'CheckboxToggle',
    emits: ['update:modelValue', 'change', 'focus', 'blur'],
    props: {
        ...fieldProps,
        type: { type: String, default: 'checkbox', validator: (v) => ['checkbox', 'radio'].includes(v) },
        value: { type: [String, Number, Boolean, Object], default: 'yes' },
        trueValue: { type: null, default: true },
        falseValue: { type: null, default: false },
        checked: { type: Boolean, default: false },
        /** Visually hide the check mark (the card highlight is the only indicator). */
        hideInput: { type: Boolean, default: false },
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
    <div class="form-field form-field-card" :class="{ 'is-invalid': isInvalid, disabled: isDisabled || readonly }">
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
            :class="[type === 'radio' ? 'radio' : 'check', { 'is-invalid': isInvalid, 'visually-hidden': hideInput }]"
            @click="readonly && $event.preventDefault()"
            @change="onChange"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <label :for="inputId"><slot /></label>
    </div>
</template>
