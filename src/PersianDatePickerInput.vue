<script>
import {computed, defineAsyncComponent, defineComponent, inject} from "vue";

const Vue3PersianDatetimePicker = defineAsyncComponent(() =>
    import('vue3-persian-datetime-picker')
);

let _this;
export default defineComponent({
  components: {Vue3PersianDatetimePicker},
  emits: ['update:modelValue', 'change'],
  props: {
    name: {
      type: String,
      required: true,
    },
    calendar: {
      type: String,
      default: 'date',
    },
    view: {
      type: String,
      default: 'date',
    },
    disabled: Boolean,
    min: String,
    max: String,
    range: Boolean,
    locale: {
      default: 'fa',
    },
    format: {
      type: String,
      default: 'jYYYY/jMM/jDD',
    },
    inputFormat: {
      type: String,
      default: null,
    },
    simple: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
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

    return {modelValue, form, group};
  },
  watch: {
    modelValue: (newVal, oldVal) => {
      _this?.$emit('change', newVal, oldVal);
    }
  },
  methods: {
    clear() {
      this.modelValue = null;
    },
  },
  mounted() {
    _this = this;
  },
  computed: {
    isSsr() {
      return !window || typeof window === 'undefined';
    },
    inputID() {
      return this.form.getID(this)
    }
  },
  data() {
    return {}
  }
})
</script>

<template>
  <template v-if="!isSsr">

    <Vue3PersianDatetimePicker
        v-model="modelValue"
        :type="calendar"
        editable
        jumpminute="15"
        :disabled="form?.processing || disabled"
        :roundminute="true"
        :showNowBtn="true"
        :autoSubmit="true"
        :inputFormat="(inputFormat ? inputFormat : format)"
        input-class="form-control"
        v-bind="$props"/>
  </template>

</template>
<style>
.vpd-main .vpd-input-group {
  display: block !important;
}

.vpd-main .vpd-input-group input {
  padding: 0.375rem 0.75rem !important;
  border-radius: var(--bs-border-radius, .5rem) !important;
  line-height: var(--bs-body-line-height, 1.5) !important;
  border: 1px solid var(--bs-border-color, #dadada) !important
}

.vpd-main .vpd-icon-btn {
  position: absolute;
  right: 5px;
  left: auto;
  top: 0;
  bottom: 0;
  height: 30px;
  min-width: 40px;
  border: 1px solid var(--bs-secondary) !important;
  background-color: var(--bs-secondary-bg) !important;
  color: var(--bs-body-color, #000) !important;
  border-radius: var(--bs-border-radius, .5rem);
  margin: auto;
  transition: all ease 0.3s;
}

.vpd-main .vpd-icon-btn svg {
  fill: var(--bs-body-color, #000) !important;
  transition: all ease 0.3s;
}

.vpd-main .vpd-icon-btn:hover {
  background-color: var(--bs-secondary) !important;
  color: var(--bs-body-color) !important;
}

.vpd-main .vpd-icon-btn:hover svg {
  fill: var(--bs-body-bg, #000) !important;
}

.vpd-content {
  color: var(--bs-body-color) !important;
  background-color: var(--bs-body-bg) !important;
  -moz-font-feature-settings: "ss01";
  -webkit-font-feature-settings: "ss01";
  font-feature-settings: "ss01";
}

.vpd-time .vpd-down-arrow-btn, .vpd-time .vpd-up-arrow-btn {
  text-align: center;
}

.vpd-time .vpd-down-arrow-btn svg,
.vpd-time .vpd-up-arrow-btn svg {
  margin: 0 auto;
}

.vpd-controls button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vpd-month-label {
  width: 110px;
}
</style>
