<script>
import {InputGroup, InputGroupText} from 'vue3-bootstrap-components';
import {computed, defineComponent, inject} from "vue";

export default defineComponent({
  components: {InputGroup, InputGroupText},
  props: {
    name: {
      type: String,
      required: true,
    },
    required: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    placeholder: {
      type: String,
      default: 'عدد را وارد کنید'
    },
    unit: {
      type: String,
      default: 'عدد'
    },
  },
  setup(props) {
    let form = inject('form', {
      errors: {},
      getID(name) {
        return name;
      }
    });
    let group = inject('group', {});

    const modelValue = computed({
      get() {
        return (group.value && form.value[group.value.name]) ? group.value?.getData(props.name) : form.value[props.name];
      },
      set(value) {
        if (group?.value?.name) {
          group.value.setData(props.name, value);
        } else {
          form.value[props.name] = value;
        }
      }
    });

    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    function toEnglishDigits(str) {
      return String(str).replace(/[۰-۹٠-٩]/g, (ch) => {
        const pIndex = persianDigits.indexOf(ch);
        if (pIndex !== -1) return pIndex;
        return arabicDigits.indexOf(ch);
      });
    }

    const displayValue = computed({
      get() {
        const raw = modelValue.value;
        if (raw === null || raw === undefined || raw === '') return '';
        return Number(raw).toLocaleString('en-US');
      },
      set(value) {
        const digitsOnly = toEnglishDigits(value).replace(/\D/g, '');
        modelValue.value = digitsOnly === '' ? null : parseInt(digitsOnly, 10);
      }
    });

    return {modelValue, displayValue, form, group};
  },
})
</script>
<template>
  <InputGroup>
    <input
        :name="name"
        v-model="displayValue"
        :class="{'is-invalid': form.errors[name]}"
        :disabled="disabled || form.processing"
        :readonly="readonly"
        :placeholder="placeholder"
        type="tel"
        class="form-control fanum text-start">
    <InputGroupText class="fanum">{{ unit }}</InputGroupText>
    <slot name="suffix"/>
  </InputGroup>
</template>