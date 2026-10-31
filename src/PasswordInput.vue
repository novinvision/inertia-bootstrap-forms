<script>
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import TextInput from './TextInput.vue';
import FormAdornInput from './FormAdornInput.vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';
import { useI18n } from './i18n.js';

const STRENGTH_MESSAGES = {
  en: { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' },
  fa: { weak: 'ضعیف', fair: 'متوسط', good: 'خوب', strong: 'قوی' },
};

/**
 * Password field.
 *  - `toggle`   adds a show / hide button (Bootstrap 6 form-adorn)
 *  - `strength` adds the Bootstrap 6 strength meter under the field (optional)
 *
 * Every other prop / listener (placeholder, size, autocomplete, @change, …) is forwarded to the input.
 */
export default defineComponent({
  name: 'PasswordInput',
  components: { TextInput, FormAdornInput },
  inheritAttrs: false,
  emits: ['toggle', 'strength'],
  props: {
    ...fieldProps,
    name: { type: String, default: 'password' },
    placeholder: { type: String, default: null },
    /** Show a "reveal password" button. */
    toggle: { type: Boolean, default: false },
    /** Show the password strength meter. */
    strength: { type: Boolean, default: false },
    /** Show the text feedback ("Weak", "Strong", …) under the meter. */
    strengthText: { type: Boolean, default: true },
    /** Override the labels: { weak, fair, good, strong }. */
    strengthMessages: { type: Object, default: null },
    /** Bootstrap Strength options: { minLength, thresholds: [2, 4, 6], weights, scorer(password) => number }. */
    strengthOptions: { type: Object, default: () => ({}) },
    size: { type: String, default: null },
    locale: { type: String, default: null },
  },
  setup(props, { emit, expose }) {
    const { t, locale } = useI18n(() => props.locale);
    // read-only access to the value (so the meter follows form resets / external changes)
    const field = useField(props, () => {});

    const root = ref(null);
    const meter = ref(null);
    const visible = ref(false);

    const messages = computed(() => ({
      ...(STRENGTH_MESSAGES[locale.value] || STRENGTH_MESSAGES.en),
      ...(props.strengthMessages || {}),
    }));

    function toggleVisible() {
      visible.value = !visible.value;
      emit('toggle', visible.value);
    }

    let offs = [];
    const { instance, create } = useBsInstance(
        'Strength',
        () => (props.strength ? meter.value : null),
        () => ({
          ...props.strengthOptions,
          input: root.value?.querySelector('input'),
          messages: messages.value,
        }),
        {
          onCreate(inst, el) {
            const handler = (e) => emit('strength', e.strength ?? null, e.score ?? 0);
            el.addEventListener('strengthChange.bs.strength', handler);
            offs.push(() => el.removeEventListener('strengthChange.bs.strength', handler));
          },
          onDestroy() {
            offs.forEach((off) => off());
            offs = [];
          },
        }
    );

    // the plugin only listens to typing: re-evaluate when the value changes from the outside (reset, server data)
    watch(
        () => field.model.value,
        () => nextTick(() => instance.value?.evaluate())
    );

    // things the plugin reads when it is created
    watch(
        () => [props.strength, props.toggle, props.strengthText, messages.value, props.strengthOptions],
        async () => {
          await nextTick();
          if (props.strength) create();
        },
        { deep: true }
    );

    expose({ strength: () => instance.value?.getStrength?.() ?? null });

    // props that are forwarded to the real input component
    const forwarded = computed(() => ({
      name: props.name,
      modelValue: props.modelValue,
      id: props.id,
      disabled: props.disabled,
      readonly: props.readonly,
      required: props.required,
      invalid: props.invalid,
      size: props.size,
      placeholder: props.placeholder ?? t('password.placeholder'),
    }));

    return { t, root, meter, visible, toggleVisible, forwarded };
  },
});
</script>

<template>
  <div ref="root" class="password-input">
    <FormAdornInput
        v-if="toggle"
        v-bind="{ ...$attrs, ...forwarded }"
        :type="visible ? 'text' : 'password'"
        autocomplete="current-password"
    >
      <template #end>
        <button
            type="button"
            class="btn-text theme-secondary btn-icon"
            :aria-label="visible ? t('password.hide') : t('password.show')"
            :aria-pressed="visible"
            @click="toggleVisible"
        >
          <svg v-if="!visible" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z" /><circle cx="8" cy="8" r="2" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 2l12 12M6.6 3.7A7 7 0 0 1 8 3.5C12.5 3.5 15 8 15 8a11 11 0 0 1-2.2 2.6M4 5.4A11 11 0 0 0 1 8s2.5 4.5 7 4.5c1 0 1.9-.2 2.7-.6" />
          </svg>
        </button>
      </template>
    </FormAdornInput>
    <TextInput v-else v-bind="{ ...$attrs, ...forwarded }" type="password" autocomplete="current-password" />

    <template v-if="strength">
      <div ref="meter" class="strength" aria-hidden="true">
        <div class="strength-segment"></div>
        <div class="strength-segment"></div>
        <div class="strength-segment"></div>
        <div class="strength-segment"></div>
      </div>
      <div v-if="strengthText" class="strength-text" aria-live="polite"></div>
    </template>
  </div>
</template>