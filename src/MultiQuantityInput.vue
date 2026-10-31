<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import GroupControl from './GroupControl.vue';
import QuantityInput from './QuantityInput.vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';
import { useI18n } from './i18n.js';

/**
 * A menu (Bootstrap 6 Menu) with one quantity stepper per option, e.g. passengers: adults / children / infants.
 * The value is an object keyed by option index: { 0: 2, 1: 1, 2: 0 }.
 */
export default defineComponent({
    name: 'MultiQuantityInput',
    components: { GroupControl, QuantityInput },
    emits: ['update:modelValue', 'change', 'show', 'shown', 'hide', 'hidden'],
    props: {
        ...fieldProps,
        /** Array of strings or { name, min, max, description, html }. */
        options: { type: Array, default: () => [] },
        min: { type: Number, default: 0 },
        max: { type: Number, default: null },
        totalMin: { type: Number, default: null },
        totalMax: { type: Number, default: null },
        unit: { type: String, default: null },
        placement: { type: String, default: 'bottom-start' },
        locale: { type: String, default: null },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const toggle = ref(null);

        const quantities = computed(() => {
            const v = field.model.value;
            return v && typeof v === 'object' ? v : {};
        });

        const total = computed(() =>
            props.options.reduce((sum, _, i) => sum + (Number(quantities.value[i]) || 0), 0)
        );

        const unitText = computed(() => props.unit ?? t('quantity.unit'));
        const normalized = computed(() =>
            props.options.map((item, i) => {
                const o = typeof item === 'object' && item !== null ? item : { name: item };
                const own = Number(quantities.value[i]) || 0;
                const itemMax = o.max ?? props.max;
                const room = props.totalMax === null ? Infinity : own + (props.totalMax - total.value);
                return {
                    key: i,
                    name: o.name ?? o.label ?? String(item),
                    description: o.description ?? null,
                    html: !!o.html,
                    min: o.min ?? props.min,
                    max: Math.min(itemMax ?? Infinity, room) === Infinity ? null : Math.min(itemMax ?? Infinity, room),
                };
            })
        );

        onMounted(() => {
            if (!field.model.value || typeof field.model.value !== 'object') {
                field.model.value = props.options.reduce((carry, item, i) => {
                    carry[i] = (typeof item === 'object' && item?.min) || props.min;
                    return carry;
                }, {});
            }
        });

        useBsInstance(
            'Menu',
            () => toggle.value,
            () => ({ autoClose: 'outside', placement: props.placement }),
            {
                onCreate(_, el) {
                    ['show', 'shown', 'hide', 'hidden'].forEach((evt) =>
                        el.addEventListener(`${evt}.bs.menu`, (e) => emit(evt, e))
                    );
                },
            }
        );

        return { ...field, t, toggle, total, unitText, normalized };
    },
});
</script>

<template>
    <div class="multi-quantity-input fanum">
        <button
            ref="toggle"
            type="button"
            class="form-control combobox-toggle"
            data-bs-toggle="menu"
            aria-haspopup="true"
            :disabled="isDisabled || readonly"
            :class="{ 'is-invalid': isInvalid }"
        >
            <span class="combobox-value">{{ total }} {{ unitText }}</span>
        </button>
        <div class="menu p-3">
            <GroupControl :name="name">
                <div
                    v-for="item in normalized"
                    :key="item.key"
                    class="d-flex align-items-center justify-content-between gap-3 py-1"
                >
                    <div>
                        <span v-if="item.html" v-html="item.name"></span>
                        <span v-else>{{ item.name }}</span>
                        <div v-if="item.description" class="form-text mt-0">{{ item.description }}</div>
                    </div>
                    <QuantityInput :name="String(item.key)" :min="item.min" :max="item.max" :readonly="readonly" unit="" />
                </div>
            </GroupControl>
        </div>
    </div>
</template>
