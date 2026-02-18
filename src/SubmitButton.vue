<script>
import {Spinner} from 'vue3-bootstrap-components';
import {defineComponent} from "vue";

export default defineComponent({
  components: {
    Spinner
  },
  inject: ['form'],
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
})
</script>
<template>
  <button
      type="submit"
      :disabled="(disabled || form?.processing || form?.uploading)">
    <Spinner v-if="form?.processing || form?.uploading"/>
    <slot :form="form">
      تایید و ثبت اطلاعات
    </slot>
    <slot name="progress">
      <span class="submit-upload-percent" v-if="form?.uploading">{{ form?.uploading }}%</span>
    </slot>
  </button>
</template>
