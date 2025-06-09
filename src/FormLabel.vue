<script>
export default {
    props: {
        default: false,
        required: false,
    },
    emits: ['update:modelValue'],
}
</script>

<template>
    <label class="mb-2 d-block">
        <slot/>
        <span class="text-danger" v-if="required">*</span>
    </label>
</template>
<style scoped>
label {
    cursor: pointer;
}
</style>
