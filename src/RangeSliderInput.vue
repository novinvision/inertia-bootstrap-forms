<script>
import {computed, defineComponent, inject} from 'vue';
import RangeSlider from 'svelte-range-slider-pips';

export default defineComponent({
  emits: ['update:modelValue', 'change'],
  props: {
    name: {
      type: String,
      default: null,
    },
    modelValue: {
      type: Number,
      default: 0
    },
    value: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    readonly: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: {}
    }
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
  methods: {},
  mounted() {
    let _this=this;
    this.rangeSliderEn = new RangeSlider({
      target: this.$refs.rangeSliderEl,
      props: {
        values: this.modelValue,
        pips: true,
        spring: true,
        rangeFloat: true,
        range: true,
        formatter: (v) => Intl.NumberFormat().format(v),
        rangeFormatter: (x, y) => Intl.NumberFormat().format(x) + ' - ' + Intl.NumberFormat().format(y),
        first: 'label',
        last: 'label',
        ...this.options,
        min: this.min || null,
        max: this.max || null,

      }
    }).$on('change', function (e) {
      _this.$emit('change', e);

      const value = _this.range ? e.detail?.values : e.detail?.value;
      _this.modelValue = value;
      _this.$emit('update:modelValue', value);
    });
  },
  beforeUnmount() {
    this.rangeSliderEn?.destroy();
  },
  data() {
    return {
      rangeSliderEn: null
    }
  }
})
</script>
<template>
  <div class="range-input" ref="rangeSliderEl" dir="ltr">
    <input v-model="modelValue" type="hidden">
  </div>
</template>