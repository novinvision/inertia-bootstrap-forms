<template>
  <div class="uppy-input-area" ref="inputEl" v-if="uppy">
    <UppyContextProvider :name="'uu' + name" :uppy="uppy">
      <slot :uppy="uppy">
        <FilesList class="uppy-file-lists"/>
        <Dropzone/>
      </slot>
    </UppyContextProvider>
  </div>
</template>

<script setup>
import {computed, inject, onBeforeUnmount, onMounted, shallowRef, ref} from 'vue'
import {
  Dropzone,
  FilesList,
  UppyContextProvider,
} from '@uppy/vue';
import Uppy from '@uppy/core';

import '@uppy/vue/css/style.css';
import '@uppy/audio/css/style.min.css';

const props = defineProps({
  name: {type: String, required: true},
  multiple: {type: Boolean, default: false},
  useXHR: {type: Boolean, default: true},
  XHRConfig: {type: Object, default: {}},
  url: {type: String, default: '/upload'},
  config: {type: Object, default: () => ({})},
  errorHandler: {type: Function, default: null},
})

const emits = defineEmits([
  'update:modelValue', 'file-added', 'file-removed', 'beforeUpload',
  'progress', 'upload', 'upload-progress', 'upload-error',
  'upload-success', 'upload-pause', 'complete', 'error',
  'upload-retry', 'upload-stalled', 'retry-all', 'cancel-all',
  'restriction-failed',
])

const inputEl = ref(null);
const uppy = shallowRef(null);

// Inject form and group contexts
const form = inject("form", {value: {}, errors: {}, getID: n => n});
const group = inject("group", null);

const modelValue = computed({
  get() {
    return group?.value?.name
        ? group.value.getData(props.name)
        : form.value[props.name];
  },
  set(val) {
    if (group?.value?.name) {
      group.value.setData(props.name, val);
    } else {
      form.value[props.name] = val;
    }
    emits("update:modelValue", val);
  }
});

// ایجاد اینستنس اختصاصی برای هر کامپوننت
uppy.value = new Uppy({
  id: props.name, // جلوگیری از تداخل با استفاده از نام پروپ
  autoProceed: true,
  ...props.config,
  restrictions: {
    maxNumberOfFiles: props.multiple ? 10 : 1,
    ...(props.config?.restrictions || {})
  },
});

uppy.value.on('before-upload', (files) => {
  emits('beforeUpload', files);
});

uppy.value.on('upload-success', (file, response) => {
  const result = response.body ?? response;
  if (props.multiple) {
    const currentValues = Array.isArray(modelValue.value) ? modelValue.value : [];
    modelValue.value = [...currentValues, result];
  } else {
    modelValue.value = result;
  }
  emits('upload-success', file, response);
});

uppy.value.on('file-added', (file) => emits('file-added', file));
uppy.value.on('file-removed', (file) => {
  if (props.multiple && Array.isArray(modelValue.value)) {
    const serverResponse = file.response?.body ?? file.response;
    modelValue.value = modelValue.value.filter(item => {
      // مقایسه بر اساس شناسه یا کل آبجکت (بسته به ساختار ارسالی سرور شما)
      // اگر سرور ID برمی‌گرداند: return item.id !== serverResponse.id;
      // اگر مستقیماً خود آبجکت است:
      return JSON.stringify(item) !== JSON.stringify(serverResponse);
    });
  } else {
    modelValue.value = null;
  }

  // بخش حذف از سرور
  if (file.response) {
    fetch(props.url, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(file.response.body ?? file.response),
    });
  }

  emits('file-removed', file);
});

uppy.value.on('complete', (result) => emits('complete', result));
uppy.value.on('error', (error) => emits('error', error));

uppy.value.on('restriction-failed', (file, error) => {
  if (props.errorHandler) {
    props.errorHandler(error);
  } else {
    showError(error.message);
  }
  emits('restriction-failed', file, error);
});

onMounted(() => {
  let XHR;
  if (props.useXHR) {
    import('@uppy/xhr-upload').then(module => {
      XHR = module.default; // چون اکثر پکیج‌ها default export دارند
      uppy.value.use(XHR, {
        endpoint: props.url,
        ...props.XHRConfig
      });
    });
  }
});

onBeforeUnmount(() => {
  if (uppy.value) {
    uppy.value.destroy();
  }
});

function showError(message) {
  const errorEl = document.createElement('div');
  errorEl.textContent = message;
  errorEl.className = 'uppy-error';

  if (inputEl.value) {
    inputEl.value.prepend(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
  }
}
</script>

<style>
.uppy-reset p {
  margin-bottom: 0;
}

.uppy-file-lists > ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.uppy-input-area .uppy-error {
  display: block;
  padding: 5px;
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  color: #842029;
  text-align: center;
  border-radius: 0.5rem;
  margin-bottom: 5px;
}
</style>