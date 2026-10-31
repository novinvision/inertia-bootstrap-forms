<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

/** Star rating with fractional precision, pointer + keyboard support and RTL awareness. */
export default defineComponent({
    name: 'StarRatingInput',
    emits: ['update:modelValue', 'change', 'hover'],
    props: {
        ...fieldProps,
        /** Initial rating used when the model is empty. */
        value: { type: Number, default: 0 },
        maxStars: { type: Number, default: 5 },
        /** Steps per star: 1 = whole stars, 2 = half stars, 4 = quarter stars… */
        precision: { type: Number, default: 2 },
        showValue: { type: Boolean, default: true },
        /** Allow clicking the current rating again to reset it to 0. */
        clearable: { type: Boolean, default: false },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const container = ref(null);
        const hovered = ref(null);
        const isRTL = ref(false);

        onMounted(() => {
            if (container.value) isRTL.value = getComputedStyle(container.value).direction === 'rtl';
        });

        const locked = computed(() => props.readonly || field.isDisabled.value);
        const stored = computed(() => {
            const n = Number(field.model.value);
            return field.model.value === null || field.model.value === undefined || Number.isNaN(n) ? props.value : n;
        });
        const rating = computed(() => hovered.value ?? stored.value);
        const step = computed(() => 1 / props.precision);

        const fillOf = (star) => Math.max(0, Math.min(1, rating.value - (star - 1))) * 100;

        function ratingFromPointer(event) {
            const rect = container.value.getBoundingClientRect();
            const offset = isRTL.value ? rect.right - event.clientX : event.clientX - rect.left;
            const starWidth = rect.width / props.maxStars;
            const raw = Math.ceil((offset / starWidth) * props.precision) / props.precision;
            return Math.min(props.maxStars, Math.max(step.value, raw));
        }

        function onMove(event) {
            if (locked.value) return;
            hovered.value = ratingFromPointer(event);
            emit('hover', hovered.value);
        }

        function leave() {
            hovered.value = null;
        }

        function commit(next, event) {
            if (locked.value) return;
            const value = props.clearable && next === stored.value ? 0 : next;
            field.model.value = value;
            field.emitChange(value, event);
        }

        function onClick(event) {
            if (locked.value) return;
            commit(ratingFromPointer(event), event);
        }

        function onKeydown(event) {
            if (locked.value) return;
            const forward = isRTL.value ? 'ArrowLeft' : 'ArrowRight';
            const backward = isRTL.value ? 'ArrowRight' : 'ArrowLeft';
            let next = null;

            if (event.key === forward || event.key === 'ArrowUp') next = stored.value + step.value;
            else if (event.key === backward || event.key === 'ArrowDown') next = stored.value - step.value;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = props.maxStars;

            if (next !== null) {
                event.preventDefault();
                commit(Math.min(props.maxStars, Math.max(0, Number(next.toFixed(4)))), event);
            }
        }

        return {
            ...field,
            container,
            rating,
            stored,
            fillOf,
            onMove,
            leave,
            onClick,
            onKeydown,
            locked,
            display: computed(() => rating.value.toFixed(1)),
        };
    },
});
</script>

<template>
    <div class="star-rating d-flex align-items-center gap-2" :class="{ 'is-invalid': isInvalid }">
        <div
            ref="container"
            class="star-rating-container d-flex position-relative"
            role="slider"
            :tabindex="locked ? -1 : 0"
            :aria-valuemin="0"
            :aria-valuemax="maxStars"
            :aria-valuenow="stored"
            :aria-readonly="locked || undefined"
            :aria-invalid="isInvalid || undefined"
            :style="{ cursor: locked ? 'default' : 'pointer' }"
            @pointermove="onMove"
            @pointerleave="leave"
            @click="onClick"
            @keydown="onKeydown"
        >
            <span v-for="star in maxStars" :key="star" class="star-wrapper position-relative d-inline-block fs-2xl lh-1">
                <span class="star-bg fg-secondary opacity-50" aria-hidden="true">★</span>
                <span
                    class="star-overlay fg-warning"
                    aria-hidden="true"
                    :style="{ position: 'absolute', top: 0, insetInlineStart: 0, overflow: 'hidden', whiteSpace: 'nowrap', width: fillOf(star) + '%' }"
                >★</span>
            </span>
        </div>
        <input v-if="name" type="hidden" :name="name" :value="stored" />
        <span v-if="showValue && rating > 0" class="rating-value fanum">{{ display }}</span>
    </div>
</template>
