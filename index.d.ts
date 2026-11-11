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

export type FieldComponent<P = {}, E = {}> = DefineComponent<FieldProps & P, {}, {}, {}, {}, {}, {}>;

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

export declare const TextInput: FieldComponent<{ type?: string; placeholder?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const TextAreaInput: FieldComponent<{ rows?: number | string; placeholder?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const EmailInput: FieldComponent<{ placeholder?: string | null; locale?: Locale | null }>;
export declare const PasswordInput: FieldComponent<{ placeholder?: string | null; toggle?: boolean; strength?: boolean; strengthText?: boolean; strengthMessages?: { weak?: string; fair?: string; good?: string; strong?: string } | null; strengthOptions?: { minLength?: number; thresholds?: number[]; weights?: object; scorer?: (password: string) => number }; size?: 'sm' | 'lg' | null; locale?: Locale | null }>;
export declare const MobileInput: FieldComponent<{ placeholder?: string | null; locale?: Locale | null }>;
export declare const FormAdornInput: FieldComponent<{ type?: string; placeholder?: string | null; startText?: string | null; endText?: string | null; size?: 'sm' | 'lg' | null }>;
export declare const FormAdorn: typeof FormAdornInput;

export declare const AmountInput: FieldComponent<{ placeholder?: string | null; unit?: string | null; min?: number | null; max?: number | null; size?: 'sm' | 'lg' | null; locale?: Locale | null }>;
export declare const QuantityInput: FieldComponent<{ min?: number; max?: number | null; step?: number; unit?: string | null; locale?: Locale | null }>;
export declare const MultiQuantityInput: FieldComponent<{ options?: Array<string | { name: string; min?: number; max?: number; description?: string; html?: boolean }>; min?: number; max?: number | null; totalMin?: number | null; totalMax?: number | null; unit?: string | null; placement?: string; locale?: Locale | null }>;
export declare const RangeInput: FieldComponent<{ min?: number; max?: number; step?: number; bubble?: boolean; formatter?: ((v: number) => string) | null; ticks?: Array<number | { value: number; label: string }> }>;
export declare const RangeSliderInput: typeof RangeInput;
export declare const StarRatingInput: FieldComponent<{ value?: number; maxStars?: number; precision?: number; showValue?: boolean; clearable?: boolean }>;

export declare const CheckboxInput: FieldComponent<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; indeterminate?: boolean; label?: string | null }>;
export declare const SwitchInput: FieldComponent<{ value?: any; trueValue?: any; falseValue?: any; checked?: boolean; label?: string | null }>;
export declare const CheckboxButtonInput: FieldComponent<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; variant?: string; theme?: string }>;
export declare const CheckboxToggle: FieldComponent<{ type?: 'checkbox' | 'radio'; value?: any; trueValue?: any; falseValue?: any; checked?: boolean; hideInput?: boolean, formField?: boolean, formFieldCard?: boolean }>;
export declare const VoiceRecorderInput: FieldComponent<{
    variant?: 'box' | 'button';
    url?: string;
    fieldName?: string;
    multiple?: boolean;
    headers?: Record<string, string>;
    maxDuration?: number | null;
    audioBitsPerSecond?: number;
    audioConstraints?: MediaTrackConstraints;
    buttonClass?: string | string[] | Record<string, boolean>;
    recordingClass?: string | string[] | Record<string, boolean>;
    showList?: boolean;
    deleteOnRemove?: boolean;
    playbackUrl?: (value: any) => string;
    startText?: string | null;
    stopText?: string | null;
    locale?: Locale | null;
}>;

export declare const ComboboxInput: FieldComponent<{
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
    showSelected?: boolean;
    maxVisible?: number | null;
    selectedSeparator?: string | null;
    searchNormalize?: boolean;
    placement?: string;
    size?: 'sm' | 'lg' | null;
    hideDropdown?: boolean;
    locale?: Locale | null;
}>;
/** @deprecated alias of ComboboxInput */
export declare const Select2Input: typeof ComboboxInput;
export declare const ChipsInput: FieldComponent<{ placeholder?: string | null; separator?: string | null; allowDuplicates?: boolean; maxChips?: number | null; dismissible?: boolean; dismissIcon?: string | null; createOnBlur?: boolean; validator?: ((value: string) => boolean) | null; locale?: Locale | null }>;
export declare const OTPInput: FieldComponent<{ length?: number | null; maxLength?: number | null; type?: 'numeric' | 'alphanumeric' | 'alpha'; mask?: boolean; groups?: number[] | null; separator?: string; autoSubmit?: boolean; autofocus?: boolean }>;

export declare const CaptchaInput: FieldComponent<{ url?: string; placeholder?: string | null; refreshOnSubmit?: boolean; imageWidth?: number | string; imageHeight?: number | string; locale?: Locale | null }>;

export declare const FileInput: FieldComponent<{ multiple?: boolean; endpoint?: string; accept?: string | null; headers?: Record<string, string>; fieldName?: string; locale?: Locale | null }>;
/** @deprecated alias of FileInput */
export declare const SimpleUploader: typeof FileInput;


export interface BootstrapPlugins { Combobox?: any; Chips?: any; OtpInput?: any; Range?: any; Menu?: any; Strength?: any }
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
export declare function useBsInstance(name: 'Combobox' | 'Chips' | 'OtpInput' | 'Range' | 'Menu' | 'Strength', getElement: () => HTMLElement | null, getConfig: () => object, hooks?: { onCreate?: (instance: any, el: HTMLElement) => void; onDestroy?: (instance: any, el: HTMLElement | null) => void }): { instance: Ref<any>; create: () => Promise<any>; destroy: () => void };
export declare function toEnglishDigits(input: unknown): string;

declare const plugin: Plugin;
export default plugin;
