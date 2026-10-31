<script>
import { defineComponent, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useChoice } from './composables/useChoice.js';

/** Bootstrap 6 switch: `.switch` wrapper around `<input type="checkbox" role="switch" switch>`. */
export default defineComponent({
    name: 'SwitchInput',
    emits: ['update:modelValue', 'change', 'focus', 'blur'],
    props: {
        ...fieldProps,
        value: { type: [String, Number, Boolean, Object], default: null },
        trueValue: { type: null, default: true },
        falseValue: { type: null, default: false },
        checked: { type: Boolean, default: false },
        label: { type: String, default: null },
    },
    setup(props, { emit }) {
        const input = ref(null);
        const field = useField(props, emit, { valued: () => props.value });
        useChoice(props, field, input, { type: () => 'checkbox' });

        return {
            ...field,
            input,
            onChange: (event) => field.emitChange(field.model.value, event),
        };
    },
    expose: ['input'],
});
</script>

<template>
    <div class="form-field">
        <div class="switch">
            <input
                ref="input"
                v-model="model"
                :name="name"
                :id="inputId"
                type="checkbox"
                role="switch"
                switch
                :value="value ?? undefined"
                :true-value="trueValue"
                :false-value="falseValue"
                :required="required"
                :disabled="isDisabled"
                :aria-invalid="isInvalid || undefined"
                :class="{ 'is-invalid': isInvalid }"
                @change="onChange"
                @focus="$emit('focus', $event)"
                @blur="$emit('blur', $event)"
            />
        </div>
        <label :for="inputId"><slot>{{ label }}</slot></label>
    </div>
</template>
