<script>
import Editor from '@tinymce/tinymce-vue';
import {computed, inject} from "vue";

export default {
    components: {Editor},
    props: {
        name: {
            type: String,
            required: true,
        },
        modelValue: String,
        placeholder: {
            type: String,
            default: 'اینجا بنویسید...',
        },
        invalid: Boolean,
        allowLink: Boolean,
        height: Number,
        useStyle: {
            type: Boolean,
            default: false,
        },
        modules: {
            default: [],
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
}
</script>

<template>
    <Editor
        api-key="tbws10u99swxhai03qolxykukvqw99jd4nw9q8z34aocvc4r"
        tinymce-script-src="/js/tinymce/tinymce.min.js"
        v-model="modelValue"
        :init="{
          base_url: '/js/tinymce/',
          disabled: false,
          inline: false,
          toolbar_sticky: true,
          menubar: false,
          contextmenu: false,
          branding: false,
          font_formats: true,
          directionality: 'rtl',
          placeholder: placeholder,
          plugins: [
              ...modules,
              'link',
              'lists',
              'directionality',
              'fullscreen',
              'wordcount',
              'table',
              'autosave',
              'autoresize',
          ],
          style_formats : [
              {title : 'وسط چین', classes : 'text-center', block: 'div'},
              {title : 'فاصله از بالا و پایین', classes : 'my-3', block: 'div'},
              {title : 'باکس اطلاعات', classes : 'code-box', block: 'span'},
          ],
          setup: function(editor) {
            // editor.on('init', function(e) {
            //     editor.setContent(modelValue || '');
            // });
            //
            // editor.on('paste cut reset keyup input focusout', function(e) {
            //     // console.log('form', form);
            //     // $emit('update:modelValue', editor.getContent());
            // });
          },
          language: 'fa',
          toolbar: (useStyle ? 'styles |' : '') + 'fontsize | bold italic h1 h2 h3 h4 | link | numlist bullist | alignjustify aligncenter | table image  link unlink | rtl ltr | pagebreak codesample | fullscreen code',
          fullscreen: true,
          auto_save: true,
          auto_link: true,
          // images_upload_url: 'files/upload',
          // images_upload_handler: this.uploader,
          images_file_types: 'jpeg,jpg,png',
          autoresize_bottom_margin: 50,
          allow_link: !!this.allowLink,
          allow_style: true,
          allow_link_style: false,
          height: this.height || 400,
          min_height: this.height || 400,
          allow_code: false,
          autoresize_on_init: true,
          autosave_ask_before_unload: false,
          autosave_interval: '5s',
          autosave_restore_when_empty: true,
          paste_data_images: false,
          paste_block_drop: false,
          relative_urls: false,
          remove_script_host: false,
          paste_as_text: true,
          valid_elements: 'p,a,b,strong,i,em,h1,h2,h3,h4,h5,ul,ol,li,img,br',
          paste_word_valid_elements: 'p,a,b,strong,i,em,h1,h2,h3,h4,h5,ul,ol,li,img,br',
          paste_tab_spaces: 0,
          default_link_target: '_blank',
          link_assume_external_targets: true,
          link_quicklink: true,
          powerpaste_word_import: 'clean',
          powerpaste_html_import: 'clean',
          auto_refresh_interval: 500,
          convert_urls: false,
          verify_html: false,
          valid_children: '+a[div|h1|h2|h3|h4|h5|h6|p|#text]',
        }"
    />
</template>
<style scoped>
textarea {
    width: 100%;
    min-height: 200px;
}
</style>
