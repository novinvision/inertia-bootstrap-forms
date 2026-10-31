<script>
import { defineComponent } from 'vue';
import TextInput from './TextInput.vue';
import { useI18n } from './i18n.js';

/** Thin wrapper around TextInput (type="tel"). All TextInput props and events are forwarded. */
export default defineComponent({
    name: 'MobileInput',
    components: { TextInput },
    props: {
        name: { type: String, default: 'mobile' },
        placeholder: { type: String, default: null },
        locale: { type: String, default: null },
    },
    setup(props) {
        const { t } = useI18n(() => props.locale);
        return { t };
    },
});
</script>

<template>
    <TextInput
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        class="form-control-mobile fanum"
        :name="name"
        :placeholder="placeholder ?? t('mobile.placeholder')"
    />
</template>
