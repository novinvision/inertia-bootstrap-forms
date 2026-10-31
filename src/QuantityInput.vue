<script>
import { computed, defineComponent, onMounted } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useI18n } from './i18n.js';
import { formatNumber, parseDigits } from './utils/digits.js';

/** Numeric stepper: [ − ] [ value ] [ + ] unit. */
export default defineComponent({
    name: 'QuantityInput',
    emits: ['update:modelValue', 'change', 'input', 'increment', 'decrement', 'focus', 'blur'],
    props: {
        ...fieldProps,
        min: { type: Number, default: 0 },
        max: { type: Number, default: null },
        step: { type: Number, default: 1 },
        unit: { type: String, default: null },
        size: { type: String, default: null },
        locale: { type: String, default: null },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);

        const current = computed(() => {
            const n = Number(field.model.value);
            return Number.isFinite(n) ? n : props.min;
        });

        const unitText = computed(() => props.unit ?? t('quantity.unit'));
        const display = computed(() => formatNumber(current.value));
        const lock = computed(() => props.readonly || field.isDisabled.value);
        const canIncrement = computed(() => !lock.value && (props.max === null || current.value + props.step <= props.max));
        const canDecrement = computed(() => !lock.value && current.value - props.step >= props.min);

        function set(next, event, kind) {
            let n = next;
            if (props.max !== null) n = Math.min(n, props.max);
            n = Math.max(n, props.min);
            field.model.value = n;
            if (kind) emit(kind, n);
            field.emitChange(n, event);
        }

        function onInput(event) {
            const parsed = parseDigits(event.target.value);
            field.model.value = parsed === null ? props.min : parsed;
            event.target.value = formatNumber(field.model.value);
            emit('input', field.model.value, event);
        }

        onMounted(() => {
            // A quantity is never empty: initialise it with the minimum
            const v = field.model.value;
            if (v === null || v === undefined || v === '') field.model.value = props.min;
        });

        return {
            ...field,
            t,
            unitText,
            display,
            canIncrement,
            canDecrement,
            lock,
            increment: (e) => canIncrement.value && set(current.value + props.step, e, 'increment'),
            decrement: (e) => canDecrement.value && set(current.value - props.step, e, 'decrement'),
            onInput,
            clampOnBlur: (e) => set(current.value, e),
        };
    },
});
</script>

<template>
    <div class="input-group input-group-quantity" :class="{ 'is-invalid': isInvalid }">
        <button
            type="button"
            class="btn-outline theme-secondary btn-icon"
            :disabled="!canIncrement"
            :aria-label="t('quantity.increase')"
            @click="increment"
        >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
        </button>
        <input
            :name="name"
            :id="inputId"
            :value="display"
            :readonly="readonly"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            class="form-control fanum text-center"
            :class="{ 'is-invalid': isInvalid }"
            @input="onInput"
            @change="clampOnBlur"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <button
            type="button"
            class="btn-outline theme-secondary btn-icon"
            :disabled="!canDecrement"
            :aria-label="t('quantity.decrease')"
            @click="decrement"
        >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10" /></svg>
        </button>
        <span v-if="unitText" class="input-group-text fanum">{{ unitText }}</span>
        <slot name="suffix" />
    </div>
</template>
