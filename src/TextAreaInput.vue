<script>
import { computed, defineComponent } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

export default defineComponent({
    name: 'TextAreaInput',
    emits: ['update:modelValue', 'change', 'input', 'focus', 'blur'],
    props: {
        ...fieldProps,
        rows: { type: [Number, String], default: 3 },
        placeholder: { type: String, default: null },
        size: { type: String, default: null },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const sizeClass = computed(() => (props.size ? `form-control-${props.size}` : null));
        return { ...field, sizeClass, emit };
    },
});
</script>

<template>
    <textarea
        v-model="model"
        :name="name"
        :id="inputId"
        :rows="rows"
        :placeholder="placeholder"
        :required="required"
        :readonly="readonly"
        :disabled="isDisabled"
        :aria-invalid="isInvalid || undefined"
        class="form-control"
        :class="[sizeClass, { 'is-invalid': isInvalid }]"
        @input="emit('input', model, $event)"
        @change="emitChange(model, $event)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
    ></textarea>
</template>
