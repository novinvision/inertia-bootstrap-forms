<script>
import {Spinner} from 'vue3-bootstrap-components';
import {defineComponent} from "vue";

export default defineComponent({
  components: {
    Spinner
  },
  inject: ['form'],
  props: {},
})
</script>
<template>
  <button
      type="submit"
      :disabled="form?.processing || form?.uploading"
      class="btn btn-primary px-3 px-sm-4">
    <Spinner v-if="form?.processing || form?.uploading"/>
    <slot :form="form">
      تایید و ثبت اطلاعات
    </slot>
    <slot name="progress">
      <span class="submit-upload-percent" v-if="form?.uploading">{{ form?.uploading }}%</span>
    </slot>
  </button>
</template>
