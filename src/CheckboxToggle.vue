<script>
import {computed, inject} from "vue";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      default: '',
      required: false,
    },
    value: {
      type: [String, Number],
      default: 'yes',
      required: false,
    },
    type: {
      type: String,
      default: 'checkbox',
      required: false,
    },
    hideInput: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    inputID() {
      return this.form.getID(this) + (this.value || '');
    },
    selectedValue(){
      return (typeof this.modelValue == 'object') ? Object.values(this.modelValue) : (this.modelValue ? [this.modelValue] : null)
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
}
</script>
<template>
  <label class="form-check-toggle" :class="{'form-check-toggle--active': (selectedValue || []).includes(value)}" :for="inputID">
    <input
        :name="name + (group ? '_' + group?.name + '-'+group?.groupID : '')"
        :id="inputID"
        v-model="modelValue"
        :class="{'is-invalid': form?.errors[name], 'form-check-toggle--input-hide': hideInput}"
        :disabled="form?.processing"
        :type="type"
        :value="value"
        @change="e => $emit('change', e)"
        class="form-check-toggle--input form-check-input">
    <slot/>
  </label>
</template>
<style>
.form-check-toggle {
  position: relative;
  cursor: pointer;
  display: block;
  background-color: var(--bs-body-bg, #ffffff);
  border-radius: var(--bs-border-radius, 1rem);
  min-width: 100px;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.97rem;
  font-weight: 400;
  line-height: 1.7;
  color: var(--bs-body-color, #000000);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-clip: padding-box;
  border: var(--bs-border-width, 1px) solid var(--bs-border-color, #eeeeee);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-check-toggle.form-check-toggle--active {
  background-color: var(--bs-warning-bg-subtle, #ffda6a);
  border-color: var(--bs-alert-border-color, #fff0c3);
}

.form-check-toggle .form-check-toggle--input-hide {
  visibility: hidden;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
