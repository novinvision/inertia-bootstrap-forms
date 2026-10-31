<script>
import { computed, defineComponent, nextTick, reactive, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';
import { useBsInstance } from './composables/useBsInstance.js';
import { useDisposables } from './composables/useDisposables.js';
import { useI18n } from './i18n.js';

const isObject = (v) => v !== null && typeof v === 'object';
const isEmpty = (v) => v === null || v === undefined || v === '';

function readXsrf() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Bootstrap 6 Combobox (replaces the former choices.js based Select2Input).
 *
 *  - single / multiple selection, client side search or remote (AJAX) search
 *  - the value lives in the FormContainer's v-model, like every other field
 *  - slots: #option (menu items) and #selection (value shown in the toggle)
 */
export default defineComponent({
  name: 'ComboboxInput',
  emits: [
    'update:modelValue',
    'change',
    'selected',
    'clear',
    'search',
    'search-success',
    'search-error',
    'show',
    'shown',
    'hide',
    'hidden',
  ],
  props: {
    ...fieldProps,
    /** Strings, numbers or objects ({ id | value, name | label, description, disabled }). */
    options: { type: Array, default: () => [] },
    /** Property that holds the value of an option object (default: id → value → name → label). */
    valueKey: { type: String, default: null },
    /** Property that holds the label of an option object (default: name → label → title → value). */
    labelKey: { type: String, default: null },
    /** Legacy alias of `labelKey`. */
    label: { type: String, default: null },
    descriptionKey: { type: String, default: 'description' },
    multiple: { type: Boolean, default: false },
    placeholder: { type: String, default: null },
    /** Show a client-side search box. */
    searchEnabled: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: null },
    /**
     * Remote search: { url, method = 'POST', param = 'query', debounce = 400, minChars = 0, headers = {}, resultsKey }.
     * The endpoint must answer with a JSON array (or { data: [] }).
     */
    search: { type: Object, default: () => ({ url: null }) },
    /** Add an entry at the top of a single select that clears the value. */
    clearable: { type: Boolean, default: false },
    clearText: { type: String, default: null },
    noResultsText: { type: String, default: null },
    loadingText: { type: String, default: null },
    /** Text of a multiple select when more than one item is chosen. `{count}` is replaced. */
    selectedText: { type: String, default: null },
    /**
     * Multiple select only: show the chosen options themselves (true) instead of the
     * "N selected" counter (false, default).
     */
    showSelected: { type: Boolean, default: true },
    /** With `showSelected`: above this many chosen options the counter is shown instead. */
    maxVisible: { type: Number, default: null },
    /** Separator between the chosen labels (default: "، " for fa, ", " otherwise). */
    selectedSeparator: { type: String, default: null },
    searchNormalize: { type: Boolean, default: false },
    /** Floating UI placement of the menu. */
    placement: { type: String, default: 'bottom-start' },
    size: { type: String, default: null },
    /** Hide the caret icon. */
    hideDropdown: { type: Boolean, default: false },
    locale: { type: String, default: null },
  },
  setup(props, { emit, expose, slots }) {
    const field = useField(props, emit);
    const { t, locale } = useI18n(() => props.locale);
    const d = useDisposables();

    const root = ref(null);
    const toggle = ref(null);
    const menu = ref(null);
    const valueEl = ref(null);
    const searchInput = ref(null);

    const known = ref({}); // key -> option (every option ever seen, so labels survive remote searches)
    const remote = reactive({ results: null, loading: false, error: false });

    const remoteUrl = computed(() => props.search?.url || null);
    const hasSearch = computed(() => props.searchEnabled || !!remoteUrl.value);

    // ---------- option helpers ----------
    const valueOf = (item) => {
      if (!isObject(item)) return item;
      if (props.valueKey) return item[props.valueKey];
      return item.id ?? item.value ?? item.name ?? item.label;
    };
    const labelOf = (item) => {
      if (!isObject(item)) return item;
      const key = props.labelKey || props.label;
      return (key ? item[key] : (item.name ?? item.label ?? item.title ?? item.value)) ?? valueOf(item);
    };
    const descriptionOf = (item) => (isObject(item) ? item[props.descriptionKey] ?? null : null);
    const keyOf = (item) => String(valueOf(item));

    function register(list) {
      const next = { ...known.value };
      (list || []).forEach((o) => {
        next[keyOf(o)] = o;
      });
      known.value = next;
    }
    watch(() => props.options, (list) => register(list), { immediate: true, deep: true });

    // ---------- selection ----------
    const selectedRaw = computed(() => {
      const v = field.model.value;
      if (props.multiple) {
        if (Array.isArray(v)) return v;
        if (isObject(v)) return Object.values(v);
        return isEmpty(v) ? [] : [v];
      }
      return isEmpty(v) ? [] : [v];
    });
    const selectedKeys = computed(() => selectedRaw.value.map((v) => (isObject(v) ? keyOf(v) : String(v))));

    const labelForKey = (key) => {
      const option = known.value[key];
      return option !== undefined ? String(labelOf(option)) : key;
    };

    const selectedItems = computed(() =>
        selectedKeys.value.map((key) => {
          const option = known.value[key];
          return {
            key,
            raw: option,
            label: option !== undefined ? String(labelOf(option)) : key,
            description: option !== undefined ? descriptionOf(option) : null,
          };
        })
    );

    const separator = computed(() => props.selectedSeparator ?? (locale.value === 'fa' ? '، ' : ', '));

    // multiple + several chosen: list the options (showSelected) or show the counter
    const listsSelected = computed(
        () =>
            props.multiple &&
            props.showSelected &&
            selectedKeys.value.length > 1 &&
            (props.maxVisible === null || selectedKeys.value.length <= props.maxVisible)
    );

    // the #selection slot renders single values and the listed options of a multiple select
    const customSelection = computed(
        () => !!slots.selection && selectedKeys.value.length > 0 && (!props.multiple || selectedKeys.value.length === 1 || listsSelected.value)
    );

    const displayText = computed(() => {
      const keys = selectedKeys.value;
      if (!keys.length) return props.placeholder ?? t('select.placeholder');

      if (props.multiple && keys.length > 1) {
        if (listsSelected.value) return selectedItems.value.map((i) => i.label).join(separator.value);
        return (props.selectedText ?? t('select.selectedCount')).replace('{count}', keys.length);
      }
      return labelForKey(keys[0]);
    });

    // text that lives in `.combobox-value` (empty while the #selection slot is drawing the value)
    const plainText = computed(() => (customSelection.value ? '' : displayText.value));
    const showingPlaceholder = computed(() => selectedKeys.value.length === 0);

    // ---------- rendered options ----------
    const rendered = computed(() => {
      let list = remote.results ?? props.options;

      if (remote.results && props.multiple) {
        // keep the already selected items visible while searching
        const present = new Set(list.map(keyOf));
        const extra = selectedKeys.value.filter((k) => !present.has(k) && known.value[k] !== undefined).map((k) => known.value[k]);
        list = [...extra, ...list];
      }

      return list.map((item) => ({
        raw: item,
        key: keyOf(item),
        label: labelOf(item),
        description: descriptionOf(item),
        disabled: isObject(item) && !!item.disabled,
      }));
    });

    // ---------- DOM sync (Bootstrap owns classes of the items, Vue owns their existence) ----------
    function syncSelection() {
      if (!menu.value) return;
      const selected = new Set(selectedKeys.value);
      menu.value.querySelectorAll('.menu-item[data-bs-value]').forEach((el) => {
        const on = selected.has(el.dataset.bsValue) && el.dataset.bsValue !== '';
        el.classList.toggle('selected', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function syncDisplay() {
      if (!valueEl.value) return;
      valueEl.value.textContent = plainText.value;
      valueEl.value.classList.toggle('combobox-placeholder', showingPlaceholder.value);
    }

    function syncInvalid() {
      toggle.value?.classList.toggle('is-invalid', field.isInvalid.value);
    }

    function sync() {
      syncSelection();
      syncDisplay();
      syncInvalid();
    }

    watch([() => field.model.value, rendered, plainText, field.isInvalid], () => nextTick(sync), { flush: 'post' });

    // ---------- Bootstrap events ----------
    function toRaw(key) {
      const option = known.value[key];
      return option !== undefined ? valueOf(option) : key;
    }

    function onBsChange(event) {
      let next;
      let chosen;

      if (props.multiple) {
        const keys = event.value || [];
        next = keys.map(toRaw);
        chosen = keys.map((k) => known.value[k]);
      } else if (event.value === '' || event.value === undefined) {
        next = null;
        chosen = null;
      } else {
        next = toRaw(event.value);
        chosen = known.value[event.value];
      }

      field.model.value = next;
      if (next === null) emit('clear');
      emit('selected', chosen);
      field.emitChange(next, event);

      // Bootstrap just rewrote the label in English; restore the real one
      nextTick(sync);
      syncDisplay();
    }

    // ---------- remote search ----------
    let timer = null;
    let controller = null;
    d.add(() => {
      clearTimeout(timer);
      controller?.abort();
    });

    function resetClientFilter() {
      if (!menu.value) return;
      menu.value.querySelectorAll('.menu-item[data-bs-value]').forEach((el) => {
        el.style.display = '';
      });
      menu.value.querySelector('.combobox-no-results')?.classList.toggle('d-none', rendered.value.length > 0);
    }

    async function runSearch(term) {
      const cfg = props.search || {};
      if (!cfg.url) return;

      controller?.abort();
      controller = new AbortController();
      remote.loading = true;
      remote.error = false;

      try {
        const url = new URL(cfg.url, window.location.origin);
        url.searchParams.set(cfg.param || 'query', term);

        const headers = {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(cfg.headers || {}),
        };
        const xsrf = readXsrf();
        if (xsrf && !headers['X-XSRF-TOKEN']) headers['X-XSRF-TOKEN'] = xsrf;

        const response = await fetch(url, {
          method: (cfg.method || 'POST').toUpperCase(),
          headers,
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        const list = Array.isArray(json) ? json : json?.[cfg.resultsKey || 'data'] ?? json?.results ?? [];

        register(list);
        remote.results = list;
        remote.loading = false;
        emit('search-success', list);

        await nextTick();
        resetClientFilter();
        sync();
      } catch (error) {
        if (error?.name === 'AbortError') return;
        remote.loading = false;
        remote.error = true;
        remote.results = [];
        emit('search-error', error);
        await nextTick();
        resetClientFilter();
      }
    }

    function onSearchInput(event) {
      const term = event.target.value;
      emit('search', term);

      if (!remoteUrl.value) return;
      clearTimeout(timer);

      const minChars = props.search?.minChars ?? 0;
      if (term.length < minChars) {
        controller?.abort();
        remote.results = null;
        remote.loading = false;
        return;
      }

      remote.loading = true;
      timer = setTimeout(() => runSearch(term), props.search?.debounce ?? 400);
    }

    // ---------- Bootstrap instance ----------
    let offs = [];
    const { instance, create } = useBsInstance(
        'Combobox',
        () => toggle.value,
        () => ({
          multiple: props.multiple,
          placeholder: props.placeholder ?? t('select.placeholder'),
          placement: props.placement,
          search: hasSearch.value,
          searchNormalize: props.searchNormalize,
        }),
        {
          onCreate(inst, el) {
            const on = (target, type, fn) => {
              target.addEventListener(type, fn);
              offs.push(() => target.removeEventListener(type, fn));
            };

            on(el, 'change.bs.combobox', onBsChange);
            on(el, 'show.bs.combobox', (e) => emit('show', e));
            on(el, 'shown.bs.combobox', (e) => emit('shown', e));
            on(el, 'hide.bs.combobox', (e) => emit('hide', e));
            on(el, 'hidden.bs.combobox', (e) => {
              if (remote.results !== null) {
                remote.results = null; // back to the initial options
                remote.error = false;
                nextTick(() => {
                  resetClientFilter();
                  sync();
                });
              }
              emit('hidden', e);
            });

            if (searchInput.value) {
              on(searchInput.value, 'input', onSearchInput);
              on(searchInput.value, 'keydown', (e) => e.key === 'Enter' && e.preventDefault());
            }

            sync();
          },
          onDestroy() {
            offs.forEach((off) => off());
            offs = [];
          },
        }
    );

    // Options that change what the plugin reads at construction time
    watch(
        () => [props.multiple, hasSearch.value, props.placement, props.searchNormalize],
        async () => {
          await nextTick();
          create();
        }
    );

    expose({
      show: () => instance.value?.show(),
      hide: () => instance.value?.hide(),
      toggle: () => instance.value?.toggle(),
      clear: () => {
        field.model.value = props.multiple ? [] : null;
        emit('clear');
        field.emitChange(field.model.value);
      },
      focus: () => toggle.value?.focus(),
    });

    return {
      ...field,
      t,
      root,
      toggle,
      menu,
      valueEl,
      searchInput,
      remote,
      hasSearch,
      rendered,
      displayText,
      plainText,
      selectedItems,
      customSelection,
      separator,
      selectedSet: computed(() => new Set(selectedKeys.value)),
      showingPlaceholder,
      sizeClass: computed(() => (props.size ? `form-control-${props.size}` : null)),
    };
  },
});
</script>

<template>
  <div ref="root" class="combobox">
    <button
        ref="toggle"
        type="button"
        class="combobox-toggle form-control"
        :class="sizeClass"
        data-bs-toggle="combobox"
        :id="inputId"
        :disabled="isDisabled || readonly"
        aria-haspopup="listbox"
        :aria-invalid="isInvalid || undefined"
        :aria-required="required || undefined"
    >
            <span v-if="customSelection" class="combobox-selection d-flex align-items-center flex-wrap gap-2 text-start">
                <template v-for="(item, index) in selectedItems" :key="item.key">
                    <slot
                        name="selection"
                        :option="item.raw"
                        :label="item.label"
                        :description="item.description"
                        :value="item.key"
                        :index="index"
                        :multiple="multiple"
                    >{{ item.label }}</slot>
                </template>
            </span>
      <span ref="valueEl" class="combobox-value" :class="{ 'combobox-placeholder': showingPlaceholder }" v-text="plainText"></span>
      <svg
          v-if="!hideDropdown"
          class="combobox-caret"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
      >
        <path d="m3 6 5 5 5-5" />
      </svg>
    </button>

    <div ref="menu" class="menu" role="listbox" :aria-multiselectable="multiple || undefined">
      <div v-if="hasSearch" class="combobox-search">
        <input
            ref="searchInput"
            type="search"
            class="form-control combobox-search-input"
            autocomplete="off"
            :placeholder="searchPlaceholder ?? t('select.search')"
        />
      </div>

      <div v-if="remote.loading" class="menu-header" role="status">{{ loadingText ?? t('select.loading') }}</div>
      <div v-else-if="remote.error" class="menu-header" role="alert">{{ t('select.error') }}</div>

      <button
          v-if="clearable && !multiple"
          type="button"
          class="menu-item"
          data-bs-value=""
          role="option"
      >
        <span class="menu-item-content"><span>{{ clearText ?? t('select.clear') }}</span></span>
      </button>

      <button
          v-for="item in rendered"
          :key="item.key"
          type="button"
          class="menu-item"
          role="option"
          :data-bs-value="item.key"
          :disabled="item.disabled || undefined"
      >
                <span class="menu-item-content">
                    <slot
                        name="option"
                        :option="item.raw"
                        :label="item.label"
                        :description="item.description"
                        :value="item.key"
                        :selected="selectedSet.has(item.key)"
                        :disabled="item.disabled"
                    >
                        <span>{{ item.label }}</span>
                        <span v-if="item.description" class="menu-item-description">{{ item.description }}</span>
                    </slot>
                </span>
        <svg
            class="menu-item-check"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <path d="m3.5 8.5 3 3 6-7" />
        </svg>
      </button>

      <div class="combobox-no-results d-none">{{ noResultsText ?? t('select.noResults') }}</div>
    </div>
  </div>
</template>