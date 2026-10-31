<script>
import { computed, defineComponent, nextTick, watch, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';

/** Bootstrap 6 range slider (`.form-range` + `.form-range-input`) with optional value bubble and ticks. */
export default defineComponent({
    name: 'RangeInput',
    emits: ['update:modelValue', 'change', 'input', 'focus', 'blur'],
    props: {
        ...fieldProps,
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        step: { type: Number, default: 1 },
        /** Show the current value above the thumb. */
        bubble: { type: Boolean, default: false },
        /** (value:number) => string — formats the bubble and the tick labels. */
        formatter: { type: Function, default: null },
        /** Tick marks: numbers or { value, label } objects. */
        ticks: { type: Array, default: () => [] },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const el = ref(null);
        const input = ref(null);

        const current = computed(() => {
            const n = Number(field.model.value);
            return field.model.value === null || field.model.value === undefined || Number.isNaN(n) ? props.min : n;
        });

        const listId = computed(() => (props.ticks.length ? `${field.inputId.value}-ticks` : undefined));
        const tickItems = computed(() =>
            props.ticks.map((t) => (typeof t === 'object' && t !== null ? t : { value: t, label: props.formatter ? props.formatter(t) : String(t) }))
        );

        function onInput(event) {
            const n = Number(event.target.value);
            field.model.value = n;
            emit('input', n, event);
        }

        const { instance, create } = useBsInstance(
            'Range',
            () => el.value,
            () => ({ bubble: props.bubble, formatter: props.formatter })
        );

        // The thumb / fill / bubble are recalculated when the value is changed from the outside
        watch(
            () => [field.model.value, props.min, props.max],
            () => nextTick(() => instance.value?.update()),
            { flush: 'post' }
        );

        // Ticks, bubble and formatter are read when the plugin is constructed
        watch(
            () => [props.bubble, props.formatter, props.ticks, props.min, props.max],
            async () => {
                await nextTick();
                create();
            },
            { deep: true }
        );

        return { ...field, el, input, current, listId, tickItems, onInput };
    },
});
</script>

<template>
    <div ref="el" class="form-range">
        <input
            ref="input"
            type="range"
            class="form-range-input"
            :class="{ 'is-invalid': isInvalid }"
            :name="name"
            :id="inputId"
            :min="min"
            :max="max"
            :step="step"
            :list="listId"
            :disabled="isDisabled || readonly"
            :aria-invalid="isInvalid || undefined"
            :value="current"
            @input="onInput"
            @change="emitChange(Number($event.target.value), $event)"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <datalist v-if="listId" :id="listId">
            <option v-for="tick in tickItems" :key="tick.value" :value="tick.value" :label="tick.label"></option>
        </datalist>
    </div>
</template>
