<script>
import {computed, defineComponent, inject} from "vue";

export default defineComponent({
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
            type: [String, Number],
            default: 'yes',
            required: false,
        },
        type: {
            type: String,
            default: 'checkbox',
            required: false,
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
    <div class="form-check">
        <input
            :name="name + (group ? '_' + group?.name + '-'+group?.groupID : '')"
            :id="inputID"
            v-model="modelValue"
            :class="{'is-invalid': form?.errors[name]}"
            :disabled="form?.processing"
            :type="type"
            :value="value"
            @change="e => $emit('change', e)"
            class="form-check-input">
        <label class="form-check-label" :for="inputID">
            <slot/>
        </label>
    </div>
</template>
<style>
.form-check,
.form-check label {
    cursor: pointer;
}
</style>
