<script>
import { defineAsyncComponent, defineComponent, onMounted, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

const Vue3PersianDatetimePicker = defineAsyncComponent(() => import('vue3-persian-datetime-picker'));

/**
 * Jalali (Persian) date / time picker based on vue3-persian-datetime-picker.
 * Bootstrap 6's own Datepicker does not support the Jalali calendar, so this library is kept on purpose.
 */
export default defineComponent({
    name: 'PersianDatePickerInput',
    components: { Vue3PersianDatetimePicker },
    emits: ['update:modelValue', 'change', 'open', 'close'],
    props: {
        ...fieldProps,
        /** date | datetime | time | year-month | month */
        calendar: { type: String, default: 'date' },
        view: { type: String, default: 'date' },
        min: { type: String, default: null },
        max: { type: String, default: null },
        range: { type: Boolean, default: false },
        locale: { type: String, default: 'fa' },
        /** Format of the stored value. */
        format: { type: String, default: 'jYYYY/jMM/jDD' },
        /** Format shown in the input (defaults to `format`). */
        inputFormat: { type: String, default: null },
        placeholder: { type: String, default: null },
        inputClass: { type: String, default: 'form-control fanum' },
        /** Extra props forwarded to vue3-persian-datetime-picker. */
        pickerOptions: { type: Object, default: () => ({}) },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const ready = ref(false);

        onMounted(() => {
            ready.value = true; // the picker needs the DOM, so it is never rendered during SSR
        });

        watch(
            () => field.model.value,
            (now, before) => emit('change', now, before)
        );

        expose({ clear: () => (field.model.value = null) });

        return { ...field, ready };
    },
});
</script>

<template>
    <Vue3PersianDatetimePicker
        v-if="ready"
        v-model="model"
        :name="name"
        :id="inputId"
        :type="calendar"
        :view="view"
        :min="min"
        :max="max"
        :range="range"
        :locale="locale"
        :format="format"
        :input-format="inputFormat || format"
        :placeholder="placeholder"
        :disabled="isDisabled || readonly"
        :input-class="[inputClass, { 'is-invalid': isInvalid }]"
        editable
        jumpminute="15"
        :roundminute="true"
        :show-now-btn="true"
        :auto-submit="true"
        v-bind="pickerOptions"
        @open="$emit('open')"
        @close="$emit('close')"
    />
    <input v-else type="text" class="form-control" :class="{ 'is-invalid': isInvalid }" :placeholder="placeholder" disabled />
</template>
