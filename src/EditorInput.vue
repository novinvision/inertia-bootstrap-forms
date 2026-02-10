<script>
import Editor from '@tinymce/tinymce-vue';
import {computed, defineComponent, inject} from "vue";

export default defineComponent({
  components: {Editor},
  props: {
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
      required: false,
    },
    modelValue: String,
    options: {
      type: Object,
      default: {},
      required: false,
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

    return {modelValue, form, group};
  },
  emits: ['update:modelValue'],
})
</script>

<template>
  <Editor
      v-model="modelValue"
      class="tiny-editor-input-el"
      :init="{
        placeholder: this.placeholder,
        ...options
      }"
  />
</template>
<style>
textarea.tiny-editor-input-el {
  width: 100%;
  min-height: 200px;
  background-color: transparent;
  border: 0;
  outline: none;
  background-image: url("css/loader.gif");
  background-repeat: no-repeat;
  background-position: center center;
}
</style>