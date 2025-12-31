<script>
import {useForm} from "@inertiajs/vue3";
import {computed, defineComponent, reactive, toRef} from "vue";
import {Alert} from "vue3-bootstrap-components";

export default defineComponent({
  components: {Alert},
  emits: ['submit', 'reset', 'onStart', 'onFinish', 'onSuccess', 'onError', 'change'],
  props: {
    url: {
      type: String,
      default: '',
      required: false,
    },
    method: {
      default: 'post'
    },
    only: {
      type: Array,
      default: [],
      required: false,
    },
    modelValue: {
      type: Object,
      default: {},
      required: false,
    },
    submitHandler: {
      type: Function,
      default: null,
      required: false,
    },
  },
  setup(props) {
    const formEl = toRef('formEl');
    const formData = reactive(props.modelValue);
    const form = useForm({
      hasMessage: false,
      successMessage: null,
      ...formData
    });

    form.getID = function (el) {
      if (typeof el === String) {
        return (formEl.value?.id ? formEl.value?.id + '-' : '') + '-' + el;
      }

      return (formEl.value?.id ? formEl.value?.id + '-' : '') + ((el.group ? el.group?.name + '-' + el.group?.groupID + '-' : '')) + el.name + (el.value ? '-' + el.value : '');
    };

    return {form, formData, formEl};
  },
  provide() {
    return {
      form: computed(() => this.form)
    }
  },
  watch: {
    form: {
      handler: function (newVal) {
        const {
          isDirty,
          errors,
          hasErrors,
          hasMessage,
          successMessage,
          processing,
          progress,
          wasSuccessful,
          recentlySuccessful,
          __rememberable,
          ...cleanedData
        } = newVal;

        this.$emit('change', cleanedData);
        this.$emit('update:modelValue', cleanedData)
      },
      deep: true,
    }
  },
  methods: {
    reset() {
      this.form.reset();
    },
    async submit(event) {
      const formValues = this.modelValue;

      if (this.submitHandler) {
        await this.submitHandler(event);
      } else {
        this.$emit('submit', event);
        await this.form.transform(function (formDataValues) {
          delete formDataValues.hasMessage;
          delete formDataValues.successMessage;

          let data = JSON.stringify({
            ...formValues,
            ...formDataValues,
          });

          const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
          const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

          for (let i = 0; i < 10; i++) {
            data = data.replace(persianDigits[i], i).replace(arabicDigits[i], i);
          }

          return JSON.parse(data.toLocaleString('en-US'));
        }).submit(this.method.toString(), this.url, {
          only: this.only,
          onStart: () => {
            if (this.form.hasMessage) {
              this.form.hasMessage = false;
            }
            if (this.form.successMessage) {
              this.form.hasMessage = null;
            }

            this.$emit('onStart');
            this.form.clearErrors();
          },
          onFinish: (data) => {
            this.$emit('onFinish', data);
          },
          onError: (errors) => {
            this.$emit('onError', errors);
          },
          onSuccess: (data) => {
            if (data?.props?.message) {
              this.form.hasMessage = true;
              this.form.successMessage = data?.props?.message;
            }

            this.$emit('onSuccess', data);
          }
        });
      }
    }
  },
  expose: ['submit', 'reset'],
})

</script>

<template>
  <form ref="formEl"
        :action="url"
        :method="method"
        @submit.prevent="submit"
        @reset="$emit('reset')"
        :class="{'form-processing loading': form.processing,}"
        :novalidate="!!Object.values(form.errors).length">
    <slot name="errors" v-if="form.hasErrors" :form="form">
      <Alert type="danger">
        <ul class="list-unstyled p-0 m-0 fanum">
          <li v-for="error in form.errors">{{ error }}</li>
        </ul>
      </Alert>
    </slot>
    <slot name="message" v-if="form.hasMessage" :form="form">
      <Alert type="success" v-html="form.successMessage" v-if="form.successMessage"></Alert>
    </slot>
    <slot :form="form" :submit="submit"/>
  </form>
</template>
