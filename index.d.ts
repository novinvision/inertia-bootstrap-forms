import { defineComponent } from 'vue';

// Import کامپوننت‌ها
import AmountInput from './src/AmountInput.vue';
import CaptchaInput from './src/CaptchaInput.vue';
import CheckboxButtonInput from './src/CheckboxButtonInput.vue';
import CheckboxInput from './src/CheckboxInput.vue';
import CheckboxToggle from './src/CheckboxToggle.vue';
import EditorInput from './src/EditorInput.vue';
import EmailInput from './src/EmailInput.vue';
import FileInput from './src/FileInput.vue';
import SimpleUploader from './src/SimpleUploader.vue';
import UppyInput from './src/UppyInput.vue';
import FormContainer from './src/FormContainer.vue';
import FormLabel from './src/FormLabel.vue';
import GroupControl from './src/GroupControl.vue';
import LocationInput from './src/LocationInput.vue';
import MobileInput from './src/MobileInput.vue';
import MultiQuantityInput from './src/MultiQuantityInput.vue';
import PasswordInput from './src/PasswordInput.vue';
import PersianDatePickerInput from './src/PersianDatePickerInput.vue';
import QuantityInput from './src/QuantityInput.vue';
import Select2Input from './src/Select2Input.vue';
import StarRatingInput from './src/StarRatingInput.vue';
import SubmitButton from './src/SubmitButton.vue';
import TelInput from './src/TelInput.vue';
import TextAreaInput from './src/TextAreaInput.vue';
import TextInput from './src/TextInput.vue';
import DropzoneInput from './src/DropzoneInput.vue';
import { countryCodes } from './src/countryCodes';

// Export تکی
export {
    AmountInput,
    CaptchaInput,
    CheckboxButtonInput,
    CheckboxInput,
    CheckboxToggle,
    countryCodes,
    EditorInput,
    EmailInput,
    DropzoneInput,
    UppyInput,
    FileInput,
    SimpleUploader,
    FormContainer,
    FormLabel,
    GroupControl,
    LocationInput,
    MobileInput,
    MultiQuantityInput,
    PasswordInput,
    PersianDatePickerInput,
    QuantityInput,
    Select2Input,
    StarRatingInput,
    SubmitButton,
    TelInput,
    TextAreaInput,
    TextInput,
    Quantity,
    File,
};

// Export پیش‌فرض برای import * as
const Vue3FormComponents = {
    AmountInput,
    CaptchaInput,
    CheckboxButtonInput,
    CheckboxInput,
    CheckboxToggle,
    countryCodes,
    EditorInput,
    DropzoneInput,
    UppyInput,
    EmailInput,
    FileInput,
    SimpleUploader,
    FormContainer,
    FormLabel,
    GroupControl,
    LocationInput,
    MobileInput,
    MultiQuantityInput,
    PasswordInput,
    PersianDatePickerInput,
    QuantityInput,
    Select2Input,
    StarRatingInput,
    SubmitButton,
    TelInput,
    TextAreaInput,
    TextInput,
};

export default Vue3FormComponents;

import { DefineComponent } from 'vue';

export const AmountInput: DefineComponent<{}, {}, any>;
export const CaptchaInput: DefineComponent<{}, {}, any>;
export const CheckboxButtonInput: DefineComponent<{
    name: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        default: '',
        required: false,
    },
    value: {
        type: String,
        default: 'yes',
        required: false,
    },
    type: {
        type: String,
        default: 'radio',
        required: false,
    },
}, {}, any>;
export const CheckboxInput: DefineComponent<{}, {}, any>;
export const CheckboxToggle: DefineComponent<{}, {}, any>;
export const countryCodes: any;
export const EditorInput: DefineComponent<{
    name: {
        type: String,
        required: true,
    },
    modelValue: String,
    placeholder: {
        type: String,
        default: 'اینجا بنویسید...',
    },
    invalid: Boolean,
    allowLink: Boolean,
    height: Number,
    minHeight: Number,
    useStyle: {
        type: Boolean,
        default: false,
    },
    modules: {
        default: [],
        required: false,
    },
    options: {
        type: Object,
        default: {},
        required: false,
    },
}, {}, any>;
export const EmailInput: DefineComponent<{}, {}, any>;
export const DropzoneInput: DefineComponent<{}, {}, any>;
export const UppyInput: DefineComponent<{
    name: {
        type: String,
        required: true,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    showRestrictionCaption: {
        type: Boolean,
        default: true,
    },
    errorHandler: {type: Function, default: null},
    config: {type: Object, default: () => ({})},
    modelValue: String,
    XHRConfig: {type: Object, default: {}},
    useXHR: {type: Boolean, default: true},
    url: { type: String, default: "/upload" },
},   {},
    any,
    {},
    {},
    {},
    {},
    {
        'update:modelValue': (value: string) => void,
        'file-added': (file) => void,
        'file-removed': (file) => void,
        'beforeUpload': (files) => void,
        'progress': (progress) => void,
        'upload': (uploadID, file) => void,
        'upload-progress': (file, progress) => void,
        'upload-error': (file, error, response) => void,
        'upload-success': (file, response) => void,
        'upload-pause': (file, isPaused) => void,
        'complete': (result) => void,
        'error': (error) => void,
        'upload-retry': (file) => void,
        'upload-stalled': (error, files) => void,
        'retry-all': (files) => void,
        'cancel-all': () => void,
        'restriction-failed': (file, error) => void,
    }
>;
export const FileInput: DefineComponent<{}, {}, any>;
export const SimpleUploader: DefineComponent<{}, {}, any>;
export const FormContainer: DefineComponent<{
    url: {
        type: String,
        default: '',
        required: false,
    },
    method: {
        default: 'post'
    },
    only: {
        type: Array,
        default: [],
        required: false,
    },
    modelValue: {
        type: Object,
        default: {},
        required: false,
    },
    options: {
        type: Object,
        default: {},
        required: false,
    },
    resetOnSuccess: {
        type: Boolean,
        default: true,
    },
    submitHandler: {
        type: Function,
        default: null,
        required: false,
    },
}, {}, any,
    {},
    {},
    {},
    {},
    {
        'update:modelValue': (data) => void,
        'submit': (event) => void,
        'reset': (file) => void,
        'onStart': () => void,
        'onFinish': (data) => void,
        'onSuccess': (data) => void,
        'onError': (errors) => void,
        'change': (data) => void,
    }
>;
export const FormLabel: DefineComponent<{}, {}, any>;
export const GroupControl: DefineComponent<{}, {}, any>;
export const LocationInput: DefineComponent<{
    name: {
        type: String,
        default: 'location',
        required: false,
    },
    disabled: {
        type: [Boolean, String],
        default: false,
    },
    readonly: {
        type: [Boolean, String],
        default: false,
    },
}, {}, any>;
export const MobileInput: DefineComponent<{}, {}, any>;
export const MultiQuantityInput: DefineComponent<{}, {}, any>;
export const PasswordInput: DefineComponent<{}, {}, any>;
export const PersianDatePickerInput: DefineComponent<{}, {}, any>;
export const QuantityInput: DefineComponent<{}, {}, any>;
export const Select2Input: DefineComponent<{
    name: {
        type: String,
        required: true,
    },
    modelValue: '',
    label: {
        type: String,
        default: 'name',
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
}, {}, any,
{},
{},
{},
{},
{
    'update:modelValue': (data) => void,
    'search': (event) => void,
    'searching': (query) => void,
    'change': (file) => void,
    'selected': () => void,
}
>;
export const StarRatingInput: DefineComponent<{}, {}, any>;
export const SubmitButton: DefineComponent<{
    disabled: {
        type: Boolean,
        default: false
    }
}, {}, any>;
export const TelInput: DefineComponent<{}, {}, any>;
export const TextAreaInput: DefineComponent<{}, {}, any>;
export const TextInput: DefineComponent<{}, {}, any>;
export const RangeSliderInput: DefineComponent<{
    name: {
        type: String,
        default: null,
    },
    modelValue: {
        type: Number,
        default: 0
    },
    value: {
        type: Number,
        default: 0
    },
    min: {
        type: Number,
        default: 1
    },
    max: {
        type: Number,
        default: 100
    },
    step: {
        type: Number,
        default: 1
    },
    readonly: {
        type: Boolean,
        default: false
    },
    range: {
        type: Boolean,
        default: false
    },
    options: {
        type: Object,
        default: {}
    }
}, {}, any>;

// Export پیش‌فرض
declare const Vue3FormComponents: {
    AmountInput: typeof AmountInput;
    CaptchaInput: typeof CaptchaInput;
    CheckboxButtonInput: typeof CheckboxButtonInput;
    CheckboxInput: typeof CheckboxInput;
    CheckboxToggle: typeof CheckboxToggle;
    DropzoneInput: typeof DropzoneInput;
    countryCodes: typeof countryCodes;
    EditorInput: typeof EditorInput;
    EmailInput: typeof EmailInput;
    FileInput: typeof FileInput;
    SimpleUploader: typeof SimpleUploader;
    FormContainer: typeof FormContainer;
    FormLabel: typeof FormLabel;
    GroupControl: typeof GroupControl;
    LocationInput: typeof LocationInput;
    MobileInput: typeof MobileInput;
    MultiQuantityInput: typeof MultiQuantityInput;
    PasswordInput: typeof PasswordInput;
    PersianDatePickerInput: typeof PersianDatePickerInput;
    QuantityInput: typeof QuantityInput;
    Select2Input: typeof Select2Input;
    StarRatingInput: typeof StarRatingInput;
    SubmitButton: typeof SubmitButton;
    TelInput: typeof TelInput;
    TextAreaInput: typeof TextAreaInput;
    TextInput: typeof TextInput;
    Quantity: typeof QuantityInput;
    RangeSliderInput: typeof RangeSliderInput;
};

export default Vue3FormComponents;
