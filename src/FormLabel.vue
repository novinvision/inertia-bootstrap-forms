<script>
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    default: false,
    required: false,
  },
  emits: ['update:modelValue'],
  mounted() {
    const sibling = this.$el.nextElementSibling;
    if (sibling) {
      this.forId = sibling.id || sibling.querySelector('[id]')?.id || null;
    }
  },
  data() {
    return {
      forId: null,
    };
  },
})
</script>

<template>
  <label class="mb-2 d-block" :for="forId">
    <slot/>
    <span class="text-danger" v-if="required">*</span>
  </label>
</template>
<style scoped>
label {
  cursor: pointer;
}
</style>
