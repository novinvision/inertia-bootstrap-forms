<script>
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';

/**
 * Bootstrap 6 one-time-code input (`data-bs-otp`). A single real <input> backs the visual slots,
 * so password managers and SMS autofill keep working.
 */
export default defineComponent({
    name: 'OTPInput',
    emits: ['update:modelValue', 'change', 'input', 'complete', 'focus', 'blur'],
    props: {
        ...fieldProps,
        /** Number of characters. */
        length: { type: Number, default: null },
        /** Legacy alias of `length`. */
        maxLength: { type: Number, default: null },
        /** numeric | alphanumeric | alpha */
        type: { type: String, default: 'numeric', validator: (v) => ['numeric', 'alphanumeric', 'alpha'].includes(v) },
        /** Show • instead of the typed character. */
        mask: { type: Boolean, default: false },
        /** Visual grouping, e.g. [3, 3] renders `123 · 456`. */
        groups: { type: Array, default: null },
        separator: { type: String, default: '·' },
        /** Submit the surrounding FormContainer as soon as the code is complete. */
        autoSubmit: { type: Boolean, default: false },
        autofocus: { type: Boolean, default: false },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const el = ref(null);
        const input = ref(null);
        let syncing = false;
        let offs = [];

        const resolvedLength = () => props.length ?? props.maxLength ?? 6;
        const asText = (v) => (v === null || v === undefined ? '' : String(v));

        function syncInvalid() {
            // Bootstrap adds its own classes to this input, so the state is toggled through classList
            input.value?.classList.toggle('is-invalid', field.isInvalid.value);
        }

        function syncFromModel() {
            const inst = instance.value;
            if (!inst) return;
            const text = asText(field.model.value);
            if (inst.getValue() === text) return;

            syncing = true;
            try {
                inst.setValue(text);
            } finally {
                syncing = false;
            }
        }

        const { instance, create } = useBsInstance(
            'OtpInput',
            () => el.value,
            () => ({
                length: resolvedLength(),
                type: props.type,
                mask: props.mask,
                groups: props.groups,
                separator: props.separator,
            }),
            {
                onCreate(inst, element) {
                    const on = (type, fn) => {
                        element.addEventListener(type, fn);
                        offs.push(() => element.removeEventListener(type, fn));
                    };

                    on('input.bs.otpInput', (e) => {
                        if (syncing) return;
                        field.model.value = e.value;
                        emit('input', e.value, e);
                        field.emitChange(e.value, e);
                    });

                    on('complete.bs.otpInput', (e) => {
                        if (syncing) return;
                        emit('complete', e.value);
                        if (props.autoSubmit) field.formApi?.submit?.();
                    });

                    syncFromModel();
                    syncInvalid();
                    if (props.autofocus) inst.focus();
                },
                onDestroy() {
                    offs.forEach((off) => off());
                    offs = [];
                },
            }
        );

        onMounted(() => {
            // Pre-fill before the plugin is created so it can sanitise the initial value
            if (input.value) input.value.value = asText(field.model.value);
        });

        watch(() => field.model.value, syncFromModel);
        watch(field.isInvalid, syncInvalid, { flush: 'post' });
        watch(
            () => [resolvedLength(), props.type, props.mask, props.groups, props.separator],
            async () => {
                await nextTick();
                create();
            },
            { deep: true }
        );

        expose({
            focus: () => instance.value?.focus(),
            clear: () => {
                instance.value?.clear();
                field.model.value = '';
            },
        });

        return { ...field, el, input };
    },
});
</script>

<template>
    <div ref="el" class="otp fanum">
        <input
            ref="input"
            type="text"
            :name="name"
            :id="inputId"
            :disabled="isDisabled"
            :readonly="readonly"
            :required="required"
            :aria-invalid="isInvalid || undefined"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
    </div>
</template>
