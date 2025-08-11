<script>
import {Dropdown, DropdownToggle, DropdownMenu, InputGroup, InputGroupText} from 'vue3-bootstrap-components';
import {computed, inject} from "vue";
import QuantityInput from "./QuantityInput.vue";
import GroupControl from "./GroupControl.vue";

export default {
  components: {GroupControl, QuantityInput, InputGroup, InputGroupText, Dropdown, DropdownToggle, DropdownMenu},
  props: {
    name: {
      type: String,
      required: true,
    },
    required: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    options: {
      type: Array,
      default: [],
      required: true,
    },
    max: {
      type: Number,
      default: null,
    },
    totalMax: {
      type: Number,
      default: null,
    },
    min: {
      type: Number,
      default: 0,
    },
    totalMin: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: 'Number',
    },
  },
  setup(props) {
    let form = inject('form');
    let group = inject('group', {});

    if (form === undefined) {
      form = {
        errors: {},
        getID(name) {
        }
      };
    }

    if (!form[props.name]) {
      form[props.name] = props.min;
    }

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

    return {modelValue, form};
  },
  computed: {
    totalQuantity() {
      return this.modelValue ? Object.values(this.modelValue).reduce((sum, value) => sum + value, 0) : this.options.length;
    }
  },
  methods: {
    show(){
      this.showDropdown = !this.showDropdown;
    },
    clickOnOutside(e){
      if(!this.$refs.input.contains(e.target)){
        this.showDropdown = false;
      }
    }
  },
  mounted() {
    window.addEventListener('click', this.clickOnOutside);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.clickOnOutside);
  },
  data() {
    return {
      showDropdown : false,
    }
  }
}
</script>
<template>
  <div ref="input" class="multi-quantity-input fanum">
    <button type="button" class="form-control fanum dropdown-toggle" @click.prevent="show">
      {{ totalQuantity }} {{ unit }}
    </button>
    <div class="multi-quantity-input--dropdown" :class="{'show': showDropdown}">
      <GroupControl :name="name">
        <div class="row align-items-center justify-content-between g-0" v-for="(item, key) in options">
          <div class="col-auto" v-html="item?.name || item">
          </div>
          <div class="col-auto">
            <QuantityInput :name="key" :min="(item.min || min)" :max="(item.max || max)"/>
          </div>
        </div>
      </GroupControl>
    </div>
  </div>
</template>
<style>

.multi-quantity-input{
  position: relative;
}

.multi-quantity-input .dropdown-toggle {
  text-align: start;
}

.multi-quantity-input .dropdown-menu small {
  color: var(--bs-secondary-color, #cccccc)
}

.multi-quantity-input .input-group {
  align-items: center;
}

.multi-quantity-input .input-group .input-group-text {
  display: none;
}

.multi-quantity-input .input-group .form-control {
  width: 40px;
  padding-right: 3px;
  padding-left: 3px;
}

.multi-quantity-input .input-group .btn {
  display: flex;
  align-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50% !important;
  padding: 5px;
}

.multi-quantity-input .input-group .btn,
.multi-quantity-input .input-group .btn:active,
.multi-quantity-input .input-group .btn:focus {
  background-color: var(--bs-primary, #de0021);
  color: #ffffff;
}

.multi-quantity-input .input-group .btn svg,
.multi-quantity-input .input-group .btn svg path {
  fill: #ffffff;
}

.multi-quantity-input .multi-quantity-input--dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2;
}

.multi-quantity-input .multi-quantity-input--dropdown.show {
  color: var(--bs-body-color, #333333);
  background-color: var(--bs-body-bg, #ffffff);
  border-radius: var(--bs-border-radius, 1rem);
  display: block;
  padding: 10px 15px;
}
</style>
