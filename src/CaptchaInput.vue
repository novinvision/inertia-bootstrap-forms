<script>
import TextInput from "./TextInput.vue";
import {defineComponent} from "vue";

export default defineComponent({
    components: {TextInput},
    props: {
        name: {
            type: String,
            default: 'captcha',
            required: false,
        },
        url: {
            type: String,
            default: '/captcha/default',
            required: false,
        },
        modelValue: '',
        required: Boolean,
        placeholder: {
            default: 'کد امنیتی روبرو را وارد کنید',
        },
    },
    emits: ['update:modelValue'],
    inject: ['form'],
    watch: {
        'form.processing': {
            handler: function (val, old) {
                if (val !== old && !val) {
                    this.getSrc();
                    this.emptyField();
                }
            },
            deep: false,
            immediate: false,
        }
    },
    methods: {
        emptyField() {
            if (this.form) {
                this.form[this.name] = null;
            }
        },
        async getSrc() {
            this.loading = true;
            this.src = this.url + '?t=' + Math.random();

            let _this = this;
            setTimeout(function () {
                _this.loading = false;
            }, 500)
        }
    },
    data() {
        return {
            loading: false,
            src: this.url + Math.random(),
        };
    }
});

</script>
<template>
    <div class="input-group captcha">
        <TextInput
            :name="name"
            class="text-start"
            type="tel"/>
        <img
            :src="src"
            alt="captcha"
            @click="getSrc"
            v-if="!loading"
            class="captcha-holder">
        <div class="placeholder-wave captcha-holder" v-else>
            <div class="placeholder w-100 h-100"></div>
        </div>
        <button
            type="button"
            :disabled="form.processing || loading"
            @click="getSrc"
            class="btn btn-secondary border-0">
            <i class="fal fa-sync-alt align-middle"></i>
        </button>
    </div>
</template>
<style>
.captcha .captcha-holder {
    cursor: pointer;
    width: 82px;
    height: 43px;
    object-fit: contain;
    border-top: 1px solid var(--bs-border-color, #eeeeee);
    border-bottom: 1px solid var(--bs-border-color, #eeeeee);
}

.input-group-lg.captcha .captcha-holder {
    width: 100px;
    height: auto;
}

.captcha .btn-refresh {
    background-color: var(--bs-body-bg, #ffffff);
    border-color: var(--bs-border-color, #eeeeee) !important;
}
</style>
