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
import FormContainer from './src/FormContainer.vue';
import FormLabel from './src/FormLabel.vue';
import GroupControl from './src/GroupControl.vue';
import LocationInput from './src/LocationInput.vue';
import MobileInput from './src/MobileInput.vue';
import MultiQuantityInput from './src/MultiQuantityInput.vue';
import PasswordInput from './src/PasswordInput.vue';
import PersianDatePickerInput from './src/PersianDatePickerInput.vue';
import QuantityInput from './src/QuantityInput.vue';
import SecondarySubmitButton from './src/SecondarySubmitButton.vue';
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
    SecondarySubmitButton,
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
    SecondarySubmitButton,
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
export const CheckboxButtonInput: DefineComponent<{}, {}, any>;
export const CheckboxInput: DefineComponent<{}, {}, any>;
export const CheckboxToggle: DefineComponent<{}, {}, any>;
export const countryCodes: any;
export const EditorInput: DefineComponent<{}, {}, any>;
export const EmailInput: DefineComponent<{}, {}, any>;
export const DropzoneInput: DefineComponent<{}, {}, any>;
export const FileInput: DefineComponent<{}, {}, any>;
export const SimpleUploader: DefineComponent<{}, {}, any>;
export const FormContainer: DefineComponent<{}, {}, any>;
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
export const SecondarySubmitButton: DefineComponent<{}, {}, any>;
export const Select2Input: DefineComponent<{}, {}, any>;
export const StarRatingInput: DefineComponent<{}, {}, any>;
export const SubmitButton: DefineComponent<{}, {}, any>;
export const TelInput: DefineComponent<{}, {}, any>;
export const TextAreaInput: DefineComponent<{}, {}, any>;
export const TextInput: DefineComponent<{}, {}, any>;

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
    SecondarySubmitButton: typeof SecondarySubmitButton;
    Select2Input: typeof Select2Input;
    StarRatingInput: typeof StarRatingInput;
    SubmitButton: typeof SubmitButton;
    TelInput: typeof TelInput;
    TextAreaInput: typeof TextAreaInput;
    TextInput: typeof TextInput;
    Quantity: typeof QuantityInput;
};

export default Vue3FormComponents;
