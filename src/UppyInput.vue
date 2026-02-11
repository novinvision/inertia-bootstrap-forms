<template>
  <div class="uppy-input-area" ref="inputEl">
    <UppyContextProvider :uppy="uppy">
      <slot :uppy="uppy">
        <FilesList class="uppy-file-lists"/>
        <Dropzone/>
      </slot>
    </UppyContextProvider>
  </div>
</template>

<script setup>
import {computed, inject, onBeforeUnmount, onMounted, reactive, ref} from 'vue'
import Audio from '@uppy/audio';

import {
  Dropzone,
  FilesList,
  ProviderIcon,
  UppyContextProvider,
} from '@uppy/vue';
import Uppy from '@uppy/core';
import XHR from '@uppy/xhr-upload';

import '@uppy/vue/css/style.css';
import '@uppy/audio/css/style.min.css';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: '/upload',
  },
  config: {
    type: Object,
    default: {},
  },
  errorHandler: {
    type: Function,
    default: null,
  },
})

const uppy = (new Uppy({
  autoProceed: true,
  onBeforeUpload: function (files) {
    emits('beforeUpload', files);
  },
  ...props.config,
  restrictions: {
    maxNumberOfFiles: props.multiple ? 10 : 1,
    ...(props.config?.restrictions || {})
  },
}))

onMounted(() => {
  uppy?.use(XHR, {
    endpoint: props.url,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
})

onBeforeUnmount(() => {
  uppy?.destroy();
});

const emits = defineEmits([
  'update:modelValue',
  'file-added',
  'file-removed',
  'beforeUpload',
  'progress',
  'upload',
  'upload-progress',
  'upload-error',
  'upload-success',
  'upload-pause',
  'complete',
  'error',
  'upload-retry',
  'upload-stalled',
  'retry-all',
  'cancel-all',
  'restriction-failed',
])

const form = inject("form", {
  value: {},
  errors: {},
  getID: n => n,
});

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

const inputEl = ref(null);

uppy?.on('upload', (uploadID, file) => {
  emits('upload', uploadID, file);
});

uppy?.on('progress', (progress) => {
  emits('progress', progress);
});

uppy?.on('file-added', (file) => {
  emits('file-added', file);
});

uppy?.on('file-removed', (file) => {
  emits('file-removed', file);
});

uppy?.on('upload-progress', (file, progress) => {
  emits('upload-progress', file, progress);
});

uppy?.on('upload-pause', (file, isPaused) => {
  emits('upload-pause', file, isPaused);
});

uppy?.on('complete', (result) => {
  emits('complete', result);
});

uppy?.on("upload-success", (file, response) => {
  const result = response.body ?? response;

  if (props.multiple) {
    modelValue.value = [...(modelValue.value || []), result];
  } else {
    modelValue.value = result;
  }

  emits('upload-success', file, response);
});

uppy?.on('upload-error', (file, error, response) => {
  console.error('upload-error', file, error, response);
  emits('upload-error', file, error, response);
});

uppy?.on('error', (error) => {
  emits('error', error);
});

uppy?.on('upload-retry', (file) => {
  emits('upload-retry', file);
});

uppy?.on('upload-stalled', (error, files) => {
  emits('upload-stalled', error, files);
});

uppy?.on('retry-all', (files) => {
  emits('retry-all', files);
});

uppy?.on('cancel-all', () => {
  emits('cancel-all');
});

uppy?.on('restriction-failed', (file, error) => {
  if (props.errorHandler) {
    props.errorHandler(error);
  } else {
    showError(error);
  }
  emits('restriction-failed', file, error);
});

function showError(message) {
  const errorEl = document.createElement('div')
  errorEl.textContent = message
  errorEl.className = 'uppy-error'

  inputEl?._value?.prepend(errorEl);
  setTimeout(() => {
    errorEl.remove()
  }, 3000)
}

</script>
<style>
.uppy-file-lists > ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.uppy-reset p,
.uppy-file-lists ul p {
  margin-bottom: 0;
}

[dir="rtl"] .uppy-reset .uppy\:tabular-nums {
  direction: ltr;
}

.uppy-input-area .uppy-error {
  display: block;
  padding: 5px;
  background-color: var(--bs-danger-bg-subtle, var(--bs-danger, #de0021));
  border: 1px solid var(--bs-danger-border-subtle, var(--bs-danger, #de0021));
  color: var(--bs-danger-text-emphasis, #ffffff);
  text-align: center;
  border-radius: var(--bs-border-radius, 1rem);
  margin-bottom: 5px;
}
</style>