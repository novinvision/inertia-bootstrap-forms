<script>
import { defineAsyncComponent, defineComponent, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

const Editor = defineAsyncComponent(() => import('@tinymce/tinymce-vue'));

/** TinyMCE rich text editor. The HTML is stored in the FormContainer's v-model. */
export default defineComponent({
    name: 'EditorInput',
    components: { Editor },
    emits: ['update:modelValue', 'change', 'init', 'focus', 'blur'],
    props: {
        ...fieldProps,
        placeholder: { type: String, default: '' },
        /** TinyMCE `init` options. */
        options: { type: Object, default: () => ({}) },
        height: { type: [Number, String], default: null },
        /** Self-hosted TinyMCE script (`tinymceScriptSrc`) or Tiny Cloud api key. */
        tinymceScriptSrc: { type: String, default: null },
        apiKey: { type: String, default: null },
    },
    setup(props, { emit, expose }) {
        const field = useField(props, emit);
        const tiny = ref(null);

        function onInit(event, editor) {
            tiny.value = editor;
            editor.mode?.set(field.isDisabled.value || props.readonly ? 'readonly' : 'design');
            emit('init', editor);
        }

        watch(
            () => field.isDisabled.value || props.readonly,
            (locked) => tiny.value?.mode?.set(locked ? 'readonly' : 'design')
        );

        expose({ editor: () => tiny.value });

        return { ...field, onInit };
    },
});
</script>

<template>
    <Editor
        v-model="model"
        :id="inputId"
        :disabled="isDisabled || readonly"
        :tinymce-script-src="tinymceScriptSrc || undefined"
        :api-key="apiKey || undefined"
        :init="{ placeholder, ...(height ? { height } : {}), ...options }"
        class="tiny-editor-input-el"
        @init="onInit"
        @change="emitChange(model, $event)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
    />
</template>
