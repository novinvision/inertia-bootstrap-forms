<script>
import { defineComponent, nextTick, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';
import { useI18n } from './i18n.js';

const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Bootstrap 6 Chip input (tags). The value is an array of strings stored in the FormContainer's v-model.
 */
export default defineComponent({
    name: 'ChipsInput',
    emits: ['update:modelValue', 'change', 'add', 'remove', 'select', 'rejected', 'focus', 'blur'],
    props: {
        ...fieldProps,
        placeholder: { type: String, default: null },
        /** Character that splits typed / pasted text into chips. Use null to disable. */
        separator: { type: String, default: ',' },
        allowDuplicates: { type: Boolean, default: false },
        maxChips: { type: Number, default: null },
        dismissible: { type: Boolean, default: true },
        /** HTML / SVG of the remove icon (sanitised by Bootstrap). */
        dismissIcon: { type: String, default: null },
        /** Turn the pending text into a chip when the input loses focus. */
        createOnBlur: { type: Boolean, default: true },
        /** (value: string) => boolean — return false to reject a chip. */
        validator: { type: Function, default: null },
        locale: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const el = ref(null);
        const ghost = ref(null);
        let syncing = false;
        let offs = [];

        const toValues = (model) => {
            if (Array.isArray(model)) return model.map(String);
            if (typeof model === 'string' && model !== '') {
                return props.separator ? model.split(props.separator).map((s) => s.trim()).filter(Boolean) : [model];
            }
            return [];
        };

        function syncFromModel() {
            const inst = instance.value;
            if (!inst) return;

            const target = toValues(field.model.value);
            if (sameList(inst.getValues(), target)) return;

            syncing = true;
            try {
                inst.clear();
                target.forEach((v) => inst.add(v));
            } finally {
                syncing = false;
            }

            // Some values may have been rejected (duplicates / maxChips): reflect the truth
            const actual = inst.getValues();
            if (!sameList(actual, target) && Array.isArray(field.model.value)) field.model.value = actual;
        }

        const locked = () => props.readonly || field.isDisabled.value;

        const { instance, create } = useBsInstance(
            'Chips',
            () => el.value,
            () => {
                const config = {
                    separator: props.separator,
                    allowDuplicates: props.allowDuplicates,
                    maxChips: props.maxChips,
                    dismissible: props.dismissible && !locked(),
                    createOnBlur: props.createOnBlur,
                    placeholder: props.placeholder ?? t('chips.placeholder'),
                };
                if (props.dismissIcon) config.dismissIcon = props.dismissIcon;
                return config;
            },
            {
                onCreate(inst, element) {
                    const on = (type, fn) => {
                        element.addEventListener(type, fn);
                        offs.push(() => element.removeEventListener(type, fn));
                    };

                    on('add.bs.chips', (e) => {
                        if (syncing) return;
                        if (props.validator && !props.validator(e.value)) {
                            e.preventDefault();
                            emit('rejected', e.value);
                            return;
                        }
                        emit('add', e.value);
                    });
                    on('remove.bs.chips', (e) => !syncing && emit('remove', e.value));
                    on('select.bs.chips', (e) => emit('select', e.selected));
                    on('change.bs.chips', (e) => {
                        if (syncing) return;
                        field.model.value = e.values;
                        field.emitChange(e.values, e);
                    });

                    syncFromModel();
                },
                onDestroy() {
                    offs.forEach((off) => off());
                    offs = [];
                },
            }
        );

        watch(() => field.model.value, syncFromModel, { deep: true });

        // Options that are only read when the plugin is constructed
        watch(
            () => [props.separator, props.allowDuplicates, props.maxChips, props.dismissible, props.createOnBlur, props.dismissIcon, props.readonly, field.isDisabled.value],
            async () => {
                await nextTick();
                create();
            }
        );

        expose({
            add: (value) => instance.value?.add(value),
            remove: (value) => instance.value?.remove(value),
            clear: () => instance.value?.clear(),
            focus: () => ghost.value?.focus(),
        });

        return { ...field, t, el, ghost, locked };
    },
});
</script>

<template>
    <div ref="el" class="chip-input" :aria-disabled="isDisabled || undefined">
        <input
            ref="ghost"
            type="text"
            class="form-ghost"
            :id="inputId"
            :class="{ 'is-invalid': isInvalid }"
            :placeholder="placeholder ?? t('chips.placeholder')"
            :disabled="isDisabled"
            :readonly="readonly"
            :aria-invalid="isInvalid || undefined"
            autocomplete="off"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
    </div>
</template>
