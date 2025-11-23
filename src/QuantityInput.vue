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
    unit: {
      type: String,
      default: 'عدد'
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: null
    },
  },
  setup(props) {
    let form = inject('form');
    let group = inject('group', {});

    if (form === undefined) {
      form = {
        errors: {},
        getID(name) {
        }
      };
    }

    if (!form[props.name]) {
      form[props.name] = props.min;
    }

    const modelValue = computed({
      get() {
        return ((group.value && form.value[group.value.name]) ? group.value?.getData(props.name) : form.value[props.name]);
      },
      set(value) {
        if (group?.value?.name) {
          group.value.setData(props.name, value);
        } else {
          form.value[props.name] = value;
        }
      }
    });

    if (!modelValue.value) {
      modelValue.value = props.min;
    }

    return {modelValue, group, form};
  },
  methods: {
    onChange(event) {
      let value = parseFloat(this.$number.toEnglish(event.detail?.unmasked)) || 1;
      this.$emit('update:modelValue', value);
      this.modelValue = value;
    },
    increment() {
      if (!this.max || (this.max < this.modelValue)) {
        this.modelValue = this.modelValue + 1;
      }
    },
    decrement() {
      if ((!this.min || (this.min < this.modelValue)) && this.modelValue > 1) {
        this.modelValue = this.modelValue - 1;
      }
    }
  },
  data() {
    return {}
  }
})
</script>
<template>
  <InputGroup class="input-group-quantity">
    <button @click="increment" type="button" class="btn">
      <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H13V3Z"
            fill="#0F0F0F"/>
      </svg>
    </button>
    <input
        :name="name"
        :value="this.modelValue"
        v-maska
        data-maska="###,###,###,###,###,###,###"
        data-maska-reversed
        @maska="onChange"
        :class="{'is-invalid': form.errors[name]}"
        :disabled="disabled || form.processing"
        :readonly="readonly"
        type="tel"
        class="form-control fanum text-center">
    <button @click="decrement" type="button" class="btn">
      <svg width="800px" height="800px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path fill="#000000" fill-rule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z"/>
      </svg>
    </button>
    <InputGroupText class="fanum">{{ unit }}</InputGroupText>
    <slot name="suffix"/>
  </InputGroup>
</template>
<style>

.input-group-quantity .input-group-text,
.input-group-quantity .btn {
  background-color: var(--bs-body-bg);
  --bs-btn-hover-bg: var(--bs-secondary-bg);
  --bs-btn-active-bg: var(--bs-secondary-bg);
}

.input-group-quantity input.form-control {
  border: 0 !important;
  box-shadow: none !important;
}

.input-group-quantity .btn svg {
  width: 14px;
  height: 14px;
}
</style>
