<script>
import {InputGroup, InputGroupText} from 'vue3-bootstrap-components';
import {defineComponent, inject} from "vue";

export default defineComponent({
    components: {InputGroup, InputGroupText},
    props: {
        name: {
            type: String,
            required: true,
        },
        required: Boolean,
        disabled: Boolean,
        readonly: Boolean,
        placeholder: {
            type: String,
            default: 'عدد را وارد کنید'
        },
        unit: {
            type: String,
            default: 'عدد'
        },
    },
    setup(props) {
        let form = inject('form');

        if (form === undefined) {
            form = {
                errors: {},
                getID(name) {
                }
            };
        }

        return {form};
    },
    methods: {
        onChange(event) {
            this.form[this.name] = parseFloat(this.$number.toEnglish(event.detail?.unmasked));
            this.$emit('update:modelValue', parseFloat(this.$number.toEnglish(event.detail?.unmasked)));
        }
    }
})
</script>
<template>
    <InputGroup>
        <input
            :name="name"
            :value="form[name]"
            v-maska
            data-maska="###,###,###,###,###,###,###"
            data-maska-reversed
            @maska="onChange"
            :class="{'is-invalid': form.errors[name]}"
            :disabled="disabled || form.processing"
            :readonly="readonly"
            :placeholder="placeholder"
            type="tel"
            class="form-control fanum text-start">
        <InputGroupText class="fanum">{{ unit }}</InputGroupText>
        <slot name="suffix"/>
    </InputGroup>
</template>
