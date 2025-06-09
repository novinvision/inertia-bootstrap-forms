<script>
import TextInput from "./TextInput.vue";

export default {
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
}
</script>
<template>
    <TextInput
        :name="name"
        placeholder="گذرواژه خود را وارد کنید"
        type="password"/>
</template>
