<script>
import {VueTelInput} from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';
import {defineComponent, inject} from "vue";

export default defineComponent({
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
})
</script>
<template>
  <div class="telephone-input input-group fanum" dir="ltr">
    <vue-tel-input
        mode="national"
        :validCharactersOnly="true"
        defaultCountry="ir"
        :preferredCountries="['ir', 'us', 'tr', 'ca']"
        :dropdownOptions="{
            showDialCodeInList:true,
            showDialCodeInSelection:true,
            showSearchBox:true,
            searchBoxPlaceholder:'Search...',
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
.telephone-input .vue-tel-input {
  border-color: var(--bs-border-color, #ccc);
  border-width: var(--bs-border-width, 1px);
  border-radius: var(--bs-border-radius, .5rem);
}

.telephone-input .vti__input.vti__search_box {
  border: 0;
  font-size: var(--bs-body-font-size, .9rem);
  background: var(--bs-tertiary-bg, #eee);
  border-radius: var(--bs-border-radius, .5rem);
}

.telephone-input .vti__search_box_container {
  display: flex;
}

.telephone-input .vti__dropdown {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0;
  padding: 7px 7px 7px 0;
}

.telephone-input .vti__input.vti__phone {
  padding-right: 3rem;
}

.telephone-input .vti__dropdown-list {
  padding: 0 !important;
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

.telephone-input .form-control.is-invalid {
  padding-right: 0.75rem;
  background-position: left calc(0.425em + 0.25rem) center;
}

.telephone-input .vti__dropdown-arrow {
  margin: 0 4px;
}

</style>
