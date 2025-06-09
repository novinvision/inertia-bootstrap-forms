<script>
import TextInput from "./TextInput.vue";

export default {
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
}
</script>
<template>
    <TextInput
        :name="name"
        placeholder="ایمیل خود را وارد کنید"
        type="email"/>
</template>
