<script>
import {inject} from "vue";

export default {
    emits: ['change'],
    props: {
        name: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            default: '',
            required: false,
        },
        value: {
            type: String,
            default: 'yes',
            required: false,
        },
        type: {
            type: String,
            default: 'radio',
            required: false,
        },
    },
    methods:{
        change(e){
            this.$emit('change', e);
        }
    },
    setup(props) {
        let form = inject('form');

        if (form === undefined) {
            form = {
                errors: {},
                getID(name) {
                    return name;
                }
            };
        }

        return {form};
    },
}
</script>
<template>
    <label class="btn-label" :for="form.getID(name)+(id || value)" :class="{'active': (form[name] === value || form[name] === true)}">
        <input
            :name="name"
            :id="form.getID(name)+(id || value)"
            v-model="form[name]"
            :class="{'is-invalid': form?.errors[name]}"
            :disabled="form?.processing"
            :type="type"
            :value="value"
            @change="change"
            autocomplete="off"
            class="btn-check">
        <slot/>
    </label>
</template>
<style>
.btn-label:not(.active){
    --bs-bg-opacity: .3;
    opacity: .6;
}
</style>
