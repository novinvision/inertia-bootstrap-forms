<script>
import {VueTelInput} from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';
import {inject} from "vue";

export default {
    components: {
        VueTelInput
    },
    props: {
        name: {
            type: String,
            default: 'email',
            required: true,
        },
        placeHolder: {
            type: String,
            default: '000 000 0000',
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
        inputEvent(number, phone) {
            this.form[this.name] = phone.number;
            this.valid = phone.valid;
            console.log('input', number, phone);
        }
    },
    data() {
        return {
            defaultValue: this.form[this.name],
            valid: null,
        }
    }
}
</script>
<template>
    <div class="telephone-input input-group fanum" dir="ltr">
        <vue-tel-input
            mode="national"
            :validCharactersOnly="true"
            defaultCountry="ir"
            :dropdownOptions="{
                showDialCodeInList:true,
                showDialCodeInSelection:true,
                showFlags:false,
            }"
            @on-input="inputEvent"
            :inputOptions="{
                placeholder: placeHolder
            }"
            v-model="defaultValue"
            :styleClasses="'form-control' + ((valid === false || form?.errors[name] !== undefined) ? ' is-invalid' : '')"/>
    </div>
</template>
<style>
.telephone-input {
}

.telephone-input .vti__dropdown {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0;
}

.telephone-input .vti__input.vti__phone {
    padding-right: 3rem;
}

.telephone-input .vti__dropdown-list {
    left: auto;
    right: 0;
}

.telephone-input .vti__dropdown-list .vti__dropdown-item {
    direction: rtl;
    text-align: right;
}

.telephone-input .vti__dropdown-list .vti__dropdown-item strong {
    font-weight: normal;
}

.telephone-input .vti__selection {
    font-size: inherit;
}

.telephone-input .form-control.is-invalid{
    padding-right: 0.75rem;
    background-position: left calc(0.425em + 0.25rem) center;
}
</style>
