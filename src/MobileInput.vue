<script>
import TextInput from "./TextInput.vue";
import {defineComponent} from "vue";

export default defineComponent({
    components: {
        TextInput
    },
    props: {
        name: {
            type: String,
            default: 'mobile',
            required: true,
        },
    },
})
</script>
<template>
    <TextInput
        :name="name"
        placeholder="موبایل خود را وارد کنید"
        type="tel"/>
</template>
