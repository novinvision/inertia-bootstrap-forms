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
      default: 1,
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
      form[props.name] = 1;
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
  methods: {},
  data() {
    return {}
  }
}
</script>
<template>
  <Dropdown class="multi-quantity-input">
    <DropdownToggle class="form-control fanum" data-bs-auto-close="outside">
      {{ totalQuantity }} {{unit}}
    </DropdownToggle>
    <DropdownMenu>
      <GroupControl :name="name">
        <div class="row align-items-center justify-content-between g-0" v-for="(item, key) in options">
          <div class="col-auto" v-html="item?.name || item">
          </div>
          <div class="col-auto">
            <QuantityInput :name="key" :min="(item.min || min)" :max="(item.max || max)"/>
          </div>
        </div>
      </GroupControl>
    </DropdownMenu>
  </Dropdown>
</template>
<style>
.multi-quantity-input .dropdown-toggle {
  text-align: start;
}

.multi-quantity-input .dropdown-menu {
  width: 100%;
  padding: 10px 15px;
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
</style>
