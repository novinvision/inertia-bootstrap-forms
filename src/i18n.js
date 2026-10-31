import { computed, reactive } from 'vue';

const state = reactive({
    locale: 'auto',
    messages: {
        en: {
            'select.placeholder': 'Select an option…',
            'select.search': 'Type to search…',
            'select.noResults': 'No results found',
            'select.loading': 'Searching…',
            'select.selectedCount': '{count} selected',
            'select.clear': '— Clear selection —',
            'select.error': 'Search failed',
            'submit.default': 'Submit',
            'chips.placeholder': 'Type and press Enter…',
            'chips.remove': 'Remove',
            'email.placeholder': 'Enter your email',
            'password.placeholder': 'Enter your password',
            'password.show': 'Show password',
            'password.hide': 'Hide password',
            'mobile.placeholder': 'Enter your mobile number',
            'amount.placeholder': 'Enter a number',
            'amount.unit': 'pcs',
            'quantity.unit': 'pcs',
            'quantity.increase': 'Increase',
            'quantity.decrease': 'Decrease',
            'captcha.placeholder': 'Enter the code shown',
            'captcha.refresh': 'Refresh code',
            'captcha.alt': 'captcha',
            'file.retry': 'Retry',
            'file.remove': 'Remove',
            'upload.failed': 'Upload failed',
            'uppy.types': 'Only {types} files',
            'uppy.maxFiles': 'up to {count} files',
            'uppy.minFiles': 'at least {count} files required',
            'uppy.maxSize': 'max {size} per file',
            'uppy.minSize': 'min {size} per file',
            'uppy.maxTotal': 'max {size} in total',
            'uppy.suffix': 'are allowed.',
        },
        fa: {
            'select.placeholder': 'انتخاب کنید…',
            'select.search': 'برای جستجو تایپ کنید…',
            'select.noResults': 'نتیجه‌ای یافت نشد',
            'select.loading': 'در حال جستجو…',
            'select.selectedCount': '{count} مورد انتخاب شده',
            'select.clear': '— پاک کردن انتخاب —',
            'select.error': 'جستجو با خطا مواجه شد',
            'submit.default': 'تایید و ثبت اطلاعات',
            'chips.placeholder': 'تایپ کنید و Enter بزنید…',
            'chips.remove': 'حذف',
            'email.placeholder': 'ایمیل خود را وارد کنید',
            'password.placeholder': 'گذرواژه خود را وارد کنید',
            'password.show': 'نمایش گذرواژه',
            'password.hide': 'مخفی کردن گذرواژه',
            'mobile.placeholder': 'موبایل خود را وارد کنید',
            'amount.placeholder': 'عدد را وارد کنید',
            'amount.unit': 'عدد',
            'quantity.unit': 'عدد',
            'quantity.increase': 'افزایش',
            'quantity.decrease': 'کاهش',
            'captcha.placeholder': 'کد امنیتی روبرو را وارد کنید',
            'captcha.refresh': 'کد جدید',
            'captcha.alt': 'کد امنیتی',
            'file.retry': 'تلاش مجدد',
            'file.remove': 'حذف',
            'upload.failed': 'خطا در آپلود',
            'uppy.types': 'فقط فایل‌های {types}',
            'uppy.maxFiles': 'امکان انتخاب حداکثر {count} فایل',
            'uppy.minFiles': 'حداقل {count} فایل نیاز است',
            'uppy.maxSize': 'با حداکثر حجم {size} برای هر فایل',
            'uppy.minSize': 'با حداقل حجم {size} برای هر فایل',
            'uppy.maxTotal': 'و مجموع حجم کل حداکثر {size}',
            'uppy.suffix': 'مجاز است.',
        },
    },
});

/**
 * Global i18n configuration.
 *   configureI18n({ locale: 'fa' })
 *   configureI18n({ messages: { fa: { 'select.noResults': '...' } } })
 */
export function configureI18n({ locale, messages } = {}) {
    if (locale) state.locale = locale;
    if (messages) {
        Object.keys(messages).forEach((lang) => {
            state.messages[lang] = { ...(state.messages[lang] || {}), ...messages[lang] };
        });
    }
}

function detectLocale() {
    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (root?.dir === 'rtl' || root?.getAttribute('lang')?.startsWith('fa')) return 'fa';
    }
    return 'en';
}

/**
 * `localeRef` may be a prop getter. Returns `t(key, vars)`.
 */
export function useI18n(getLocale = () => null) {
    const locale = computed(() => {
        const requested = getLocale() || state.locale;
        return requested === 'auto' ? detectLocale() : requested;
    });

    const t = (key, vars = {}) => {
        const dict = state.messages[locale.value] || state.messages.en;
        let text = dict[key] ?? state.messages.en[key] ?? key;
        Object.keys(vars).forEach((k) => {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
        });
        return text;
    };

    return { t, locale };
}
