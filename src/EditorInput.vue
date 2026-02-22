<script>
import Editor from '@tinymce/tinymce-vue';
import {computed, defineComponent, inject, ref} from "vue";

export default defineComponent({
  emits: ['update:modelValue', 'setContent'],
  components: {Editor},
  props: {
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: String,
    options: {
      type: Object,
      default: {},
      required: false,
    },
  },
  setup(props, {expose, emit}) {
    const editorRef = ref(null)
    const tinyInstance = ref(null)

    const handleInit = (evt, editor) => {
      tinyInstance.value = editor
    }

    expose({
      editor: () => tinyInstance.value
    })

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

    return {modelValue, form, group, editorRef, handleInit};
  },
})
</script>

<template>
  <Editor
      ref="editorRef"
      @init="handleInit"
      v-model="modelValue"
      class="tiny-editor-input-el"
      :init="{
        disabled: this.disabled,
        placeholder: this.placeholder,
        ...options
      }"
  />
</template>
<style>
textarea.tiny-editor-input-el {
  width: 100%;
  min-height: 200px;
}

textarea.tiny-editor-input-el,
.tox.tox-tinymce {
  background-color: transparent;
  border: 0;
  outline: none;
  background-image: url("css/loader.gif");
  background-repeat: no-repeat;
  background-position: center center;
}

.tox .tox-edit-area::before {
  display: none;
}

.tox .tox-throbber{
  z-index: var(--bs-dropdown-zindex, 900) !important;
}

.tox:not(.tox-tinymce-inline) .tox-editor-header,
.tox .tox-toolbar-overlord,
.tox .tox-toolbar, .tox .tox-toolbar__overflow, .tox .tox-toolbar__primary,
.tox .tox-statusbar{
  background-color: var(--bs-body-bg, #fff) !important;
  color: var(--bs-body-color, #000) !important;
}

.tox .tox-statusbar a,
.tox .tox-statusbar__path-item,
.tox .tox-statusbar__wordcount,
.tox .tox-statusbar{
  color: var(--bs-secondary-color, #cccc) !important;
}
</style>