// index.d.ts
import { DefineComponent } from 'vue';

export const AmountInput: DefineComponent<{}, {}, any>;
export const CaptchaInput: DefineComponent<{}, {}, any>;
export const CheckboxButtonInput: DefineComponent<{}, {}, any>;
export const CheckboxInput: DefineComponent<{}, {}, any>;
export const CheckboxToggle: DefineComponent<{}, {}, any>;
export const countryCodes: any;
export const EditorInput: DefineComponent<{}, {}, any>;
export const EmailInput: DefineComponent<{}, {}, any>;
export const FileInput: DefineComponent<{}, {}, any>;
export const FileUploader: DefineComponent<{}, {}, any>;
export const FormContainer: DefineComponent<{}, {}, any>;
export const FormLabel: DefineComponent<{}, {}, any>;
export const GroupControl: DefineComponent<{}, {}, any>;
export const LocationInput: DefineComponent<{}, {}, any>;
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

// این قسمت برای اینکه import * as ... هم ساپورت بشه
declare const Vue3FormComponents: {
    AmountInput: typeof AmountInput;
    CaptchaInput: typeof CaptchaInput;
    CheckboxButtonInput: typeof CheckboxButtonInput;
    CheckboxInput: typeof CheckboxInput;
    CheckboxToggle: typeof CheckboxToggle;
    countryCodes: typeof countryCodes;
    EditorInput: typeof EditorInput;
    EmailInput: typeof EmailInput;
    FileInput: typeof FileInput;
    FileUploader: typeof FileUploader;
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
};

export default Vue3FormComponents;
