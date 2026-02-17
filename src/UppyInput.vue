<template>
  <div class="uppy-input-area" ref="inputEl" v-if="uppy">
    <UppyContextProvider :name="'uu' + name" :uppy="uppy">
      <slot :uppy="uppy">
        <FilesList class="uppy-file-lists"/>
        <Dropzone/>
      </slot>
    </UppyContextProvider>
    <div class="uppy-input-area--caption small text-body-secondary fst-italic" v-if="restrictionCaption">{{restrictionCaption}}</div>
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

const props = defineProps({
  name: {type: String, required: true},
  multiple: {type: Boolean, default: false},
  useXHR: {type: Boolean, default: true},
  XHRConfig: {type: Object, default: {}},
  url: {type: String, default: '/upload'},
  config: {type: Object, default: () => ({})},
  errorHandler: {type: Function, default: null},
  showRestrictionCaption: {type: Boolean, default: true},
})

const emits = defineEmits([
  'update:modelValue', 'file-added', 'file-removed', 'beforeUpload',
  'progress', 'upload', 'upload-progress', 'upload-error',
  'upload-success', 'upload-pause', 'complete', 'error',
  'upload-retry', 'upload-stalled', 'retry-all', 'cancel-all',
  'restriction-failed',
])

const restrictionCaption = ref(null);
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
    maxNumberOfFiles: props.multiple ? null : 1,
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
  const serverResponse = file.response?.body ?? file.response;

  if (props.multiple && Array.isArray(modelValue.value)) {
    modelValue.value = modelValue.value.filter(item => {
      // مقایسه بر اساس شناسه یا کل آبجکت (بسته به ساختار ارسالی سرور شما)
      // اگر سرور ID برمی‌گرداند: return item.id !== serverResponse.id;
      // اگر مستقیماً خود آبجکت است:
      return JSON.stringify(item) !== JSON.stringify(serverResponse);
    });
  } else {
    modelValue.value = null;
  }

  if (serverResponse) {
    fetch(props.url, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverResponse),
    });
  }

  emits('file-removed', file);
});

uppy.value.on('progress', (progress) => emits('progress', progress));
uppy.value.on('upload-progress', (file, progress) => emits('upload-progress', file, progress));
uppy.value.on('upload-pause', (file, progress) => emits('upload-pause', file, progress));
uppy.value.on('cancel-all', () => emits('cancel-all'));
uppy.value.on('retry-all', () => emits('retry-all', ));
uppy.value.on('upload-stalled', (error, files) => emits('upload-stalled', error, files));
uppy.value.on('upload-retry', (file) => emits('upload-retry', file));

uppy.value.on('complete', (result) => emits('complete', result));

uppy.value.on('error', (error) => {
  emits('error', error)
});

uppy.value.on('upload-error', (file, error, response) => {
  const errorMessage = JSON.parse(response.response)?.message ?? error;
  handleError(errorMessage);
  emits('upload-error', file, error, response, errorMessage)
});

uppy.value.on('restriction-failed', (file, error) => {
  handleError(error.message);
  emits('restriction-failed', file, error);
});

onMounted(() => {
  let XHR;
  if (props.useXHR) {
    import('@uppy/xhr-upload').then(module => {
      XHR = module.default; // چون اکثر پکیج‌ها default export دارند
      uppy.value.use(XHR, {
        method: 'POST',
        endpoint: props.url,
        headers: {
          'accept': 'application/json',
        },
        ...props.XHRConfig
      });
    });
  }

  if(uppy.value?.opts?.restrictions){
    console.log(uppy.value?.opts?.restrictions);
    restrictionCaption.value = buildRestrictionsCaption(uppy.value.opts.restrictions)
    console.log('restrictionCaption', restrictionCaption.value);
  }
});

onBeforeUnmount(() => {
  if (uppy.value) {
    uppy.value.destroy();
  }
});

function handleError(error) {
  if (props.errorHandler) {
    props.errorHandler(error);
  } else if (error) {
    showError(error);
  }
}

function showError(message) {
  const errorEl = document.createElement('div');
  errorEl.textContent = message;
  errorEl.className = 'uppy-error';

  if (inputEl.value) {
    inputEl.value.prepend(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
  }
}

function formatBytesToKB(size) {
  if (!size) return null;
  return Math.round(size / 1024);
}

function buildRestrictionsCaption(restrictions) {
  if (!restrictions) return '';

  const {
    allowedFileTypes,
    maxFileSize,
    minFileSize,
    maxNumberOfFiles,
    minNumberOfFiles,
    maxTotalFileSize,
  } = restrictions;

  const parts = [];

  // پسوندها
  if (allowedFileTypes && allowedFileTypes.length) {
    const types = allowedFileTypes
        .map(type => type.replace('.', ''))
        .join('، ');
    parts.push(`فقط فایل با پسوندهای ${types}`);
  }

  // تعداد فایل
  if (maxNumberOfFiles) {
    parts.push(`امکان انتخاب حداکثر ${maxNumberOfFiles} فایل`);
  }

  if (minNumberOfFiles) {
    parts.push(`حداقل ${minNumberOfFiles} فایل نیاز است`);
  }

  // حجم هر فایل
  if (maxFileSize) {
    parts.push(`با حداکثر حجم ${formatBytesToKB(maxFileSize)} کیلوبایت برای هر فایل`);
  }

  if (minFileSize) {
    parts.push(`با حداقل حجم ${formatBytesToKB(minFileSize)} کیلوبایت برای هر فایل`);
  }

  // مجموع حجم
  if (maxTotalFileSize) {
    parts.push(`و مجموع حجم کل حداکثر ${formatBytesToKB(maxTotalFileSize)} کیلوبایت`);
  }

  if (!parts.length) return '';

  return parts.join('، ') + ' مجاز است.';
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