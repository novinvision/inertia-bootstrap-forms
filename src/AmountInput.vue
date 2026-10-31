<script>
import { computed, defineComponent } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useI18n } from './i18n.js';
import { formatNumber, parseDigits, toEnglishDigits } from './utils/digits.js';

/** Integer input with thousands separators and a unit (Bootstrap 6 `.input-group`). */
export default defineComponent({
    name: 'AmountInput',
    emits: ['update:modelValue', 'change', 'input', 'focus', 'blur'],
    props: {
        ...fieldProps,
        placeholder: { type: String, default: null },
        unit: { type: String, default: null },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        inputClass: { type: [String, Array, Object], default: null },
        size: { type: String, default: null },
        locale: { type: String, default: null },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);

        const displayValue = computed(() => formatNumber(field.model.value));
        const unitText = computed(() => props.unit ?? t('amount.unit'));
        const sizeClass = computed(() => (props.size ? `form-control-${props.size}` : null));

        function onInput(event) {
            const el = event.target;
            const before = el.value.slice(0, el.selectionStart ?? 0);
            const digitsBefore = toEnglishDigits(before).replace(/\D/g, '').length;

            const parsed = parseDigits(el.value);
            field.model.value = parsed;

            // Re-format immediately and keep the caret after the same number of digits
            const formatted = formatNumber(parsed);
            el.value = formatted;
            let pos = 0;
            let seen = 0;
            while (pos < formatted.length && seen < digitsBefore) {
                if (/\d/.test(formatted[pos])) seen++;
                pos++;
            }
            if (document.activeElement === el) el.setSelectionRange(pos, pos);

            emit('input', parsed, event);
        }

        function clamp(event) {
            let v = field.model.value;
            if (v !== null && v !== undefined) {
                if (props.max !== null && v > props.max) v = props.max;
                if (props.min !== null && v < props.min) v = props.min;
                if (v !== field.model.value) field.model.value = v;
            }
            field.emitChange(v, event);
        }

        return { ...field, displayValue, unitText, sizeClass, onInput, clamp, t };
    },
});
</script>

<template>
    <div class="input-group" :class="{ 'is-invalid': isInvalid }">
        <slot name="prefix" />
        <input
            :name="name"
            :id="inputId"
            :value="displayValue"
            :placeholder="placeholder ?? t('amount.placeholder')"
            :required="required"
            :readonly="readonly"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            class="form-control fanum"
            :class="[sizeClass, inputClass, { 'is-invalid': isInvalid }]"
            @input="onInput"
            @change="clamp"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <span v-if="unitText" class="input-group-text fanum">{{ unitText }}</span>
        <slot name="suffix" />
    </div>
</template>
