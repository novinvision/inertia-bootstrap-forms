<div dir="rtl">

# inertia-bootstrap-forms

> [English](./README.md) · **فارسی**

مجموعه کامپوننت‌های فرم **Bootstrap 6** برای **Vue 3 + Inertia.js** (لاراول). هر فیلد به‌صورت خودکار از طریق `<FormContainer>` به یک
[`useForm` اینرشیا](https://inertiajs.com/forms) متصل می‌شود و **مقدار تمام فیلدها در یک `v-model` مشترک (روی FormContainer) ذخیره می‌شود**؛
دیگر لازم نیست برای هر فیلد `v-model`، کلاس خطا یا `id` جداگانه تعریف کنید.

```vue
<FormContainer v-model="formData" url="/tickets">
    <FormField name="priority" label="اولویت">
        <ComboboxInput name="priority" :options="priorities" />
    </FormField>

    <SubmitButton>
        ثبت نهایی
        <Icon icon="arrow-left" class="align-middle ms-1" />
    </SubmitButton>
</FormContainer>
```

توسعه و نگهداری: **[نوین ویژن](https://novinvision.com)** (Novin Vision). استفاده شخصی و تجاری رایگان است (MIT).

> **نسخه ۳ بازنویسی کامل برای Bootstrap 6 است.** پروژه‌های Bootstrap 5 باید روی `inertia-bootstrap-forms@2` بمانند.
> بخش [مهاجرت از نسخه ۲](#مهاجرت-از-نسخه-2) را ببینید.

---

## فهرست

1. [تازه‌های نسخه ۳](#تازههای-نسخه-3)
2. [پیش‌نیازها](#پیشنیازها)
3. [نصب](#نصب)
4. [مفاهیم اصلی](#مفاهیم-اصلی)
5. [مرجع کامپوننت‌ها](#مرجع-کامپوننتها)
6. [قرارداد endpoint آپلود](#قرارداد-endpoint-آپلود)
7. [چندزبانگی](#چندزبانگی)
8. [چرخه عمر، SSR و آزادسازی منابع](#چرخه-عمر-ssr-و-آزادسازی-منابع)
9. [Composable ها](#composable-ها)
10. [مهاجرت از نسخه ۲](#مهاجرت-از-نسخه-2)
11. [نکات و محدودیت‌ها](#نکات-و-محدودیتها)
12. [توسعه](#توسعه)

---

## تازه‌های نسخه 3

- بازنویسی بر پایه مارک‌آپ **Bootstrap 6**: `.check` / `.radio` / `.switch`، `.form-field`، `.btn-solid.theme-*`، `.menu`، `.alert.theme-*`، `.form-ghost` و …
- **کامپوننت‌های جدید:** `ComboboxInput` (جایگزین `Select2Input` و choices.js)، `ChipsInput`، `OTPInput` (بر پایه OTP بوت‌استرپ)، `RangeInput`، `FormAdornInput` و `FormField`.
- **هیچ استایلی همراه پکیج نیست.** نه فایل CSS و نه بلاک `<style>`؛ بوت‌استرپ 6 را در پروژه خودتان import کنید.
- همه کامپوننت‌ها event های Vue را با `emit` پشتیبانی می‌کنند (`update:modelValue`، `change` و eventهای اختصاصی) و تمام props لازم را دارند.
- پلاگین‌های جاوااسکریپت بوت‌استرپ (Combobox، Chips، OTP، Range، Menu) هنگام **mount** به‌صورت lazy بارگذاری و هنگام **unmount** آزاد (dispose) می‌شوند. لیسنرها، تایمرها، درخواست‌های XHR و نمونه‌های Dropzone و Uppy هم آزاد می‌شوند.
- سازگار با SSR: هیچ کدی هنگام import یا رندر سمت سرور به `window` / `document` دست نمی‌زند.
- دیگر به پیش‌نیازهای پنهان سراسری (`window.axios`، `maska`، `vue3-bootstrap-components`، FontAwesome) نیاز نیست.

## پیشنیازها

| پیش‌نیاز | توضیح |
|---|---|
| `vue` ‎≥ 3.3 | |
| `@inertiajs/vue3` ‎≥ 2.0 | `FormContainer` از `useForm()` استفاده می‌کند |
| `bootstrap` ‎^6.0.0-alpha.1 | **CSS** الزامی است. پلاگین‌های JS را خود پکیج در صورت نیاز بارگذاری می‌کند. |
| `@floating-ui/dom` | وابستگی منوهای Bootstrap 6 (برای Combobox و MultiQuantityInput) |
| `dropzone` ‎^6 | فقط برای `DropzoneInput` |
| `leaflet` | فقط برای `LocationInput` |

کتابخانه‌های جانبی جزو dependencies خود پکیج هستند و lazy بارگذاری می‌شوند: `vue-tel-input`، `vue3-persian-datetime-picker`، `@tinymce/tinymce-vue`، `@vue-leaflet/vue-leaflet` و `@uppy/*`.

## نصب

```bash
npm install inertia-bootstrap-forms bootstrap@next @floating-ui/dom
# اختیاری
npm install dropzone leaflet
```

### import استایل‌ها در پروژه شما

پکیج هیچ CSS ای ندارد. بوت‌استرپ 6 (CSS کامپایل‌شده یا Sass خودتان) و فقط برای ویجت‌هایی که استفاده می‌کنید CSS کتابخانه‌های جانبی را import کنید:

```js
// resources/js/app.js
import 'bootstrap/dist/css/bootstrap.min.css';          // Bootstrap 6 (الزامی)

import 'vue-tel-input/vue-tel-input.css';               // TelInput
import 'leaflet/dist/leaflet.css';                      // LocationInput
import 'dropzone/dist/basic.css';                       // DropzoneInput
import 'dropzone/dist/dropzone.css';                    // DropzoneInput
import '@uppy/vue/css/style.css';                       // UppyInput
```

**نیازی به import جاوااسکریپت بوت‌استرپ نیست**؛ پلاگین‌های مورد نیاز کامپوننت‌ها را خود پکیج بارگذاری می‌کند.
اگر پروژه شما بوت‌استرپ را خودش bundle می‌کند و می‌خواهید فقط یک نسخه داشته باشید، کلاس‌ها را به پکیج بدهید:

```js
import { Combobox, Chips, OtpInput, Range, Menu } from 'bootstrap';
import { configureBootstrap } from 'inertia-bootstrap-forms';

configureBootstrap({ Combobox, Chips, OtpInput, Range, Menu });
```

### ثبت کامپوننت‌ها

هر کامپوننتی را که لازم دارید import کنید، یا با نصب پلاگین همه را سراسری ثبت کنید:

```js
import InertiaBootstrapForms from 'inertia-bootstrap-forms';

createInertiaApp({
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(InertiaBootstrapForms, { locale: 'fa' }) // گزینه‌ها اختیاری هستند
            .mount(el);
    },
});
```

## مفاهیم اصلی

### یک `v-model` برای کل فرم

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
        <SwitchInput name="published" label="منتشر شود" />
        <SubmitButton />
    </FormContainer>
</template>
```

* `name` همان کلید داخل `formData` است. لازم نیست همهٔ فیلدها از ابتدا در آبجکت تعریف شده باشند: کلیدهای ناموجود به‌محض استفاده از فیلد به `formData` اضافه می‌شوند و همراه بقیه ارسال و ریست می‌شوند. تایپ در فیلد، `formData` را تغییر می‌دهد و تغییر `formData` از بیرون، فیلدها را به‌روز می‌کند.
* خطاهای اعتبارسنجی سمت سرور (`form.errors`) بر اساس `name` پیدا می‌شوند و کنترل را `.is-invalid` می‌کنند.
* در زمان `processing` بودن فرم، فیلدها غیرفعال می‌شوند.
* ارقام فارسی/عربی پیش از ارسال به ارقام انگلیسی تبدیل می‌شوند (برای خاموش کردن: `:normalize-digits="false"`). فایل‌ها (`File`) دست‌نخورده می‌مانند.
* مقدار **محدود به کانتینر نیست**: فیلدی که *بیرون* از `FormContainer` استفاده شود با `v-model` مخصوص خودش کار می‌کند.

```vue
<TextInput v-model="title" />   <!-- مستقل -->
```

### Event ها

هر کامپوننت emits خودش را تعریف کرده است:

| Event | Payload | منبع |
|---|---|---|
| `update:modelValue` | `value` | همه فیلدها |
| `change` | `value, event?` | همه فیلدها |
| `input` | `value, event` | فیلدهای متنی، OTP، range |
| `focus` / `blur` | `event` | فیلدهای متنی، خانواده checkbox، range، chips |
| اختصاصی | [مرجع](#مرجع-کامپوننتها) | combobox، chips، OTP، آپلودرها … |

لیسنرهای native که اعلام نشده‌اند (`@keydown`، `@paste` و …) در کامپوننت‌های تک‌ریشه
(`TextInput`، `TextAreaInput`، `EmailInput`، `MobileInput`، `PasswordInput`، `FormAdornInput`) مستقیم به `<input>` منتقل می‌شوند.

### Props مشترک همه فیلدها

| Prop | نوع | توضیح |
|---|---|---|
| `name` | `string` | کلید در v-model فرم (برای پیدا کردن خطا هم استفاده می‌شود) |
| `modelValue` | any | `v-model` مستقل (داخل `FormContainer` نادیده گرفته می‌شود) |
| `id` | `string` | جایگزین id خودکار (در `FormField` خودکار به label وصل می‌شود) |
| `disabled` | `boolean` | غیرفعال کردن |
| `readonly` | `boolean` | فقط‌خواندنی (یا غیرقابل‌تعامل برای کنترل‌هایی که readonly بومی ندارند) |
| `required` | `boolean` | `required` بومی |
| `invalid` | `boolean` | اجبار حالت نامعتبر؛ پیش‌فرض بر اساس خطاهای سرور است |

### مقادیر گروهی / تکرارشونده

```vue
<GroupControl name="items" :index="0">
    <TextInput name="title" />       <!-- items[0].title -->
    <QuantityInput name="qty" />     <!-- items[0].qty   -->
</GroupControl>
```

`index` اختیاری است؛ در صورت نبودن، موقعیت میان `.form-control-group` های هم‌سطح استفاده می‌شود. کلیدهای خطا مثل `items.0.title` خودکار پیدا می‌شوند.

---

## مرجع کامپوننت‌ها

### ساختار فرم

#### `FormContainer`

| Prop | نوع | پیش‌فرض | توضیح |
|---|---|---|---|
| `modelValue` | `object` | `{}` | داده‌های فرم (`v-model`) |
| `url` | `string` | `''` | آدرس ارسال |
| `method` | `string` | `'post'` | متد HTTP |
| `only` | `string[]` | `[]` | گزینه `only` اینرشیا |
| `options` | `object` | `{}` | فیلدهای اضافه که در `modelValue` نیستند |
| `visitOptions` | `object` | `{}` | گزینه‌های اضافه visit اینرشیا (`preserveScroll`، `headers`، callbackها …) |
| `autoTab` | `boolean` | `true` | رفتن به فیلد بعدی هنگام رسیدن به `maxlength` |
| `resetOnSuccess` | `boolean` | `false` | ریست فرم پس از ارسال موفق |
| `submitHandler` | `(event, form) => any` | `null` | جایگزین ارسال پیش‌فرض |
| `normalizeDigits` | `boolean` | `true` | تبدیل ارقام فارسی/عربی به انگلیسی هنگام ارسال |
| `validate` | `boolean` | `false` | فعال‌سازی اعتبارسنجی سمت کلاینت Bootstrap 6 (`data-bs-validate`) |
| `htmlMessages` | `boolean` | `false` | نمایش پیام‌های سرور به‌صورت HTML (فقط برای محتوای مطمئن) |
| `hideAlerts` | `boolean` | `false` | مخفی کردن alert خطا / موفقیت داخلی |

Event ها: `update:modelValue`، `change`، `submit`، `reset`، `before`، `start`، `progress`، `success`، `error`، `cancel`، `finish`
(eventهای قدیمی `onStart`، `onFinish`، `onSuccess`، `onError` همچنان emit می‌شوند).
Slot ها: پیش‌فرض `{ form, submit, reset }`، `errors { errors, form }`، `message { message }`.
متدهای expose شده: `submit()`، `reset()`، `form`، `el`.

اگر سرور در props صفحه اینرشیا یک `message` برگرداند، به‌صورت alert موفقیت نمایش داده می‌شود.

#### `FormField`

همان `.form-field` بوت‌استرپ 6: label + کنترل + متن راهنما + بازخورد اعتبارسنجی. `id` تولیدشده خودکار به کنترل داخلی و label داده می‌شود.

| Prop | توضیح |
|---|---|
| `name` | کلید فیلد — برای خواندن خطای سرور |
| `label`، `help` | متن‌ها |
| `error` | جایگزین متن خطا |
| `required` | علامت الزامی روی label |
| `id` | جایگزین id تولیدشده |

Slot ها: پیش‌فرض، `label`، `help`، `error`.

```vue
<FormField name="email" label="ایمیل" help="ایمیل شما نزد ما محفوظ است" required>
    <EmailInput name="email" />
</FormField>
```

#### `FormLabel`، `GroupControl`، `SubmitButton`

* `FormLabel` – `for`، `required`. داخل `FormField` یا از روی عنصر بعدی، کنترل را خودکار پیدا می‌کند.
* `GroupControl` – `name` (الزامی)، `index`.
* `SubmitButton` – `variant` (پیش‌فرض `solid`)، `theme` (پیش‌فرض `primary`)، `loading`، `disabled`، `locale`. کلاس `btn-solid theme-primary` را خودش می‌گذارد؛ با `:variant="null"` می‌توانید کلاس‌های خودتان را بدهید. هنگام `form.processing` / `form.uploading` اسپینر نشان می‌دهد. event: `click`. Slot ها: پیش‌فرض، `progress`.

### ورودی‌های متنی

| کامپوننت | propهای اضافه | نکته |
|---|---|---|
| `TextInput` | `type`، `placeholder`، `size` (`sm`/`lg`) | `.form-control` |
| `TextAreaInput` | `rows`، `placeholder`، `size` | |
| `EmailInput` | `placeholder`، `locale` | `type="email"`؛ همه propهای `TextInput` منتقل می‌شوند |
| `MobileInput` | `placeholder`، `locale` | `type="tel"` |
| `PasswordInput` | `placeholder`، `toggle`، `locale` | `toggle` دکمه نمایش/مخفی‌کردن (form-adorn) اضافه می‌کند؛ event: `toggle` |
| `TelInput` | `placeholder`، `defaultCountry` (`ir`)، `preferredCountries`، `mode`، `validCharactersOnly`، `validate`، `dropdownOptions`، `inputOptions` | `vue-tel-input`؛ شماره بین‌المللی ذخیره می‌شود؛ eventها: `validate`، `country-changed` |
| `FormAdornInput` | `type`، `placeholder`، `startText`، `endText`، `size` | `.form-adorn` بوت‌استرپ 6. Slot ها: `start`، `end` |
| `AmountInput` | `placeholder`، `unit`، `min`، `max`، `size`، `locale` | عدد صحیح با جداکننده هزارگان؛ مقدار `number` ذخیره می‌شود |
| `QuantityInput` | `min` (0)، `max`، `step` (1)، `unit`، `locale` | شمارنده؛ eventها: `increment`، `decrement` |
| `MultiQuantityInput` | `options`، `min`، `max`، `totalMin`، `totalMax`، `unit`، `placement`، `locale` | Menu بوت‌استرپ با یک شمارنده برای هر گزینه؛ مقدار: `{ 0: 2, 1: 1 }` |

```vue
<FormAdornInput name="website" start-text="https://">
    <template #end><span class="form-adorn-icon"><svg …/></span></template>
</FormAdornInput>
```

### ورودی‌های انتخابی

| کامپوننت | propهای اضافه |
|---|---|
| `CheckboxInput` | `type` (`checkbox`/`radio`)، `value`، `trueValue`، `falseValue`، `checked`، `indeterminate`، `label` |
| `SwitchInput` | `value`، `trueValue`، `falseValue`، `checked`، `label` |
| `CheckboxButtonInput` | `type` (`radio`)، `value`، `variant` (`outline`)، `theme` (`primary`)، `checked` — `.btn-check` بوت‌استرپ |
| `CheckboxToggle` | `type`، `value`، `checked`، `hideInput` — کارت انتخابی (`.form-field-card`) |

قوانین مقدار مثل `v-model` بومی Vue است: مدل **آرایه** مقدارهای تیک‌خورده را جمع می‌کند، **radio** مقدار انتخاب‌شده را ذخیره می‌کند و یک چک‌باکس تکی `trueValue` / `falseValue` (پیش‌فرض `true` / `false`) را.

```vue
<CheckboxInput name="roles" value="admin" label="مدیر" />
<CheckboxInput name="roles" value="editor" label="ویرایشگر" />     <!-- roles: ['admin','editor'] -->
<CheckboxInput name="plan" type="radio" value="pro" label="حرفه‌ای" />
```

### ‏`ComboboxInput` (Combobox بوت‌استرپ 6)

جایگزین `Select2Input` (choices.js). `Select2Input` به‌عنوان alias همچنان export می‌شود.

| Prop | نوع | پیش‌فرض | توضیح |
|---|---|---|---|
| `options` | `Array` | `[]` | رشته، عدد یا آبجکت `{ id \| value, name \| label, description, disabled }` |
| `valueKey` / `labelKey` | `string` | خودکار | نام فیلدهای آبجکت گزینه‌ها (`label` نام قدیمیِ `labelKey` است) |
| `descriptionKey` | `string` | `'description'` | متن ثانویه گزینه |
| `multiple` | `boolean` | `false` | انتخاب چندتایی (مدل آرایه) |
| `placeholder` | `string` | i18n | |
| `searchEnabled` | `boolean` | `false` | کادر جستجوی سمت کلاینت |
| `search` | `object` | `{ url: null }` | **جستجوی remote**: `{ url, method='POST', param='query', debounce=400, minChars=0, headers, resultsKey='data' }` |
| `clearable` | `boolean` | `false` | افزودن گزینه‌ای برای پاک کردن انتخاب (تک‌انتخابی) |
| `clearText`، `noResultsText`، `loadingText`، `searchPlaceholder`، `selectedText` | `string` | i18n | `selectedText` از `{count}` پشتیبانی می‌کند |
| `placement` | `string` | `'bottom-start'` | placement کتابخانه Floating UI |
| `size`، `hideDropdown`، `searchNormalize`، `locale` | | | |

Event ها: `update:modelValue`، `change`، `selected` (گزینه/گزینه‌ها)، `clear`، `search`، `search-success`، `search-error`، `show`، `shown`، `hide`، `hidden`.
متدهای expose شده: `show()`، `hide()`، `toggle()`، `clear()`، `focus()`.

```vue
<ComboboxInput name="priority" :options="[{ id: 1, name: 'کم' }, { id: 2, name: 'زیاد', description: 'اول پاسخ داده می‌شود' }]" clearable />

<ComboboxInput name="customer" :search="{ url: '/api/customers', debounce: 300 }" />   <!-- remote -->

<ComboboxInput name="tags" multiple search-enabled :options="tags" />
```

endpoint جستجو `?query=…` را دریافت می‌کند و باید آرایه JSON (یا `{ data: [] }`) برگرداند. کوکی `XSRF-TOKEN` خودکار ارسال می‌شود. گزینه‌های انتخاب‌شده حتی اگر در آخرین نتایج نباشند برچسب خود را حفظ می‌کنند.

### ‏`ChipsInput` (Chips بوت‌استرپ 6)

مقدار: آرایه‌ای از رشته‌ها.

| Prop | پیش‌فرض | توضیح |
|---|---|---|
| `placeholder` | i18n | |
| `separator` | `','` | جداکننده متن تایپ/paste شده. `null` = غیرفعال |
| `allowDuplicates` | `false` | |
| `maxChips` | `null` | |
| `dismissible` | `true` | دکمه حذف روی chip |
| `dismissIcon` | `null` | مارک‌آپ آیکون حذف دلخواه |
| `createOnBlur` | `true` | |
| `validator` | `null` | `(value) => boolean`؛ مقدار ردشده event `rejected` می‌دهد |

Event ها: `update:modelValue`، `change`، `add`، `remove`، `select`، `rejected`، `focus`، `blur`. متدها: `add()`، `remove()`، `clear()`، `focus()`.

### ‏`OTPInput` (OTP بوت‌استرپ 6)

| Prop | پیش‌فرض | توضیح |
|---|---|---|
| `length` (قدیمی: `maxLength`) | `6` | تعداد کاراکتر |
| `type` | `'numeric'` | `numeric` \| `alphanumeric` \| `alpha` |
| `mask` | `false` | نمایش `•` |
| `groups` | `null` | مثلاً `[3, 3]` |
| `separator` | `'·'` | |
| `autoSubmit` | `false` | ارسال `FormContainer` به‌محض کامل شدن کد |
| `autofocus` | `false` | |

Event ها: `update:modelValue`، `change`، `input`، `complete`، `focus`، `blur`. متدها: `focus()`، `clear()`.
پشت اسلات‌ها فقط یک input واقعی وجود دارد، بنابراین پر شدن خودکار از پیامک / password manager کار می‌کند.

### ‏`RangeInput` (Range بوت‌استرپ 6)

| Prop | پیش‌فرض | توضیح |
|---|---|---|
| `min` / `max` / `step` | `0` / `100` / `1` | |
| `bubble` | `false` | حباب مقدار بالای دسته |
| `formatter` | `null` | `(value) => string` برای حباب و برچسب tickها |
| `ticks` | `[]` | `[0, 50, 100]` یا `[{ value, label }]` |

مقدار: `number`. Event ها: `update:modelValue`، `change`، `input`، `focus`، `blur`. نام قدیمی `RangeSliderInput` به‌عنوان alias باقی است.

### سایر ورودی‌ها

| کامپوننت | ویژگی‌ها |
|---|---|
| `StarRatingInput` | `maxStars`، `precision` (تعداد گام برای هر ستاره)، `showValue`، `clearable`، `value`؛ پشتیبانی ماوس/لمس و کیبورد، سازگار با RTL، `role="slider"` |
| `CaptchaInput` | `url`، `placeholder`، `refreshOnSubmit`، `imageWidth`، `imageHeight`؛ event: `refresh` |
| `PersianDatePickerInput` | `calendar`، `view`، `min`، `max`، `range`، `format`، `inputFormat`، `pickerOptions`، `inputClass`؛ eventها: `open`، `close` |
| `EditorInput` | TinyMCE: ‏`options`، `height`، `placeholder`، `apiKey`، `tinymceScriptSrc`؛ event: `init` |
| `LocationInput` | Leaflet: ‏`center`، `zoom`، `height`، `tileUrl`، `attribution`؛ مقدار `{ lat, lng }`؛ event: `ready` |
| `FileInput` (`SimpleUploader`) | `multiple`، `endpoint`، `accept`، `headers`، `fieldName`؛ eventها: `added`، `progress`، `uploaded`، `error`، `removed` |
| `DropzoneInput` | `multiple`، `url`، `options`، `headers`؛ eventها: `ready`، `added`، `success`، `error`، `removed`، `complete` |
| `UppyInput` | `multiple`، `useXHR`، `XHRConfig`، `url`، `config`، `errorHandler`، `showRestrictionCaption`؛ همه eventهای Uppy دوباره emit می‌شوند |

---

## قرارداد endpoint آپلود

`FileInput`، `DropzoneInput` و `UppyInput` با یک شکل endpoint کار می‌کنند:

* ‏`POST {url}` — فیلد multipart با نام `file` ← پاسخ JSON ‏`{ "data": { "path": "tmp/abc.jpg" } }` (یا `{ "path": … }`).
* ‏`DELETE {url}` — بدنه درخواست، `path` ذخیره‌شده (`FileInput` و `DropzoneInput`) یا همان پاسخ JSON (`UppyInput`) است.

`FileInput` رشته(های) `path` را ذخیره می‌کند؛ `DropzoneInput` و `UppyInput` آبجکت(های) پاسخ را. مقدار `form.uploading` درصد پیشرفت آپلود است و `SubmitButton` تا پایان آپلودها غیرفعال می‌ماند.

## چندزبانگی

دیکشنری‌های داخلی: `en` و `fa`. مقدار پیش‌فرض `locale: 'auto'` در صفحه‌های RTL (`dir="rtl"` / `lang="fa"`) زبان `fa` و در غیر این صورت `en` را انتخاب می‌کند.
برای جلوگیری از هرگونه اختلاف SSR / hydration، زبان را سراسری تنظیم کنید:

```js
import { configureI18n } from 'inertia-bootstrap-forms';

configureI18n({ locale: 'fa' });
configureI18n({ messages: { fa: { 'select.noResults': 'موردی نیست' } } });
```

هر کامپوننتی که متن دارد، prop به نام `locale` و propهای متنی صریح (`placeholder`، `noResultsText` و …) را هم می‌پذیرد.

## چرخه عمر، SSR و آزادسازی منابع

* پلاگین‌های بوت‌استرپ در `onMounted` با `useBsInstance()` ساخته و در `onBeforeUnmount` dispose می‌شوند؛ با تغییر propهایی که فقط هنگام ساخت خوانده می‌شوند (`multiple`، `ticks`، `length` و …) خودکار دوباره ساخته می‌شوند.
* پلاگین‌ها با `import('bootstrap/js/dist/<plugin>.js')` به‌صورت lazy بارگذاری می‌شوند و bundler می‌تواند آن‌ها را code-split کند.
* ‏`useDisposables()` لیسنرها، تایمرها، `AbortController`ها، XHRها و نمونه‌های Dropzone و Uppy را ثبت می‌کند و هنگام unmount آزاد می‌کند (حتی اگر کامپوننت در حین بارگذاری پلاگین unmount شود).
* رندر سمت سرور فقط مارک‌آپ ایستا را تولید می‌کند؛ ویجت‌هایی که به DOM نیاز دارند (Combobox، Chips، OTP، Range، Leaflet، تاریخ‌ساز و …) پس از hydrate شروع به کار می‌کنند.

## Composable ها

با همان زیرساخت می‌توانید فیلد اختصاصی بسازید:

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

علاوه بر این export می‌شوند: `useFormApi()`، `useDisposables()`، `useBsInstance()`، `configureBootstrap()`، `configureI18n()`، `toEnglishDigits()`، `countryCodes`.

---

## مهاجرت از نسخه 2

| نسخه ۲ | نسخه ۳ |
|---|---|
| کلاس‌های Bootstrap 5 ‏(`.form-check`، `.btn-primary` و …) | Bootstrap 6 ‏(`.check`، `.btn-solid.theme-primary` و …). کلاس `.btn-primary` در بوت‌استرپ 6 وجود ندارد: `SubmitButton` خودش `btn-solid theme-primary` می‌گذارد — به‌جای `class="btn btn-primary"` از propهای `variant` / `theme` استفاده کنید |
| ‏`import 'inertia-bootstrap-forms/dist/style.css'` | **حذف شد** — هیچ CSS ای همراه پکیج نیست. بوت‌استرپ 6 و CSS کتابخانه‌های جانبی را خودتان import کنید |
| ‏`Select2Input` (choices.js) | ‏`ComboboxInput`؛ ‏`Select2Input` به‌عنوان alias می‌ماند. آبجکت `config` مربوط به choices.js حذف شد — از propهای مستندشده استفاده کنید. نام فیلدهای گزینه‌ها با `valueKey` / `labelKey` تعیین می‌شود (`label` به‌عنوان نام قدیمی هنوز کار می‌کند) |
| مقدار select همیشه رشته بود | مقدار select نوع اصلی گزینه را حفظ می‌کند (`id` عددی، عدد می‌ماند) |
| ‏`RangeSliderInput` (دو دسته، svelte-range-slider-pips) | ‏`RangeInput` (یک دسته، Bootstrap 6). بوت‌استرپ 6 range دوتایی ندارد |
| طول پیش‌فرض `OTPInput` برابر `5` | پیش‌فرض `6`؛ برای حفظ اندازه قبلی `:length="5"` بدهید. event ‏`complete` دارد؛ به‌جای `data-auto-submit-length` از `auto-submit` استفاده کنید |
| event ‏`change` در `CheckboxInput` خود event DOM را می‌داد | در همه فیلدها `change(value, event)` |
| ‏`StarRatingInput` رشته‌هایی مثل `"3.5"` ذخیره می‌کرد | عدد ذخیره می‌کند |
| ‏`FormContainer` پیام‌های سرور را با `v-html` نشان می‌داد | به‌طور پیش‌فرض متن ساده؛ برای HTML از `html-messages` استفاده کنید |
| ‏`FormContainer` متدهای کمکی را هم داخل داده emit می‌کرد | فقط داده‌های فرم emit می‌شود |
| ‏`FileInput` به `window.axios` نیاز داشت | از `XMLHttpRequest` و `fetch` استفاده می‌کند و کوکی `XSRF-TOKEN` را می‌فرستد |
| ‏`AmountInput` / `QuantityInput` به `maska` نیاز داشتند | داخلی است (ارقام فارسی پشتیبانی می‌شود) |
| ‏`vue3-bootstrap-components`، `choices.js`، `svelte-range-slider-pips` داخل bundle بودند | حذف شدند |
| ‏`name` الزامی بود | اختیاری است — برای استفاده مستقل با `v-model` می‌توان آن را نداد |
| پیش‌نیاز: CSS بوت‌استرپ 5 | پیش‌نیاز: ‏`bootstrap@^6.0.0-alpha.1` و `@floating-ui/dom` |

## نکات و محدودیتها

* بوت‌استرپ 6 در حال حاضر در مرحله **alpha** است؛ نام کلاس‌ها و API پلاگین‌ها ممکن است تا انتشار پایدار تغییر کند.
* ‏Combobox بوت‌استرپ 6 روی همان عنصر toggle یک `Menu` هم می‌سازد و به همین دلیل بوت‌استرپ پیام *"Bootstrap doesn't allow more than one instance per element"* را در کنسول چاپ می‌کند. این پیام از خود بوت‌استرپ است و کامپوننت عادی کار می‌کند.
* ‏Datepicker بوت‌استرپ 6 تقویم جلالی ندارد؛ بنابراین `PersianDatePickerInput` همچنان از `vue3-persian-datetime-picker` استفاده می‌کند. ظاهر آن را با CSS خودتان تنظیم کنید.
* ‏`LocationInput` در صفحه‌های RTL: پنل‌های Leaflet به `left: auto; right: 0` نیاز دارند — اگر نقشه جابه‌جا نمایش داده شد، این قانون را در CSS خودتان اضافه کنید.
* ‏`AmountInput` / `QuantityInput` اعداد صحیح را پشتیبانی می‌کنند.
* ‏attribute ‏`data-bs-toggle` روی toggle های Combobox / Menu برای مدیریت کلیک توسط data-API بوت‌استرپ لازم است و کامپوننت‌ها آن را رندر می‌کنند.

## توسعه

```bash
npm install
npm test        # vitest + jsdom (کامپوننت‌ها، چرخه عمر پلاگین‌های بوت‌استرپ، SSR)
npm run build   # خروجی کتابخانه با vite ← dist/
```

---

توسعه و نگهداری: **[نوین ویژن](https://novinvision.com)** · مجوز MIT

</div>
