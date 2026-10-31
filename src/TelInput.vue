<script>
import { computed, defineAsyncComponent, defineComponent, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

const VueTelInput = defineAsyncComponent(() => import('vue-tel-input').then((m) => m.VueTelInput));

/**
 * International phone input (vue-tel-input). The stored value is the international number (E.164 style).
 * Remember to import `vue-tel-input/vue-tel-input.css` in your application.
 */
export default defineComponent({
    name: 'TelInput',
    components: { VueTelInput },
    emits: ['update:modelValue', 'change', 'validate', 'country-changed', 'focus', 'blur'],
    props: {
        ...fieldProps,
        placeholder: { type: String, default: '000 000 0000' },
        /** Legacy alias of `placeholder`. */
        placeHolder: { type: String, default: null },
        defaultCountry: { type: String, default: 'ir' },
        preferredCountries: { type: Array, default: () => ['ir', 'us', 'tr', 'ca'] },
        mode: { type: String, default: 'national' },
        validCharactersOnly: { type: Boolean, default: true },
        /** Mark the field invalid as soon as the typed number is not valid. */
        validate: { type: Boolean, default: true },
        searchPlaceholder: { type: String, default: 'Search…' },
        dropdownOptions: { type: Object, default: () => ({}) },
        inputOptions: { type: Object, default: () => ({}) },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const text = ref(field.model.value ?? '');
        const valid = ref(null);
        let lastEmitted = field.model.value ?? '';

        // External changes (form reset, server data) → refresh the visible text
        watch(
            () => field.model.value,
            (v) => {
                if ((v ?? '') !== lastEmitted) text.value = v ?? '';
            }
        );

        function onInput(number, phone) {
            lastEmitted = phone?.number ?? '';
            field.model.value = lastEmitted;
            valid.value = phone?.valid ?? null;
            emit('validate', valid.value, phone);
            field.emitChange(lastEmitted);
        }

        return {
            ...field,
            text,
            valid,
            onInput,
            dropdown: computed(() => ({
                showDialCodeInList: true,
                showDialCodeInSelection: true,
                showSearchBox: true,
                searchBoxPlaceholder: props.searchPlaceholder,
                showFlags: false,
                ...props.dropdownOptions,
            })),
            inputOpts: computed(() => ({
                placeholder: props.placeHolder ?? props.placeholder,
                id: field.inputId.value,
                name: props.name,
                readonly: props.readonly,
                ...props.inputOptions,
            })),
            invalidClass: computed(() => field.isInvalid.value || (props.validate && valid.value === false)),
        };
    },
});
</script>

<template>
    <div class="telephone-input input-group fanum" dir="ltr">
        <VueTelInput
            v-model="text"
            :mode="mode"
            :valid-characters-only="validCharactersOnly"
            :default-country="defaultCountry"
            :preferred-countries="preferredCountries"
            :disabled="isDisabled"
            :dropdown-options="dropdown"
            :input-options="inputOpts"
            :style-classes="'form-control form-control-tel fanum' + (invalidClass ? ' is-invalid' : '')"
            @on-input="onInput"
            @country-changed="$emit('country-changed', $event)"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
    </div>
</template>
