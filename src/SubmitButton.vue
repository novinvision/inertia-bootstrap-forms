<script>
import { computed, defineComponent, inject } from 'vue';
import { useI18n } from './i18n.js';

export default defineComponent({
    name: 'SubmitButton',
    emits: ['click'],
    props: {
        disabled: { type: Boolean, default: false },
        /** Force the loading state (otherwise it follows form.processing / form.uploading). */
        loading: { type: Boolean, default: null },
        /** Bootstrap 6 button variant: solid | outline | subtle | text | styled | link. Use null to supply your own classes. */
        variant: { type: String, default: 'solid' },
        /** Bootstrap 6 theme: primary | secondary | accent | success | danger | warning | info | inverse. */
        theme: { type: String, default: 'primary' },
        locale: { type: String, default: null },
    },
    setup(props, { emit }) {
        const formRef = inject('form', null);
        const form = computed(() => formRef?.value ?? null);
        const { t } = useI18n(() => props.locale);

        const busy = computed(() =>
            props.loading !== null ? props.loading : !!(form.value?.processing || form.value?.uploading)
        );

        const classes = computed(() => [
            props.variant ? `btn-${props.variant}` : null,
            props.theme && props.variant ? `theme-${props.theme}` : null,
        ]);

        return { form, busy, classes, t, onClick: (e) => emit('click', e) };
    },
});
</script>

<template>
    <button type="submit" :class="classes" :disabled="disabled || busy" :aria-busy="busy || undefined" @click="onClick">
        <span v-if="busy" class="spinner-border spinner-sm me-2" role="status" aria-hidden="true"></span>
        <slot :form="form" :loading="busy">{{ t('submit.default') }}</slot>
        <slot name="progress" :progress="form?.uploading">
            <span v-if="form?.uploading" class="fanum">{{ form.uploading }}%</span>
        </slot>
    </button>
</template>
