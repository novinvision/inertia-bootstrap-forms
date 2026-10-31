# inertia-bootstrap-forms

> **English** · [فارسی](./README.fa.md)

Bootstrap **6** form components for **Vue 3 + Inertia.js** (Laravel). Every field binds itself to one
[Inertia `useForm`](https://inertiajs.com/forms) instance through a `<FormContainer>`, and the value of **every field
lives in the container's single `v-model`** — no per-field `v-model`, error classes or ids to wire by hand.

```vue
<FormContainer v-model="formData" url="/tickets">
    <FormField name="priority" label="Priority">
        <ComboboxInput name="priority" :options="priorities" />
    </FormField>

    <SubmitButton>
        Save
        <Icon icon="arrow-left" class="align-middle ms-1" />
    </SubmitButton>
</FormContainer>
```

Built and maintained by **[Novin Vision](https://novinvision.com)** (نوین ویژن). Free for personal and commercial use (MIT).

> **v3 is a rewrite for Bootstrap 6.** Bootstrap 5 projects should stay on `inertia-bootstrap-forms@2`.
> See [Migrating from v2](#migrating-from-v2).

---

## Table of contents

1. [What's new in v3](#whats-new-in-v3)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Core concepts](#core-concepts)
5. [Component reference](#component-reference)
6. [Upload endpoint contract](#upload-endpoint-contract)
7. [Internationalisation](#internationalisation)
8. [Lifecycle, SSR and cleanup](#lifecycle-ssr-and-cleanup)
9. [Composables](#composables)
10. [Migrating from v2](#migrating-from-v2)
11. [Notes and known limitations](#notes-and-known-limitations)
12. [Development](#development)

---

## What's new in v3

- Rewritten for **Bootstrap 6** markup: `.check` / `.radio` / `.switch`, `.form-field`, `.btn-solid.theme-*`, `.menu`, `.alert.theme-*`, `.form-ghost`, …
- **New components:** `ComboboxInput` (replaces `Select2Input` / choices.js), `ChipsInput`, `OTPInput` (Bootstrap OTP), `RangeInput`, `FormAdornInput`, `FormField`.
- **Zero styles shipped.** No CSS file, no `<style>` blocks. Import Bootstrap 6 in your app.
- Every field emits Vue events (`update:modelValue`, `change`, plus component specific ones) and exposes all the props it needs.
- Bootstrap JavaScript plugins (Combobox, Chips, OTP, Range, Menu) are loaded lazily **on mount** and **disposed on unmount**. Listeners, timers, XHR requests, Dropzone and Uppy instances are released too.
- SSR-safe: nothing touches `window` / `document` at import time or during server rendering.
- No more hidden global requirements (`window.axios`, `maska`, `vue3-bootstrap-components`, FontAwesome).

## Requirements

| Requirement | Notes |
|---|---|
| `vue` ≥ 3.3 | |
| `@inertiajs/vue3` ≥ 2.0 | `FormContainer` uses `useForm()` |
| `bootstrap` ^6.0.0-alpha.1 | **CSS** is required. The JS plugins are imported by this package on demand. |
| `@floating-ui/dom` | Peer dependency of Bootstrap 6 menus (needed by Combobox / MultiQuantityInput) |
| `dropzone` ^6 | Only for `DropzoneInput` |
| `leaflet` | Only for `LocationInput` |

Third-party widgets are regular dependencies of this package and are loaded lazily: `vue-tel-input`,
`vue3-persian-datetime-picker`, `@tinymce/tinymce-vue`, `@vue-leaflet/vue-leaflet`, `@uppy/*`.

## Installation

```bash
npm install inertia-bootstrap-forms bootstrap@next @floating-ui/dom
# optional
npm install dropzone leaflet
```

### Import the styles in your application

The package does not ship any CSS. Import Bootstrap 6 (compiled CSS or your own Sass build) and — only for the
widgets you use — the CSS of the third-party libraries:

```js
// resources/js/app.js
import 'bootstrap/dist/css/bootstrap.min.css';          // Bootstrap 6 (required)

import 'vue-tel-input/vue-tel-input.css';               // TelInput
import 'leaflet/dist/leaflet.css';                      // LocationInput
import 'dropzone/dist/basic.css';                       // DropzoneInput
import 'dropzone/dist/dropzone.css';                    // DropzoneInput
import '@uppy/vue/css/style.css';                       // UppyInput
```

You do **not** need to import Bootstrap's JavaScript: the plugins used by the components are loaded by the package.
If your application already bundles Bootstrap and you want a single copy, hand the classes over:

```js
import { Combobox, Chips, OtpInput, Range, Menu } from 'bootstrap';
import { configureBootstrap } from 'inertia-bootstrap-forms';

configureBootstrap({ Combobox, Chips, OtpInput, Range, Menu });
```

### Registering components

Import what you need, or install the plugin to register everything globally:

```js
import InertiaBootstrapForms from 'inertia-bootstrap-forms';

createInertiaApp({
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(InertiaBootstrapForms, { locale: 'en' }) // options are optional
            .mount(el);
    },
});
```

## Core concepts

### One `v-model` for the whole form

```vue
<script setup>
import { ref } from 'vue';
import { FormContainer, TextInput, ComboboxInput, SwitchInput, SubmitButton } from 'inertia-bootstrap-forms';

const formData = ref({ name: '', status: 'draft', published: false });
</script>

<template>
    <FormContainer v-model="formData" url="/products" @success="onSaved">
        <TextInput name="name" />
        <ComboboxInput name="status" :options="['draft', 'active']" />
        <SwitchInput name="published" label="Published" />
        <SubmitButton />
    </FormContainer>
</template>
```

* `name` is the key inside `formData`. The object does **not** have to declare every field up front: keys that are missing are added to `formData` as soon as the field is used, and they are submitted and reset with the rest. Typing into a field updates `formData`; changing `formData` from the outside updates the fields.
* Server-side validation errors (`form.errors`) are matched by `name` and turn the control `.is-invalid`.
* Fields are disabled while the form is `processing`.
* Persian / Arabic digits are converted to English digits before submit (`:normalize-digits="false"` to disable). `File` objects are never touched.
* Values are still **not limited to the container**: a field used *outside* a `FormContainer` works with its own `v-model`.

```vue
<TextInput v-model="title" />   <!-- standalone -->
```

### Events

Every component declares its emits:

| Event | Payload | Emitted by |
|---|---|---|
| `update:modelValue` | `value` | all fields |
| `change` | `value, event?` | all fields |
| `input` | `value, event` | text-like fields, OTP, range |
| `focus` / `blur` | `event` | text-like fields, checkbox family, range, chips |
| component specific | see [reference](#component-reference) | combobox, chips, OTP, uploaders … |

Native listeners that are not declared (`@keydown`, `@paste`, …) fall through to the underlying `<input>` on single-root
components (`TextInput`, `TextAreaInput`, `EmailInput`, `MobileInput`, `PasswordInput`, `FormAdornInput`).

### Props shared by every field

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | Key in the form's v-model (also used for error lookup) |
| `modelValue` | any | Standalone `v-model` (ignored inside a `FormContainer`) |
| `id` | `string` | Override the generated id (auto-linked to `FormField` labels) |
| `disabled` | `boolean` | Disable the control |
| `readonly` | `boolean` | Read-only (or non-interactive for controls without native readonly) |
| `required` | `boolean` | Native `required` |
| `invalid` | `boolean` | Force invalid state; default follows server errors |

### Grouped / repeated values

```vue
<GroupControl name="items" :index="0">
    <TextInput name="title" />       <!-- items[0].title -->
    <QuantityInput name="qty" />     <!-- items[0].qty   -->
</GroupControl>
```

`index` is optional — without it the position among sibling `.form-control-group` elements is used. Error keys such as
`items.0.title` are resolved automatically.

---

## Component reference

### Form structure

#### `FormContainer`

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `object` | `{}` | The form data (`v-model`) |
| `url` | `string` | `''` | Submit URL |
| `method` | `string` | `'post'` | HTTP method |
| `only` | `string[]` | `[]` | Inertia `only` option |
| `options` | `object` | `{}` | Extra fields that are not part of `modelValue` |
| `visitOptions` | `object` | `{}` | Extra Inertia visit options (`preserveScroll`, `headers`, callbacks…) |
| `autoTab` | `boolean` | `true` | Focus next field when `maxlength` is reached |
| `resetOnSuccess` | `boolean` | `false` | Reset the form after a successful submit |
| `submitHandler` | `(event, form) => any` | `null` | Replace the default submit |
| `normalizeDigits` | `boolean` | `true` | Persian/Arabic → English digits on submit |
| `validate` | `boolean` | `false` | Enable Bootstrap 6 client-side validation (`data-bs-validate`) |
| `htmlMessages` | `boolean` | `false` | Render server messages as HTML (trusted content only) |
| `hideAlerts` | `boolean` | `false` | Hide the built-in error / success alerts |

Events: `update:modelValue`, `change`, `submit`, `reset`, `before`, `start`, `progress`, `success`, `error`, `cancel`, `finish`
(legacy `onStart`, `onFinish`, `onSuccess`, `onError` are still emitted).
Slots: default `{ form, submit, reset }`, `errors { errors, form }`, `message { message }`.
Exposed: `submit()`, `reset()`, `form`, `el`.

A `message` prop returned by the server in the Inertia page props is shown as a success alert.

#### `FormField`

Bootstrap 6 `.form-field`: label + control + help + validation feedback. The generated `id` is injected into the child control and the label.

| Prop | Description |
|---|---|
| `name` | Field key — used to read the server error |
| `label`, `help` | Texts |
| `error` | Override the error text |
| `required` | Adds the required mark to the label |
| `id` | Override the generated id |

Slots: default, `label`, `help`, `error`.

```vue
<FormField name="email" label="Email" help="We never share it" required>
    <EmailInput name="email" />
</FormField>
```

#### `FormLabel`, `GroupControl`, `SubmitButton`

* `FormLabel` – `for`, `required`. Detects its control automatically inside `FormField` or from the next element.
* `GroupControl` – `name` (required), `index`.
* `SubmitButton` – `variant` (`solid`), `theme` (`primary`), `loading`, `disabled`, `locale`. Renders `class="btn-solid theme-primary"`; pass `:variant="null"` to bring your own classes. Shows a spinner while `form.processing` / `form.uploading`. Emits `click`. Slots: default, `progress`.

### Text-like inputs

| Component | Extra props | Notes |
|---|---|---|
| `TextInput` | `type`, `placeholder`, `size` (`sm`/`lg`) | `.form-control` |
| `TextAreaInput` | `rows`, `placeholder`, `size` | |
| `EmailInput` | `placeholder`, `locale` | `type="email"`; all `TextInput` props forwarded |
| `MobileInput` | `placeholder`, `locale` | `type="tel"` |
| `PasswordInput` | `placeholder`, `toggle`, `locale` | `toggle` adds a show / hide button (form-adorn); event `toggle` |
| `TelInput` | `placeholder`, `defaultCountry` (`ir`), `preferredCountries`, `mode`, `validCharactersOnly`, `validate`, `dropdownOptions`, `inputOptions` | `vue-tel-input`; stores the international number; events `validate`, `country-changed` |
| `FormAdornInput` | `type`, `placeholder`, `startText`, `endText`, `size` | Bootstrap 6 `.form-adorn`. Slots `start`, `end` |
| `AmountInput` | `placeholder`, `unit`, `min`, `max`, `size`, `locale` | Integer with thousands separators, stores a `number` |
| `QuantityInput` | `min` (0), `max`, `step` (1), `unit`, `locale` | Stepper; events `increment`, `decrement` |
| `MultiQuantityInput` | `options`, `min`, `max`, `totalMin`, `totalMax`, `unit`, `placement`, `locale` | Bootstrap Menu with one stepper per option; value `{ 0: 2, 1: 1 }` |

```vue
<FormAdornInput name="website" start-text="https://">
    <template #end><span class="form-adorn-icon"><svg …/></span></template>
</FormAdornInput>
```

### Choice inputs

| Component | Extra props |
|---|---|
| `CheckboxInput` | `type` (`checkbox`/`radio`), `value`, `trueValue`, `falseValue`, `checked`, `indeterminate`, `label` |
| `SwitchInput` | `value`, `trueValue`, `falseValue`, `checked`, `label` |
| `CheckboxButtonInput` | `type` (`radio`), `value`, `variant` (`outline`), `theme` (`primary`), `checked` — Bootstrap `.btn-check` |
| `CheckboxToggle` | `type`, `value`, `checked`, `hideInput` — selectable card (`.form-field-card`) |

Model rules follow Vue's native `v-model`: an **array** model collects the checked `value`s, a **radio** stores the selected `value`, a single checkbox stores `trueValue` / `falseValue` (default `true` / `false`).

```vue
<CheckboxInput name="roles" value="admin" label="Admin" />
<CheckboxInput name="roles" value="editor" label="Editor" />     <!-- roles: ['admin','editor'] -->
<CheckboxInput name="plan" type="radio" value="pro" label="Pro" />
```

### `ComboboxInput` (Bootstrap 6 Combobox)

Replaces `Select2Input` (choices.js). `Select2Input` is still exported as an alias.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array` | `[]` | Strings, numbers or objects `{ id \| value, name \| label, description, disabled }` |
| `valueKey` / `labelKey` | `string` | auto | Property names of option objects (`label` is a legacy alias of `labelKey`) |
| `descriptionKey` | `string` | `'description'` | Secondary text of an option |
| `multiple` | `boolean` | `false` | Multiple selection (array model) |
| `placeholder` | `string` | i18n | |
| `searchEnabled` | `boolean` | `false` | Client-side search box |
| `search` | `object` | `{ url: null }` | **Remote search**: `{ url, method='POST', param='query', debounce=400, minChars=0, headers, resultsKey='data' }` |
| `clearable` | `boolean` | `false` | Adds an entry that clears a single select |
| `clearText`, `noResultsText`, `loadingText`, `searchPlaceholder`, `selectedText` | `string` | i18n | `selectedText` supports `{count}` |
| `placement` | `string` | `'bottom-start'` | Floating UI placement |
| `size`, `hideDropdown`, `searchNormalize`, `locale` | | | |

Events: `update:modelValue`, `change`, `selected` (option(s)), `clear`, `search`, `search-success`, `search-error`, `show`, `shown`, `hide`, `hidden`.
Exposed: `show()`, `hide()`, `toggle()`, `clear()`, `focus()`.

```vue
<ComboboxInput name="priority" :options="[{ id: 1, name: 'Low' }, { id: 2, name: 'High', description: 'Answered first' }]" clearable />

<ComboboxInput name="customer" :search="{ url: '/api/customers', debounce: 300 }" />   <!-- remote -->

<ComboboxInput name="tags" multiple search-enabled :options="tags" />
```

The remote endpoint receives `?query=…` and must answer with a JSON array (or `{ data: [] }`). The `X-XSRF-TOKEN` cookie is forwarded automatically. Selected options always keep their label even when they are not part of the latest results.

### `ChipsInput` (Bootstrap 6 Chips)

Value: array of strings.

| Prop | Default | Description |
|---|---|---|
| `placeholder` | i18n | |
| `separator` | `','` | Splits typed / pasted text. `null` disables |
| `allowDuplicates` | `false` | |
| `maxChips` | `null` | |
| `dismissible` | `true` | Remove button on chips |
| `dismissIcon` | `null` | Custom remove icon markup |
| `createOnBlur` | `true` | |
| `validator` | `null` | `(value) => boolean`; rejected values emit `rejected` |

Events: `update:modelValue`, `change`, `add`, `remove`, `select`, `rejected`, `focus`, `blur`. Exposed: `add()`, `remove()`, `clear()`, `focus()`.

### `OTPInput` (Bootstrap 6 OTP)

| Prop | Default | Description |
|---|---|---|
| `length` (`maxLength` legacy) | `6` | Number of characters |
| `type` | `'numeric'` | `numeric` \| `alphanumeric` \| `alpha` |
| `mask` | `false` | Show `•` |
| `groups` | `null` | e.g. `[3, 3]` |
| `separator` | `'·'` | |
| `autoSubmit` | `false` | Submit the `FormContainer` when the code is complete |
| `autofocus` | `false` | |

Events: `update:modelValue`, `change`, `input`, `complete`, `focus`, `blur`. Exposed: `focus()`, `clear()`.
A single real input backs the slots, so SMS / password-manager autofill keeps working.

### `RangeInput` (Bootstrap 6 Range)

| Prop | Default | Description |
|---|---|---|
| `min` / `max` / `step` | `0` / `100` / `1` | |
| `bubble` | `false` | Value bubble above the thumb |
| `formatter` | `null` | `(value) => string` for bubble and tick labels |
| `ticks` | `[]` | `[0, 50, 100]` or `[{ value, label }]` |

Value: `number`. Events: `update:modelValue`, `change`, `input`, `focus`, `blur`. `RangeSliderInput` is an alias.

### Other inputs

| Component | Highlights |
|---|---|
| `StarRatingInput` | `maxStars`, `precision` (steps per star), `showValue`, `clearable`, `value`; pointer + keyboard, RTL aware, `role="slider"` |
| `CaptchaInput` | `url`, `placeholder`, `refreshOnSubmit`, `imageWidth`, `imageHeight`; event `refresh` |
| `PersianDatePickerInput` | `calendar`, `view`, `min`, `max`, `range`, `format`, `inputFormat`, `pickerOptions`, `inputClass`; events `open`, `close` |
| `EditorInput` | TinyMCE: `options`, `height`, `placeholder`, `apiKey`, `tinymceScriptSrc`; event `init` |
| `LocationInput` | Leaflet: `center`, `zoom`, `height`, `tileUrl`, `attribution`; value `{ lat, lng }`; event `ready` |
| `FileInput` (`SimpleUploader`) | `multiple`, `endpoint`, `accept`, `headers`, `fieldName`; events `added`, `progress`, `uploaded`, `error`, `removed` |
| `DropzoneInput` | `multiple`, `url`, `options`, `headers`; events `ready`, `added`, `success`, `error`, `removed`, `complete` |
| `UppyInput` | `multiple`, `useXHR`, `XHRConfig`, `url`, `config`, `errorHandler`, `showRestrictionCaption`; all Uppy events are re-emitted |

---

## Upload endpoint contract

`FileInput`, `DropzoneInput` and `UppyInput` talk to the same endpoint shape:

* `POST {url}` — multipart field `file` → JSON `{ "data": { "path": "tmp/abc.jpg" } }` (or `{ "path": … }`).
* `DELETE {url}` — body is the stored `path` (`FileInput`, `DropzoneInput`) or the JSON response (`UppyInput`).

`FileInput` stores the `path` string(s); `DropzoneInput` / `UppyInput` store the response object(s). `form.uploading` holds the upload progress, so `SubmitButton` is disabled until uploads finish.

## Internationalisation

Built-in dictionaries: `en` and `fa`. The default `locale: 'auto'` picks `fa` when the page is RTL (`dir="rtl"` / `lang="fa"`) and `en` otherwise.
Set the locale globally to avoid any SSR / hydration difference:

```js
import { configureI18n } from 'inertia-bootstrap-forms';

configureI18n({ locale: 'fa' });
configureI18n({ messages: { fa: { 'select.noResults': 'موردی نیست' } } });
```

Any component with texts also accepts a `locale` prop and explicit text props (`placeholder`, `noResultsText`, …).

## Lifecycle, SSR and cleanup

* Bootstrap plugins are created in `onMounted` through `useBsInstance()` and disposed in `onBeforeUnmount`; re-created automatically when a prop that is only read at construction time changes (`multiple`, `ticks`, `length`, …).
* Plugins are imported lazily with `import('bootstrap/js/dist/<plugin>.js')` — bundlers code-split them.
* `useDisposables()` tracks listeners, timers, `AbortController`s, XHRs, Dropzone and Uppy instances and releases them on unmount (also when the component unmounts while a plugin is still loading).
* Server rendering outputs the static markup; widgets that need the DOM (Combobox, Chips, OTP, Range, Leaflet, date picker, …) start after hydration.

## Composables

Build your own fields with the same plumbing:

```vue
<script setup>
import { fieldProps, useField } from 'inertia-bootstrap-forms';

const props = defineProps({ ...fieldProps, color: String });
const emit = defineEmits(['update:modelValue', 'change']);
const { model, inputId, isInvalid, isDisabled, emitChange } = useField(props, emit);
</script>

<template>
    <input type="color" v-model="model" :id="inputId" :disabled="isDisabled" :class="{ 'is-invalid': isInvalid }" @change="emitChange(model, $event)" />
</template>
```

Also exported: `useFormApi()`, `useDisposables()`, `useBsInstance()`, `configureBootstrap()`, `configureI18n()`, `toEnglishDigits()`, `countryCodes`.

---

## Migrating from v2

| v2 | v3 |
|---|---|
| Bootstrap 5 classes (`.form-check`, `.btn-primary`, …) | Bootstrap 6 (`.check`, `.btn-solid.theme-primary`, …). `.btn-primary` does not exist in Bootstrap 6: `SubmitButton` now renders `btn-solid theme-primary` by itself — use the `variant` / `theme` props instead of `class="btn btn-primary"` |
| `import 'inertia-bootstrap-forms/dist/style.css'` | **Removed** — no CSS is shipped. Import Bootstrap 6 + third-party CSS yourself |
| `Select2Input` (choices.js) | `ComboboxInput`; `Select2Input` remains as an alias. The choices.js `config` object is gone — use the documented props. Option field names are set with `valueKey` / `labelKey` (`label` still works as a legacy alias) |
| Select value always a string | Select value keeps the option's original type (a numeric `id` stays a number) |
| `RangeSliderInput` (dual thumb, svelte-range-slider-pips) | `RangeInput` (single thumb, Bootstrap 6). Dual range is not supported by Bootstrap 6 |
| `OTPInput` default length `5` | default `6`; pass `:length="5"` to keep the old size. Fires `complete`; use `auto-submit` instead of `data-auto-submit-length` |
| `CheckboxInput` `change` event passes the DOM event | `change(value, event)` for every field |
| `StarRatingInput` stored `"3.5"` strings | stores numbers |
| `FormContainer` rendered server messages with `v-html` | text by default, `html-messages` to opt in |
| `FormContainer` emitted extra helper methods inside the data | emits only the form data |
| `FileInput` needed `window.axios` | uses `XMLHttpRequest` + `fetch`, forwards the `XSRF-TOKEN` cookie |
| `AmountInput` / `QuantityInput` needed `maska` | built in (Persian digits supported) |
| `vue3-bootstrap-components`, `choices.js`, `svelte-range-slider-pips` bundled | removed |
| `name` was `required` | optional — omit it for standalone `v-model` usage |
| Peer: Bootstrap 5 CSS | Peer: `bootstrap@^6.0.0-alpha.1`, `@floating-ui/dom` |

## Notes and known limitations

* Bootstrap 6 is currently in **alpha**; class names and plugin APIs may still change before the stable release.
* Bootstrap 6 Combobox creates a `Menu` on the same toggle element, which makes Bootstrap log *"Bootstrap doesn't allow more than one instance per element"* to the console. This message comes from Bootstrap itself; the component works normally.
* Bootstrap 6's own Datepicker has no Jalali calendar, so `PersianDatePickerInput` keeps `vue3-persian-datetime-picker`. Theme it with CSS variables in your app.
* `LocationInput` in RTL pages: Leaflet panes need `left: auto; right: 0` — add that rule in your own CSS if the map renders offset.
* `AmountInput` / `QuantityInput` handle integers.
* `data-bs-toggle` attributes on the Combobox / Menu toggles are required for Bootstrap's data-API click handling and are rendered by the components.

## Development

```bash
npm install
npm test        # vitest + jsdom (components, Bootstrap plugin lifecycle, SSR)
npm run build   # vite library build → dist/
```

---

Built and maintained by **[Novin Vision](https://novinvision.com)** · MIT license
