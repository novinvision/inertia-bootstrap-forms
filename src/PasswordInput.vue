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
            default: 'password',
            required: true,
        },
    },
})
</script>
<template>
    <TextInput
        :name="name"
        placeholder="گذرواژه خود را وارد کنید"
        type="password"/>
</template>
