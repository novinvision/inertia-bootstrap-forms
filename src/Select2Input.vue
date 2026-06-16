<script>
import './css/from-select.scss';
import Choices from 'choices.js';
import {computed, defineComponent, inject} from "vue";

export default defineComponent({
  emits: ['update:modelValue', 'search', 'searching', 'change', 'selected'],
  props: {
    name: {
      type: String,
      required: true,
    },
    modelValue: '',
    label: {
      type: String,
      default: null,
    },
    key: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'Click to choice',
    },
    searchPlaceholder: {
      type: String,
      default: 'Type for search...',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: {},
    },
    locale: {
      type: String,
      default: 'en',
    },
    options: Array,
    searchEnabled: {
      type: Boolean,
      default: false
    },
    hideDropdown: {
      type: Boolean,
      default: false
    },
    search: {
      type: Object,
      default: {
        url: null,
      }
    },
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
  computed: {
    selectedValue() {
      if (!this.multiple) {
        return this.modelValue;
      }

      return (typeof this.modelValue == 'object') ? Object.values(this.modelValue) : (this.modelValue ? [this.modelValue] : null)
    }
  },
  watch: {
    'options': {
      handler: function (val, old) {
        setTimeout(() => this.init(), 300);
      },
      deep: true
    }
  },
  methods: {
    init() {
      if (this.choices) {
        this.destroy();
      }

      this.choices = new Choices(this.$refs.input, {
        searchEnabled: (this.searchEnabled || !!this.search?.url),
        searchChoices: (this.searchEnabled && !this.search?.url),
        removeItemButton: true,
        placeholderValue: this.placeholder,
        searchPlaceholderValue: this.placeholder,
        shouldSort: false,
        itemSelectText: null,
        ...this.localeTranslates[this.currentLocale],
        ...this.config
      });

      this.$refs.input.addEventListener('search', this.searchHandle);
    },
    destroy() {
      this.$refs.input.removeEventListener('search', this.searchHandle);
      this.choices.destroy();
    },
    searchHandle(event) {
      this.$emit('search', event)
      clearTimeout(this.searchDebounceTimer);

      this.showLoading();

      this.searchDebounceTimer = setTimeout(() => {
        this.doSearch(event.detail.value);
      }, 400);
    },
    async showLoading() {
      this.loading = true;
      await this.choices.setChoices(
          [{ value: '', label: this.localeTranslates[this.currentLocale]['searchingPlaceholder'] || 'Searching...', disabled: true }],
          'value',
          'label',
          true  // replaceChoices
      );
    },
    async doSearch(searchTerm) {
      this.$emit('searching', searchTerm)
      if (!this.search?.url) return;

      if (this.searchController) {
        this.searchController.abort();
      }
      this.searchController = new AbortController();

      try {
        const res = await fetch(this.search.url + '?query=' + encodeURIComponent(searchTerm), {
          method: 'POST',
          signal: this.searchController.signal,
        });
        const data = await res.json();

        await this.choices.setChoices(
            data.map(item => ({
              value: ((this.key ? item[this.key] : item?.name ?? item?.label ?? item?.value) ?? item),
              label: (this.label ? item[this.label] : item?.name ?? item?.label ?? item?.value) ?? item,
            })),
            'value',
            'label',
            true
        );
        this.loading = false;
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.loading = false;
          console.error(err);
          await this.choices.setChoices([], 'value', 'label', true);
        }
      }
    }  },
  mounted() {
    if (this.locale === 'en' && document.dir === 'rtl') {
      this.currentLocale = 'fa';
    }

    this.init()
  },
  beforeUnmount() {
    this.destroy()
  },
  data() {
    return {
      choices: null,
      loading: false,
      searchDebounceTimer: null,
      searchController: null,
      currentLocale: this.locale,
      localeTranslates: {
        'fa': {
          placeholderValue: 'انتخاب کنید...',
          searchPlaceholderValue: 'برای جستجو تایپ کنید...',
          searchingPlaceholder: 'در حال جستجو...',
          loadingText: 'در حال جستجو...',
          noResultsText: 'نتیجه ای یافت نشد',
          noChoicesText: 'گزینه ای وجود ندارد',
        }
      },
    }
  }
})
</script>
<template>
  <div class="select2-controller" :class="{
        'is-invalid': form.errors[name],
        'select2-dropdown-hidden': hideDropdown === true
  }">
    <select
        v-bind="$props"
        :name="name"
        v-model="modelValue"
        class="form-control-select"
        :class="{
        'form-control-select--loading': loading,
        'is-invalid': form.errors[name]
      }"
        :placeholder="placeholder"
        ref="input">
      <option
          :value="((key ? item[key] : item?.name ?? item?.label ?? item?.value) ?? item)" v-for="(item, index) in options"
          :selected="multiple ? (selectedValue || []).includes(item.id || item) : (item?.id?.toString() || item) === modelValue?.toString()">
        {{ (label ? item[label] : item?.name ?? item?.label ?? item?.value) ?? item }}
      </option>
    </select>
  </div>
</template>
