# inertia-bootstrap-forms

A Vue 3 component library for building Bootstrap‑styled forms inside **Laravel + Inertia.js** applications. Every input component binds itself automatically to an [Inertia `useForm`](https://inertiajs.com/forms) instance through a `<FormContainer>` wrapper, so you stop wiring up `v-model`, error classes, and field names by hand for every form.

This package has been developed and maintained by **[Novin Vision](https://novinvision.com)** (شرکت **[نوین ویژن](https://novinvision.com)**), a team specialized in **[طراحی سایت](https://novinvision.com)** and **[web design](https://novinvision.com)**.

# About Us

Novin Vision focuses on building modern and practical web solutions for businesses and developers who want a reliable digital presence. The approach is simple: clean design, solid development, and results that can be used in real projects without complexity.

If you want to learn more or get in touch, you can visit:  
https://novinvision.com

## License

The use of this package is completely free. You are allowed to use it in personal and commercial projects without any restriction or payment.

---

Built and maintained by **Novin Vision**
```vue
<FormContainer v-model="formData" url="/products">
  <div class="row g-3">
    <div class="col-12 col-sm-6">
      <FormLabel>Name</FormLabel>
      <TextInput name="name" />
    </div>
    <div class="col-12 col-sm-3">
      <FormLabel>Alias</FormLabel>
      <TextInput name="slug" />
    </div>
    <div class="col-12 col-sm-3">
      <FormLabel>Status</FormLabel>
      <Select2Input name="status" :options="[
        { id: 'active', name: 'Active' },
        { id: 'disable', name: 'Disabled' },
        { id: 'draft', name: 'Draft' }
      ]" />
    </div>
    <div class="col-12 col-sm-6">
      <FormLabel>New Image</FormLabel>
      <FileInput name="new_thumbnail" />
    </div>
    <div class="col-12">
      <FormLabel>Description</FormLabel>
      <EditorInput name="description" />
    </div>
    <div class="col-12 text-end">
      <SubmitButton />
    </div>
  </div>
</FormContainer>
```

---

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Global Setup (required helpers)](#global-setup-required-helpers)
4. [Core Concepts](#core-concepts)
5. [Component Reference](#component-reference)
   - [FormContainer](#formcontainer)
   - [FormLabel](#formlabel)
   - [GroupControl](#groupcontrol)
   - [TextInput](#textinput)
   - [TextAreaInput](#textareainput)
   - [EmailInput](#emailinput)
   - [PasswordInput](#passwordinput)
   - [MobileInput](#mobileinput)
   - [TelInput](#telinput)
   - [AmountInput](#amountinput)
   - [QuantityInput](#quantityinput)
   - [MultiQuantityInput](#multiquantityinput)
   - [CheckboxInput](#checkboxinput)
   - [CheckboxButtonInput](#checkboxbuttoninput)
   - [CheckboxToggle](#checkboxtoggle)
   - [Select2Input](#select2input)
   - [PersianDatePickerInput](#persiandatepickerinput)
   - [RangeSliderInput](#rangesliderinput)
   - [StarRatingInput](#starratinginput)
   - [CaptchaInput](#captchainput)
   - [EditorInput](#editorinput)
   - [LocationInput](#locationinput)
   - [FileInput](#fileinput)
   - [SimpleUploader](#simpleuploader)
   - [DropzoneInput](#dropzoneinput)
   - [UppyInput](#uppyinput)
   - [SubmitButton](#submitbutton)
6. [Upload Endpoint Contract (backend)](#upload-endpoint-contract-backend)
7. [Styling & Theming](#styling--theming)
8. [TypeScript](#typescript)
9. [Known Limitations](#known-limitations)

---

## Requirements

The package itself only ships the Vue components (plus a few smaller libraries that are already bundled into `dist/`). The following must exist in the **host** application:

| Requirement | Why |
|---|---|
| Vue `^3.0` | The components are plain Vue 3 SFCs. |
| `@inertiajs/vue3` `>2.0` | `FormContainer` calls Inertia's `useForm()` internally. |
| Bootstrap 5 CSS (`.form-control`, `.btn`, `.input-group`, `.form-check`, CSS variables like `--bs-*`, etc.) | All markup/classes assume Bootstrap 5 is loaded. |
| `dropzone` `^6.0.0-beta.2` | Only needed if you use `<DropzoneInput>`. |
| `@tinymce/tinymce-vue` | Only needed if you use `<EditorInput>` (TinyMCE). |
| `@vue-leaflet/vue-leaflet` + `leaflet` | Only needed if you use `<LocationInput>`. |
| `vue-tel-input` | Only needed if you use `<TelInput>`. |
| `vue3-persian-datetime-picker` | Only needed if you use `<PersianDatePickerInput>`. |
| `maska` | Only needed if you use `<AmountInput>` or `<QuantityInput>` (number masking). |
| `axios` available globally as `window.axios` | Used internally by `<FileInput>`. Laravel's default `resources/js/bootstrap.js` already does this (`window.axios = require('axios')`). |

The following libraries are **already bundled inside `dist/`** and do **not** need to be installed separately: `vue3-bootstrap-components`, `choices.js`, `svelte-range-slider-pips`, `@uppy/core`, `@uppy/vue`, `@uppy/xhr-upload`.

---

## Installation

### 1. Install the package

This package isn't necessarily on the public npm registry, so install it however it was distributed to you:

```bash
# from a private/internal npm registry
npm install inertia-bootstrap-forms

# from a Git repository
npm install git+https://github.com/novinvision/inertia-bootstrap-forms.git

# from a local folder or tarball
npm install file:../path/to/inertia-bootstrap-forms
```

### 2. Install the peer libraries you actually need

You don't have to install all of them — only the ones backing the components you use:

```bash
npm install @inertiajs/vue3 dropzone @tinymce/tinymce-vue \
  @vue-leaflet/vue-leaflet leaflet vue-tel-input \
  vue3-persian-datetime-picker maska
```

### 3. Import the package styles

```js
// resources/js/app.js
import 'inertia-bootstrap-forms/dist/style.css';
```

### 4. Register the components

You can either import components individually (recommended, keeps the bundle small):

```vue
<script setup>
import { FormContainer, FormLabel, TextInput, SubmitButton } from 'inertia-bootstrap-forms';
</script>
```

…or register everything globally once, in `app.js`:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import * as InertiaBootstrapForms from 'inertia-bootstrap-forms';
import 'inertia-bootstrap-forms/dist/style.css';

createInertiaApp({
  resolve: name => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) }).use(plugin);

    Object.entries(InertiaBootstrapForms).forEach(([name, component]) => {
      if (name !== 'default') app.component(name, component);
    });

    app.mount(el);
  },
});
```

---

## Global Setup (required helpers)

Two components (`AmountInput`, `QuantityInput`) rely on globals that this package does **not** provide. You need to register them yourself in `app.js` before those components will work.

### `v-maska` directive

`AmountInput` and `QuantityInput` use `v-maska` (from the [`maska`](https://www.npmjs.com/package/maska) package) to format numbers with thousand separators while typing.

```bash
npm install maska
```

```js
import { vMaska } from 'maska/vue';

app.directive('maska', vMaska);
```

You can use any version/config of `maska` you like — the components only depend on the directive name (`v-maska`) and the `@maska` event payload (`event.detail.unmasked`), so feel free to follow Maska's own documentation for advanced masking options.

### `$number` global helper

The same two components call `this.$number.toEnglish(...)` to convert localized (Persian/Arabic-Indic) digits typed by the user into plain English digits before storing them in the form. This helper is **not bundled** — you need to provide it as a global property. A minimal implementation that mirrors the digit conversion already used internally by `FormContainer` on submit:

```js
// resources/js/plugins/number.js
const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const arabicDigits  = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

export default {
  install(app) {
    app.config.globalProperties.$number = {
      toEnglish(value) {
        if (value === null || value === undefined) return value;
        let str = value.toString();
        persianDigits.forEach((d, i) => { str = str.replaceAll(d, i); });
        arabicDigits.forEach((d, i) => { str = str.replaceAll(d, i); });
        return str.replaceAll(',', '');
      }
    };
  }
};
```

```js
import NumberPlugin from './plugins/number';
app.use(NumberPlugin);
```

If you don't use `AmountInput` or `QuantityInput`, you can skip this section entirely.

### Optional: Font Awesome

`CaptchaInput` renders a refresh icon using a Font Awesome class (`fal fa-sync-alt`, Pro "light" style). If you don't load Font Awesome Pro, the button still works — you just won't see the icon. Swap in your own icon via the component's markup if needed.

---

## Core Concepts

### `FormContainer` and the injected `form`

`<FormContainer>` wraps Inertia's `useForm()` and `provide()`s it to every descendant via Vue's `provide`/`inject`. All the field components below `inject` this `form` object and read/write `form[name]` automatically — that's the entire trick behind not having to wire `v-model` on every field yourself.

```vue
<FormContainer v-model="formData" url="/login" method="post" reset-on-success>
  <TextInput name="email" />
  <PasswordInput name="password" />
  <SubmitButton />
</FormContainer>
```

`FormContainer` props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `url` | String | `''` | Endpoint the form submits to. |
| `method` | String | `'post'` | HTTP method passed to Inertia's `form.submit()`. |
| `only` | Array | `[]` | Inertia partial-reload `only` option. |
| `modelValue` | Object | `{}` | Initial data for the form (also works with `v-model`). |
| `options` | Object | `{}` | Extra fields merged into the Inertia form state (e.g. defaults that aren't real inputs). |
| `resetOnSuccess` | Boolean | `false` | Calls `form.reset()` automatically after a successful submit. |
| `submitHandler` | Function | `null` | If provided, this function is called instead of the default Inertia submit flow — useful for custom submit logic (e.g. confirmation modals). |

Events: `submit`, `reset`, `onStart`, `onFinish`, `onSuccess`, `onError`, `change`, `update:modelValue`.

Slots:
- default — scoped with `{ form, submit }`, the actual form fields.
- `errors` — override the default error `<Alert>` block.
- `message` — override the default success `<Alert>` block (shown when the backend response includes a `message` prop).

Exposed methods (via template ref): `submit()`, `reset()`.

Notable built-in behavior: on submit, `FormContainer` converts any Persian/Arabic-Indic digits present in the form's values to plain English digits before sending the request — handy for numeric fields typed with a Persian keyboard.

### Field naming & binding

Every field component takes a `name` prop. As long as it lives inside a `<FormContainer>` (or any component that injects a `form`), it automatically reads/writes `form[name]` — no manual `v-model` needed:

```vue
<TextInput name="title" />
<!-- equivalent to manually doing -->
<input v-model="form.title" name="title" class="form-control">
```

Validation errors are read from `form.errors[name]` and applied as Bootstrap's `is-invalid` class automatically.

### Grouped / repeated fields — `GroupControl`

`<GroupControl name="...">` lets a *block* of fields write into a nested/indexed slice of the form data instead of the top level — useful for repeating rows (e.g. multiple bid items, multiple contacts, etc.).

Each `<GroupControl>` instance figures out its own index (`groupID`) based on its position among sibling `.form-control-group` blocks, so the typical pattern is to repeat the **whole** `<GroupControl>` with `v-for`:

```vue
<div v-for="(row, index) in rows" :key="index">
  <GroupControl name="bids">
    <TextInput name="title" />
    <AmountInput name="price" />
  </GroupControl>
</div>
```

This produces `form.bids[0].title`, `form.bids[0].price`, `form.bids[1].title`, etc.

`MultiQuantityInput` (documented below) uses a single `GroupControl` to collect a *map* of quantities (`form.tickets.adult`, `form.tickets.child`, …) instead of a repeated list — see its own example for that variant.

### Validation & error display

`FormContainer` renders a default Bootstrap `Alert` listing every message in `form.errors` (replaceable via the `errors` slot), and every field adds `is-invalid` automatically when `form.errors[name]` exists. You don't need to render error text per-field unless you want to — Bootstrap will show `.invalid-feedback` siblings if you add them yourself.

### Element IDs

`form.getID(field)` (available on the injected `form`) builds a unique, collision-free `id` attribute for fields, taking the surrounding `<FormContainer>` id and any `GroupControl` into account. Components that render a real `<label for="">`/`<input id="">` pair (e.g. `TextInput`, `CheckboxInput`) use this automatically.

---

## Component Reference

### FormContainer

See [Core Concepts](#formcontainer-and-the-injected-form) above for the full prop/event/slot table.

### FormLabel

Simple `<label>` wrapper that appends a red `*` when `required` is set.

```vue
<FormLabel required>Email address</FormLabel>
```

| Prop | Type | Default |
|---|---|---|
| `required` | Boolean | `false` |

Slot: default — label text.

### GroupControl

See [Grouped / repeated fields](#grouped--repeated-fields--groupcontrol) above.

| Prop | Type | Required |
|---|---|---|
| `name` | String | yes |

### TextInput

The base text field. Most other "shortcut" inputs (`EmailInput`, `PasswordInput`, `MobileInput`) are thin wrappers around this component.

```vue
<TextInput name="full_name" />
```

| Prop | Type | Required |
|---|---|---|
| `name` | String | yes |

Renders a plain `<input type="text" class="form-control">` bound to `form[name]`.

### TextAreaInput

Same binding pattern as `TextInput`, renders a `<textarea class="form-control">`.

```vue
<TextAreaInput name="description" />
```

| Prop | Type | Required |
|---|---|---|
| `name` | String | yes |

### EmailInput

Thin wrapper around `TextInput` (`type="email"`, Persian placeholder "ایمیل خود را وارد کنید").

```vue
<EmailInput name="email" />
```

> **Note:** see [Known Limitations](#known-limitations) — the `name` prop on this specific wrapper is not declared correctly in the current source, so passing a custom `name` may not bind to the form data as expected. If that affects you, use `<TextInput name="..." type="email" />` directly instead.

### PasswordInput

Thin wrapper around `TextInput` (`type="password"`, Persian placeholder "گذرواژه خود را وارد کنید").

```vue
<PasswordInput name="password" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `'password'` |

### MobileInput

Thin wrapper around `TextInput` (`type="tel"`, Persian placeholder "موبایل خود را وارد کنید").

```vue
<MobileInput name="mobile" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `'mobile'` |

### TelInput

Full international phone input powered by the **external package `vue-tel-input`**. Defaults to Iran (`ir`) with a preferred-country list (`ir`, `us`, `tr`, `ca`) and a searchable country dropdown.

```vue
<TelInput name="phone" placeholder="912 345 6789" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `'email'` (see [Known Limitations](#known-limitations)) |
| `placeHolder` | String | `'000 000 0000'` |

Since this wraps `vue-tel-input`, all of that package's own configuration (locales, validation rules, dial-code formatting, flags, styling, etc.) can be controlled by following [vue-tel-input's documentation](https://www.npmjs.com/package/vue-tel-input) and adjusting the source if you need options beyond what's hard-coded here (`mode`, `defaultCountry`, `preferredCountries`, `dropdownOptions`).

### AmountInput

Numeric input with thousands-separator masking (via **external package `maska`** — see [Global Setup](#v-maska-directive)) and a trailing unit label.

```vue
<AmountInput name="price" unit="تومان" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `required` | Boolean | `false` |
| `disabled` | Boolean | `false` |
| `readonly` | Boolean | `false` |
| `placeholder` | String | `'عدد را وارد کنید'` |
| `unit` | String | `'عدد'` |

Slot: `suffix` — extra content appended after the unit label (inside the Bootstrap `InputGroup`).

Requires the `v-maska` directive and `$number.toEnglish()` global helper — see [Global Setup](#global-setup-required-helpers).

### QuantityInput

Stepper-style numeric input (`+` / `-` buttons) with the same masking as `AmountInput`.

```vue
<QuantityInput name="qty" :min="1" :max="10" unit="عدد" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `required` | Boolean | `false` |
| `disabled` | Boolean | `false` |
| `readonly` | Boolean | `false` |
| `unit` | String | `'عدد'` |
| `min` | Number | `0` |
| `max` | Number | `null` |

Slot: `suffix`.

Also requires the `v-maska` directive and `$number.toEnglish()` — see [Global Setup](#global-setup-required-helpers).

### MultiQuantityInput

A dropdown of multiple `QuantityInput` rows (e.g. "2 adults, 1 child") that collapses into a single summary button. Internally wraps its options in one `GroupControl`, so the result is stored as a map: `form[name][optionKey]`.

```vue
<MultiQuantityInput
  name="tickets"
  unit="نفر"
  :options="[
    { name: 'بزرگسال', min: 1, max: 10 }, // key: 0
    { name: 'کودک', min: 0, max: 10 },     // key: 1
  ]"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | String | required | |
| `options` | Array | required | Each item can be a plain string or `{ name, min, max }`. The array index becomes the data key. |
| `required` | Boolean | `false` | |
| `disabled` | Boolean | `false` | |
| `readonly` | Boolean | `false` | |
| `max` | Number | `null` | Fallback max applied to options without their own `max`. |
| `totalMax` | Number | `null` | (declared, not currently enforced in the template logic) |
| `min` | Number | `0` | Fallback min applied to options without their own `min`. |
| `totalMin` | Number | `null` | (declared, not currently enforced in the template logic) |
| `unit` | String | `'Number'` | Label shown on the collapsed summary button. |

### CheckboxInput

Single checkbox/radio bound through the same `form`/`group` injection pattern as text fields.

```vue
<CheckboxInput name="accept_terms" value="yes">I agree to the terms</CheckboxInput>
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `id` | String | `''` |
| `value` | String / Number | `'yes'` |
| `type` | String | `'checkbox'` (can be set to `'radio'`) |

Event: `change`. Slot: default — label text.

To build a checkbox/radio **group**, repeat the component with the same `name` and different `value`s; bind the initial form value to an array for multi-select checkboxes, or a scalar for radios.

### CheckboxButtonInput

Same idea as `CheckboxInput` but styled as a Bootstrap "button checkbox/radio" (`.btn-check` + label) instead of a native checkbox UI.

```vue
<CheckboxButtonInput name="plan" value="monthly">Monthly</CheckboxButtonInput>
<CheckboxButtonInput name="plan" value="yearly">Yearly</CheckboxButtonInput>
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `id` | String | `''` |
| `value` | String | `'yes'` |
| `type` | String | `'radio'` |

Event: `change`. Wrap the rendered `<label>` in your own `.btn-group`/`.btn` classes for the typical Bootstrap button-group look.

### CheckboxToggle

A larger, card-style toggle (background highlight when checked) — good for plan pickers, add-on selectors, etc.

```vue
<CheckboxToggle name="addons" value="extra_luggage">Extra luggage</CheckboxToggle>
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `id` | String | `''` |
| `value` | String / Number | `'yes'` |
| `type` | String | `'checkbox'` |
| `hideInput` | Boolean | `false` — visually hides the native input while keeping the toggle clickable. |

Event: `change`.

### Select2Input

Searchable dropdown powered by the **external package `choices.js`**, with optional remote/async search.

```vue
<Select2Input
  name="category_id"
  :options="categories"
  label="title"
  placeholder="Select a category"
  search-enabled
/>

<!-- Remote search -->
<Select2Input
  name="user_id"
  :search="{ url: '/api/users/search' }"
  placeholder="Search a user..."
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | String | required | |
| `options` | Array | — | Array of objects (or plain strings/numbers). |
| `label` | String | `null` | Object field used as the display label. Falls back to `name` / `label` / `value`. |
| `placeholder` | String | `'Click to choice'` | |
| `searchPlaceholder` | String | `'Type for search...'` | |
| `multiple` | Boolean | `false` | |
| `required` | Boolean | `false` | |
| `config` | Object | `{}` | Merged into `choices.js`'s own config — use this for any Choices.js option not exposed above. |
| `locale` | String | `'en'` | Set to `'fa'` (or rely on auto-detection from `document.dir === 'rtl'`) for built-in Persian UI strings. |
| `searchEnabled` | Boolean | `false` | Enables local in-list searching. Automatically `true` when `search.url` is set. |
| `hideDropdown` | Boolean | `false` | |
| `search` | Object | `{ url: null }` | When `url` is set, typing triggers a debounced `POST` request (`?query=...`) and replaces the option list with the JSON response. |

Events: `update:modelValue`, `search`, `searching`, `change`, `selected`.

> **Note:** the prop named `key` (meant to pick which object field is used as the option *value*) cannot actually be set from a template, because Vue reserves `:key` for its own list-rendering mechanism. The default value-resolution (`id` → `name` → `label` → `value`) is used instead. See [Known Limitations](#known-limitations).

Since this wraps Choices.js, any configuration option supported by that library can be passed through the `config` prop — see [Choices.js documentation](https://github.com/Choices-js/Choices) for the full list (custom templates, callback hooks, RTL, etc.).

### PersianDatePickerInput

Persian (Jalali) date/time picker powered by the **external package `vue3-persian-datetime-picker`**.

```vue
<PersianDatePickerInput name="birth_date" />
<PersianDatePickerInput name="appointment" calendar="datetime" view="datetime" range />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `calendar` | String | `'date'` |
| `view` | String | `'date'` |
| `min` | String | — |
| `max` | String | — |
| `range` | Boolean | `false` |
| `locale` | String | `'fa'` |
| `format` | String | `'jYYYY-jMM-jDD'` |
| `inputFormat` | String | `null` (falls back to `format`) |
| `placeholder` | String | `'انتخاب تاریخ'` |

Event: `change`. Method exposed: `clear()`.

Any option supported by `vue3-persian-datetime-picker` itself (Gregorian mode, time steps, custom themes, etc.) can be used by following [that package's own documentation](https://www.npmjs.com/package/vue3-persian-datetime-picker) and extending the source where needed.

### RangeSliderInput

Slider input powered by the **external package `svelte-range-slider-pips`**.

```vue
<RangeSliderInput name="budget" :min="0" :max="1000" :step="10" />
<RangeSliderInput name="price_range" :min="0" :max="1000" range />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `null` |
| `modelValue` | Number | `0` |
| `min` | Number | `1` |
| `max` | Number | `100` |
| `step` | Number | `1` |
| `readonly` | Boolean | `false` |
| `range` | Boolean | `false` — emits `[min, max]` instead of a single value. |
| `options` | Object | `{}` | Passed straight through to `svelte-range-slider-pips` — use this for pips formatting, colors, springs, etc. See [that package's docs](https://github.com/simeydotme/svelte-range-slider-pips) for everything it supports. |

Events: `update:modelValue`, `change`.

### StarRatingInput

Hover/click star rating, no external dependency.

```vue
<StarRatingInput name="rating" :max-stars="5" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `null` |
| `modelValue` | Number | `0` |
| `maxStars` | Number | `5` |
| `precision` | Number | `2` |
| `showValue` | Boolean | `true` |
| `readonly` | Boolean | `false` |

Event: `update:modelValue`.

### CaptchaInput

Image captcha field with a refresh button. Expects a backend endpoint that returns a captcha **image** for `GET` and re-rolls automatically whenever the form finishes processing (e.g. after a failed submit).

```vue
<CaptchaInput url="/captcha/default" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `'captcha'` |
| `url` | String | `'/captcha/default'` |
| `required` | Boolean | `false` |
| `placeholder` | String | `'کد امنیتی روبرو را وارد کنید'` |

Must be used inside a `<FormContainer>` (it injects `form` directly, without a fallback). A Persian comment in the source notes a ready-to-pair Laravel captcha endpoint is expected at `url`.

### EditorInput

Rich-text editor powered by the **external package `@tinymce/tinymce-vue`** (TinyMCE).

```vue
<EditorInput name="body" :options="{ height: 400 }" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `placeholder` | String | `''` |
| `disabled` | Boolean | `false` |
| `options` | Object | `{}` — merged into TinyMCE's own `init` config. |

Event: `update:modelValue`. Exposed: `editor()` — returns the underlying TinyMCE editor instance.

TinyMCE typically needs either a hosted script/API key or a self-hosted bundle — refer to [TinyMCE's Vue integration docs](https://www.tiny.cloud/docs/tinymce/latest/vue-cloud/) for licensing/configuration details and pass any extra option (toolbar, plugins, content_css, license_key, etc.) through the `options` prop.

### LocationInput

Interactive map picker (click or drag a marker) powered by **external packages `@vue-leaflet/vue-leaflet` and `leaflet`**, using OpenStreetMap tiles.

```vue
<LocationInput name="location" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | `'location'` |
| `disabled` | Boolean / String | `false` |
| `readonly` | Boolean / String | `false` |
| `modelValue` | Object | `{ lat, lng }` |

Event: `update:modelValue`. Stores `{ lat, lng }` into `form[name]`.

Since this wraps Vue-Leaflet, any Leaflet/Vue-Leaflet feature (custom tile providers, zoom controls, extra layers) can be added by following [Vue-Leaflet's documentation](https://vue-leaflet.github.io/vue-leaflet/) and extending the component's `<l-map>` template if you need more than a single draggable marker.

### FileInput

Single/multiple file uploader using `axios` (global `window.axios`) with a per-file progress bar, retry, and delete.

```vue
<FileInput name="avatar" endpoint="/upload" />
<FileInput name="gallery" endpoint="/upload" multiple />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `multiple` | Boolean | `false` |
| `endpoint` | String | `'/upload'` |

Event: `update:modelValue`. See [Upload Endpoint Contract](#upload-endpoint-contract-backend).

### SimpleUploader

Functionally identical to `FileInput`, but uses the native `fetch` API instead of `axios` — use this one if you don't have `window.axios` configured globally.

```vue
<SimpleUploader name="avatar" endpoint="/upload" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `multiple` | Boolean | `false` |
| `endpoint` | String | `'/upload'` |

### DropzoneInput

Drag-and-drop uploader powered by the **external package `dropzone`** (Dropzone.js).

```vue
<DropzoneInput name="documents" url="/upload" multiple :options="{ maxFiles: 5 }" />
```

| Prop | Type | Default |
|---|---|---|
| `name` | String | required |
| `multiple` | Boolean | `false` |
| `url` | String | `'/upload'` |
| `options` | Object | `{}` — merged into Dropzone's own constructor options. |

Event: `update:modelValue`.

Since this wraps Dropzone.js directly, any Dropzone option (`acceptedFiles`, `maxFilesize`, `dictDefaultMessage`, thumbnails, custom previews, etc.) can be passed through the `options` prop — see [Dropzone.js's documentation](https://docs.dropzone.dev/) for the full list.

### UppyInput

The most feature-rich uploader, powered by the **external package family `@uppy/core`, `@uppy/vue`, `@uppy/xhr-upload`** (the latter two are bundled; `@uppy/audio`, `@uppy/dashboard`, `@uppy/drag-drop`, and `@uppy/locales` are listed as dependencies for you to opt into via the slot below).

Default usage renders Uppy's built-in `Dropzone` + `FilesList`:

```vue
<UppyInput
  name="attachments"
  url="/upload"
  multiple
  :config="{ restrictions: { maxFileSize: 5 * 1024 * 1024, allowedFileTypes: ['.jpg', '.png', '.pdf'] } }"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | String | required | |
| `multiple` | Boolean | `false` | |
| `useXHR` | Boolean | `true` | Automatically registers `@uppy/xhr-upload` pointed at `url`. Set `false` if you want to register your own uploader plugin (e.g. AWS S3, Tus) on the exposed `uppy` instance instead. |
| `XHRConfig` | Object | `{}` | Merged into `@uppy/xhr-upload`'s own config (headers, formData, fieldName, etc.). |
| `url` | String | `'/upload'` | |
| `config` | Object | `{}` | Merged into Uppy's core constructor options (`id`, `autoProceed`, `restrictions`, `locale`, etc.). |
| `errorHandler` | Function | `null` | Custom error display/handling instead of the built-in inline error banner. |
| `showRestrictionCaption` | Boolean | `true` | Shows an auto-generated Persian caption describing the configured file-size/type/count restrictions. |

Events: `update:modelValue`, `file-added`, `file-removed`, `beforeUpload`, `progress`, `upload`, `upload-progress`, `upload-error`, `upload-success`, `upload-pause`, `complete`, `error`, `upload-retry`, `upload-stalled`, `retry-all`, `cancel-all`, `restriction-failed`.

Slot: default — scoped with `{ uppy }`, the raw Uppy instance, letting you completely replace the default Dropzone/FilesList UI with your own, or register extra Uppy plugins:

```vue
<UppyInput name="cover" url="/upload" v-slot="{ uppy }">
  <!-- bring your own plugins, e.g. @uppy/dashboard, @uppy/audio, @uppy/drag-drop -->
</UppyInput>
```

Because the file restriction caption, error banners, and the `Dropzone`/`FilesList` building blocks all come straight from Uppy, refer to [Uppy's documentation](https://uppy.io/docs/uppy/) for every available core/plugin option (restrictions, locales, custom plugins like Dashboard/Audio/Webcam/DragDrop, etc.) — anything supported there can be passed through `config`, `XHRConfig`, or registered manually on the exposed `uppy` instance.

### SubmitButton

Submit button wired to the injected `form`'s `processing`/`uploading` state, showing a spinner automatically.

```vue
<SubmitButton />
<SubmitButton>Save changes</SubmitButton>
```

| Prop | Type | Default |
|---|---|---|
| `disabled` | Boolean | `false` |

Slots:
- default — scoped with `{ form }`. Defaults to "تایید و ثبت اطلاعات" (Persian for "Confirm and submit").
- `progress` — scoped, defaults to an upload percentage (`form.uploading`%) while a file upload is in progress.

Must be used inside a `<FormContainer>` (injects `form` directly).

---

## Upload Endpoint Contract (backend)

`FileInput`, `SimpleUploader`, `DropzoneInput`, and `UppyInput` all expect a similar JSON contract from your backend:

- **Upload (`POST` to the configured endpoint/url):** respond with JSON describing the stored file. At minimum a `path` field, e.g. `{ "path": "uploads/abc123.jpg" }`. (`DropzoneInput` also accepts the raw response if there's no `.data` wrapper; `UppyInput` reads from `response.body`.)
- **Delete (`DELETE` to the same endpoint/url):** the components send the stored file's data (e.g. `{ "path": "..." }`) as the request body so the backend can remove it from storage.

The original package README points to a companion Laravel package, **`novinvision/simple-uploader`**, for implementing this endpoint server-side — use it if it's available to you, or implement an equivalent controller.

---

## Styling & Theming

All components are plain Bootstrap 5 markup/classes (`.form-control`, `.input-group`, `.form-check`, `.btn`, etc.) plus a handful of custom classes (`.form-check-toggle`, `.star-rating`, `.multi-quantity-input`, `.file-input-uploader`, `.uppy-input-area`, …) shipped in `dist/style.css`. Most custom styling reads Bootstrap CSS variables (`--bs-primary`, `--bs-border-radius`, `--bs-body-bg`, etc.), so if your project already themes Bootstrap via CSS variables, these components will inherit that theme automatically. Persian/Farsi numeral display uses a `.fanum` utility class throughout — make sure your global stylesheet defines the font-feature/font-family rules you want for it (it's used as a styling hook, not generated by this package).

---

## TypeScript

Type declarations are provided in `index.d.ts` (most components are typed loosely as `DefineComponent<{}, {}, any>` except for the ones with richer prop/event typing: `CheckboxButtonInput`, `EditorInput`, `UppyInput`, `FormContainer`, `LocationInput`, `Select2Input`, `SubmitButton`, `RangeSliderInput`). Import as usual:

```ts
import { TextInput, FormContainer } from 'inertia-bootstrap-forms';
```

---

## Known Limitations

A few quirks in the current source worth knowing about before you rely on certain props:

- **`EmailInput`'s `name` prop:** the component's `props` block doesn't actually declare a `name` prop (it declares an unrelated `FileInput` prop instead), so passing a custom `name="..."` may not bind correctly to the form. If you need a non-default field name for an email field, use `<TextInput name="..." type="email" placeholder="..." />` directly.
- **`TelInput`'s default `name`:** defaults to `'email'` rather than something like `'mobile'`/`'phone'` — always pass an explicit `name` prop to avoid surprises.
- **`Select2Input`'s `key` prop:** intended to let you choose which object field is used as an option's value, but it can't actually be set from a template, since Vue reserves `:key` for its own list-rendering/diffing mechanism. In practice, value resolution always falls back to `id` → `name` → `label` → `value` (or the `label` prop, for the display text).
- **`MultiQuantityInput`'s `totalMax`/`totalMin` props:** declared, but not currently enforced anywhere in the component's logic — treat them as reserved for future use rather than working constraints.
- Several components are typed `DefineComponent<{}, {}, any>` in `index.d.ts`, i.e. without real prop typing — rely on this README (or the `.vue` source) rather than IDE autocomplete for the full prop list of those components.
