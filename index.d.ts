import type { DefineComponent, Plugin, ComputedRef, Ref, PropType } from 'vue';

/** Props shared by every field component. */
export interface FieldProps {
    /** Key of the field inside the FormContainer's v-model object. */
    name?: string | null;
    /** Only used when the field is rendered outside a FormContainer. */
    modelValue?: any;
    id?: string | null;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    /** Force the invalid state (defaults to the server-side errors of the form). */
    invalid?: boolean | null;
}

type Comp<P = {}, E = {}> = DefineComponent<FieldProps & P, {}, {}, {}, {}, {}, {}, E>;

export type Locale = 'auto' | 'en' | 'fa' | (string & {});
export type OptionItem = string | number | { [key: string]: any; disabled?: boolean; description?: string };

export interface RemoteSearch {
    url: string | null;
    method?: string;
    param?: string;
    debounce?: number;
    minChars?: number;
    headers?: Record<string, string>;
    resultsKey?: string;
}

export declare const FormContainer: DefineComponent<{
    modelValue?: Record<string, any>;
    url?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | string;
    only?: string[];
    options?: Record<string, any>;
    visitOptions?: Record<string, any>;
    autoTab?: boolean;
    resetOnSuccess?: boolean;
    submitHandler?: ((event: Event | undefined, form: any) => any) | null;
    normalizeDigits?: boolean;
    validate?: boolean;
    htmlMessages?: boolean;
    hideAlerts?: boolean;
}>;
export declare const FormField: DefineComponent<{ name?: string | null; label?: string | null; help?: string | null; error?: string | null; required?: boolean; id?: string | null }>;
export declare const FormLabel: DefineComponent<{ for?: string | null; required?: boolean }>;
export declare const GroupControl: DefineComponent<{ name: string; index?: number | string | null }>;
export declare const SubmitButton: DefineComponent<{ disabled?: boolean; loading?: boolean | null; variant?: string | null; theme?: string; locale?: Locale | null }>;

export declare const TextInput: Comp<{ type?: string; placeholder?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const TextAreaInput: Comp<{ rows?: number | string; placeholder?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const EmailInput: Comp<{ placeholder?: string | null; locale?: Locale | null }>;
export declare const PasswordInput: Comp<{ placeholder?: string | null; toggle?: boolean; locale?: Locale | null }>;
export declare const MobileInput: Comp<{ placeholder?: string | null; locale?: Locale | null }>;
export declare const TelInput: Comp<{ placeholder?: string; defaultCountry?: string; preferredCountries?: string[]; mode?: string; validCharactersOnly?: boolean; validate?: boolean; dropdownOptions?: object; inputOptions?: object }>;
export declare const FormAdornInput: Comp<{ type?: string; placeholder?: string | null; startText?: string | null; endText?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const FormAdorn: typeof FormAdornInput;

export declare const AmountInput: Comp<{ placeholder?: string | null; unit?: string | null; min?: number | null; max?: number | null; size?: 'sm' | 'lg' | null; locale?: Locale | null }>;
export declare const QuantityInput: Comp<{ min?: number; max?: number | null; step?: number; unit?: string | null; locale?: Locale | null }>;
export declare const MultiQuantityInput: Comp<{ options?: Array<string | { name: string; min?: number; max?: number; description?: string; html?: boolean }>; min?: number; max?: number | null; totalMin?: number | null; totalMax?: number | null; unit?: string | null; placement?: string; locale?: Locale | null }>;
export declare const RangeInput: Comp<{ min?: number; max?: number; step?: number; bubble?: boolean; formatter?: ((v: number) => string) | null; ticks?: Array<number | { value: number; label: string }> }>;
export declare const RangeSliderInput: typeof RangeInput;
export declare const StarRatingInput: Comp<{ value?: number; maxStars?: number; precision?: number; showValue?: boolean; clearable?: boolean }>;

export declare const CheckboxInput: Comp<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; indeterminate?: boolean; label?: string | null }>;
export declare const SwitchInput: Comp<{ value?: any; trueValue?: any; falseValue?: any; checked?: boolean; label?: string | null }>;
export declare const CheckboxButtonInput: Comp<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; variant?: string; theme?: string }>;
export declare const CheckboxToggle: Comp<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; hideInput?: boolean }>;

export declare const ComboboxInput: Comp<{
    options?: OptionItem[];
    valueKey?: string | null;
    labelKey?: string | null;
    label?: string | null;
    descriptionKey?: string;
    multiple?: boolean;
    placeholder?: string | null;
    searchEnabled?: boolean;
    searchPlaceholder?: string | null;
    search?: RemoteSearch;
    clearable?: boolean;
    clearText?: string | null;
    noResultsText?: string | null;
    loadingText?: string | null;
    selectedText?: string | null;
    searchNormalize?: boolean;
    placement?: string;
    size?: 'sm' | 'lg' | null;
    hideDropdown?: boolean;
    locale?: Locale | null;
}>;
/** @deprecated alias of ComboboxInput */
export declare const Select2Input: typeof ComboboxInput;
export declare const ChipsInput: Comp<{ placeholder?: string | null; separator?: string | null; allowDuplicates?: boolean; maxChips?: number | null; dismissible?: boolean; dismissIcon?: string | null; createOnBlur?: boolean; validator?: ((value: string) => boolean) | null; locale?: Locale | null }>;
export declare const OTPInput: Comp<{ length?: number | null; maxLength?: number | null; type?: 'numeric' | 'alphanumeric' | 'alpha'; mask?: boolean; groups?: number[] | null; separator?: string; autoSubmit?: boolean; autofocus?: boolean }>;

export declare const PersianDatePickerInput: Comp<{ calendar?: string; view?: string; min?: string | null; max?: string | null; range?: boolean; locale?: string; format?: string; inputFormat?: string | null; placeholder?: string | null; inputClass?: string; pickerOptions?: object }>;
export declare const EditorInput: Comp<{ placeholder?: string; options?: object; height?: number | string | null; tinymceScriptSrc?: string | null; apiKey?: string | null }>;
export declare const LocationInput: Comp<{ center?: { lat: number; lng: number }; zoom?: number; height?: number | string; tileUrl?: string; attribution?: string }>;
export declare const CaptchaInput: Comp<{ url?: string; placeholder?: string | null; refreshOnSubmit?: boolean; imageWidth?: number | string; imageHeight?: number | string; locale?: Locale | null }>;

export declare const FileInput: Comp<{ multiple?: boolean; endpoint?: string; accept?: string | null; headers?: Record<string, string>; fieldName?: string; locale?: Locale | null }>;
/** @deprecated alias of FileInput */
export declare const SimpleUploader: typeof FileInput;
export declare const DropzoneInput: Comp<{ multiple?: boolean; url?: string; options?: object; headers?: Record<string, string>; locale?: Locale | null }>;
export declare const UppyInput: Comp<{ multiple?: boolean; useXHR?: boolean; XHRConfig?: object; url?: string; config?: object; errorHandler?: ((m: any) => void) | null; showRestrictionCaption?: boolean; locale?: Locale | null }>;

export declare const countryCodes: Array<{ country: string; code: string; iso: string }>;

export interface BootstrapPlugins { Combobox?: any; Chips?: any; OtpInput?: any; Range?: any; Menu?: any }
export declare function configureBootstrap(modules: BootstrapPlugins): void;
export declare function configureI18n(options: { locale?: Locale; messages?: Record<string, Record<string, string>> }): void;

export declare const fieldProps: Record<string, any>;
export declare function useField(props: any, emit: (...args: any[]) => void, options?: { defaultValue?: any; valued?: () => any }): {
    form: ComputedRef<any>;
    group: ComputedRef<any>;
    standalone: ComputedRef<boolean>;
    model: any;
    error: ComputedRef<string | null>;
    isInvalid: ComputedRef<boolean>;
    isDisabled: ComputedRef<boolean>;
    inputId: ComputedRef<string>;
    emitChange: (value: any, event?: Event) => void;
    formApi: { submit: (...args: any[]) => void; reset: () => void } | null;
};
export declare function useFormApi(): { form: Ref<any> | null; submit: (...args: any[]) => void; reset: () => void };
export declare function useDisposables(): {
    add: (fn: () => void) => () => void;
    listen: (target: EventTarget, type: string, handler: any, options?: any) => () => void;
    timeout: (fn: () => void, ms: number) => number;
    abortable: () => AbortController;
    dispose: () => void;
    isDisposed: () => boolean;
};
export declare function useBsInstance(name: 'Combobox' | 'Chips' | 'OtpInput' | 'Range' | 'Menu', getElement: () => HTMLElement | null, getConfig: () => object, hooks?: { onCreate?: (instance: any, el: HTMLElement) => void; onDestroy?: (instance: any, el: HTMLElement | null) => void }): { instance: Ref<any>; create: () => Promise<any>; destroy: () => void };
export declare function toEnglishDigits(input: unknown): string;

declare const plugin: Plugin;
export default plugin;
