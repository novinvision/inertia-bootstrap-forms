<script setup>
import { computed, inject, ref, onMounted } from "vue";
import Dropzone from "dropzone";
import "dropzone/dist/basic.css";
import "dropzone/dist/dropzone.css";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  modelValue: String,
  url: { type: String, default: "/upload" },
  options: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue"]);

const form = inject("form", {
  value: {},
  errors: {},
  getID: n => n,
});

const group = inject("group", null);

const dz = ref(null);
const dropzone = ref(null);

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
    emit("update:modelValue", val);
  }
});

onMounted(() => {
  dropzone.value = new Dropzone(dz.value, {
    url: props.url,
    addRemoveLinks: true,
    maxFiles: props.multiple ? null : 1,
    ...props.options,
  });

  dropzone.value.on("error", (file, response) => {
    let message = "خطا در آپلود";

    if (typeof response === "string") {
      message = response;
    }

    if (response?.message) {
      message = response.message;
    }

    file.previewElement.classList.add("dz-error");
    const err = file.previewElement.querySelector("[data-dz-errormessage]");
    if (err) err.textContent = message;
  });

  dropzone.value.on("success", (file, response) => {
    const result = response.data ?? response;

    if(props.multiple){
      modelValue.value = [...(modelValue.value || []), result];
    }else{
      modelValue.value = result;
    }
  });

  dropzone.value.on("removedfile", async (file) => {
    let data = file.xhr.response;
    if (!data) return;

    try {
      data = JSON.parse(data);
      modelValue.value = (modelValue.value || []).filter(f => f.path !== data.path);

      await fetch(props.url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
        },
        body: data.path
      });
    } catch (e) {
      console.error("حذف فایل در سرور با خطا مواجه شد", e);
    }
  });
});
</script>

<template>
  <div class="inertia-dropzone-input dropzone" ref="dz"></div>
</template>
