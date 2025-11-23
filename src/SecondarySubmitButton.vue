<script>
import {Spinner} from "vue3-bootstrap-components";
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
        :disabled="form?.processing"
        class="btn btn-secondary px-3 px-sm-4">
        <Spinner v-if="form?.processing"/>
        <slot>
            تایید و ثبت اطلاعات
        </slot>
    </button>
</template>
