<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useDisposables } from './composables/useDisposables.js';
import { useI18n } from './i18n.js';

/** Captcha image + input + refresh button. The image is refreshed after every finished submit. */
export default defineComponent({
    name: 'CaptchaInput',
    emits: ['update:modelValue', 'change', 'input', 'refresh'],
    props: {
        ...fieldProps,
        name: { type: String, default: 'captcha' },
        /** Endpoint that returns the captcha image. */
        url: { type: String, default: '/captcha/default' },
        placeholder: { type: String, default: null },
        /** Reload the image (and clear the input) when a submit finishes. */
        refreshOnSubmit: { type: Boolean, default: true },
        imageWidth: { type: [Number, String], default: 82 },
        imageHeight: { type: [Number, String], default: 38 },
        locale: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const { t } = useI18n(() => props.locale);
        const d = useDisposables();

        const src = ref(null);
        const loading = ref(true);

        function refresh() {
            loading.value = true;
            src.value = `${props.url}${props.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
            d.timeout(() => {
                loading.value = false;
            }, 500);
            emit('refresh');
        }

        onMounted(refresh);

        watch(
            () => field.form.value?.processing,
            (now, before) => {
                if (props.refreshOnSubmit && before && !now) {
                    field.model.value = null;
                    refresh();
                }
            }
        );

        expose({ refresh });

        return { ...field, t, src, loading, refresh };
    },
});
</script>

<template>
    <div class="input-group captcha" :class="{ 'is-invalid': isInvalid }">
        <input
            v-model="model"
            :name="name"
            :id="inputId"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :placeholder="placeholder ?? t('captcha.placeholder')"
            :required="required"
            :readonly="readonly"
            :disabled="isDisabled"
            :aria-invalid="isInvalid || undefined"
            class="form-control text-start"
            :class="{ 'is-invalid': isInvalid }"
            @input="$emit('input', model, $event)"
            @change="emitChange(model, $event)"
        />
        <span class="input-group-text p-0 overflow-hidden" :style="{ width: imageWidth + 'px', height: 'auto' }">
            <img
                v-if="src && !loading"
                :src="src"
                :alt="t('captcha.alt')"
                :width="imageWidth"
                :height="imageHeight"
                class="captcha-holder"
                :style="{ cursor: 'pointer', objectFit: 'contain' }"
                @click="refresh"
            />
            <span v-else class="placeholder-wave w-100" aria-hidden="true">
                <span class="placeholder w-100" :style="{ height: imageHeight + 'px' }"></span>
            </span>
        </span>
        <button
            type="button"
            class="btn-outline theme-secondary btn-icon"
            :disabled="isDisabled || loading"
            :aria-label="t('captcha.refresh')"
            @click="refresh"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M13.5 3v3.5H10M2.5 13V9.5H6" /><path d="M3.2 6.5A5.5 5.5 0 0 1 13 6.5M12.8 9.5A5.5 5.5 0 0 1 3 9.5" />
            </svg>
        </button>
    </div>
</template>
