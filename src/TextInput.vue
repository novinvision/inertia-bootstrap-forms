<script>
import {computed, inject, defineComponent} from "vue";

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    computed: {
        inputID() {
            return this.form.getID(this);
        }
    },
    setup(props) {
        let form = inject('form', {
            errors: {},
            getID(name) {
                return name;
            }
        });
        let group = inject('group', {});

        const modelValue = computed({
            get() {
                return (group.value && form.value[group.value.name]) ? group.value?.getData(props.name) : form.value[props.name];
            },
            set(value) {
                if (group?.value?.name) {
                    group.value.setData(props.name, value);
                } else {
                    form.value[props.name] = value;
                }
            }
        });

        return {modelValue, form, group};
    },
})
</script>
<template>
    <input
        :name="name"
        :id="inputID"
        v-model="modelValue"
        :class="{'is-invalid': form?.errors[name] !== undefined}"
        :disabled="form?.processing"
        type="text"
        class="form-control">
</template>
