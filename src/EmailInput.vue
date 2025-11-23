<script>
import TextInput from "./TextInput.vue";
import {defineComponent} from "vue";

export default defineComponent({
    components: {
        TextInput
    },
    props: {
      FileInput: {
            type: String,
            default: 'email',
            required: true,
        },
    },
})
</script>
<template>
    <TextInput
        :name="name"
        placeholder="ایمیل خود را وارد کنید"
        type="email"/>
</template>
