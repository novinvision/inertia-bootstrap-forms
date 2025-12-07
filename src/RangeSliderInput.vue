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
      target: this.$refs.input,
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
  data() {
    return {
      rangeSliderEn: null
    }
  }
})
</script>
<template>
  <div class="range-input" ref="input" dir="ltr">
  </div>
</template>

<style>
/* purgecss start ignore */
.range-slider {
  direction: ltr;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  display: block;
  position: relative;
  width: 100%;
  height: 8px;
  background: #ddd;
  border-radius: 4px
}

.range-slider[data-vertical] {
  height: 100%;
  width: 8px
}

.range-slider[data-disabled] {
  opacity: .5;
  cursor: not-allowed
}

.range-slider .range-slider__thumb {
  position: absolute;
  z-index: 3;
  top: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #2196f3
}

.range-slider .range-slider__thumb:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 6px rgba(33, 150, 243, .5)
}

.range-slider[data-vertical] .range-slider__thumb {
  left: 50%
}

.range-slider .range-slider__thumb[data-disabled] {
  z-index: 2
}

.range-slider .range-slider__range {
  position: absolute;
  z-index: 1;
  transform: translate(0, -50%);
  top: 50%;
  width: 100%;
  height: 100%;
  background: #51adf6
}

.range-slider[data-vertical] .range-slider__range {
  left: 50%;
  transform: translate(-50%, 0)
}

.range-slider input[type=range] {
  -webkit-appearance: none;
  pointer-events: none;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  background-color: transparent
}

.range-slider input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none
}

.range-slider input[type=range]::-moz-range-thumb {
  width: 0;
  height: 0;
  border: 0
}

.range-slider input[type=range]:focus {
  outline: 0
}

/* purgecss end ignore */
</style>
