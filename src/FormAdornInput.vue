<script>
import { computed, defineComponent, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

/**
 * Bootstrap 6 `.form-adorn`: an input decorated with icons / text at its start and/or end.
 *
 * <FormAdornInput name="site" start-text="https://" end-text=".com" />
 * <FormAdornInput name="search"><template #start><span class="form-adorn-icon"><svg …/></span></template></FormAdornInput>
 */
export default defineComponent({
    name: 'FormAdornInput',
    inheritAttrs: false,
    emits: ['update:modelValue', 'change', 'input', 'focus', 'blur'],
    props: {
        ...fieldProps,
        type: { type: String, default: 'text' },
        placeholder: { type: String, default: null },
        /** Text shown before the input. */
        startText: { type: String, default: null },
        /** Text shown after the input. */
        endText: { type: String, default: null },
        size: { type: String, default: null },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const input = ref(null);
        const sizeClass = computed(() => (props.size ? `form-control-${props.size}` : null));

        function focusInput(event) {
            if (event.target === event.currentTarget || event.target.closest?.('.form-adorn-icon, .form-adorn-text')) {
                input.value?.focus();
            }
        }

        return { ...field, input, sizeClass, focusInput, emit, focus: () => input.value?.focus() };
    },
    expose: ['focus'],
});
</script>

<template>
    <div
        class="form-control form-adorn"
        :class="[sizeClass, { 'is-invalid': isInvalid }, $attrs.class]"
        :style="$attrs.style"
        @click="focusInput"
    >
        <slot name="start">
            <span v-if="startText" class="form-adorn-text">{{ startText }}</span>
        </slot>
        <input
            ref="input"
            v-model="model"
            v-bind="{ ...$attrs, class: undefined, style: undefined }"
            :name="name"
            :id="inputId"
            :type="type"
            :placeholder="placeholder"
            :required="required"
            :readonly="readonly"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            class="form-ghost"
            :class="{ 'is-invalid': isInvalid }"
            @input="emit('input', model, $event)"
            @change="emitChange(model, $event)"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <slot name="end">
            <span v-if="endText" class="form-adorn-text">{{ endText }}</span>
        </slot>
    </div>
</template>
