import AmountInput from './AmountInput.vue';
import CaptchaInput from './CaptchaInput.vue';
import CheckboxButtonInput from './CheckboxButtonInput.vue';
import CheckboxInput from './CheckboxInput.vue';
import CheckboxToggle from './CheckboxToggle.vue';
import ChipsInput from './ChipsInput.vue';
import ComboboxInput from './ComboboxInput.vue';
import DropzoneInput from './DropzoneInput.vue';
import EditorInput from './EditorInput.vue';
import EmailInput from './EmailInput.vue';
import FileInput from './FileInput.vue';
import FormAdornInput from './FormAdornInput.vue';
import FormContainer from './FormContainer.vue';
import FormField from './FormField.vue';
import FormLabel from './FormLabel.vue';
import GroupControl from './GroupControl.vue';
import LocationInput from './LocationInput.vue';
import MobileInput from './MobileInput.vue';
import MultiQuantityInput from './MultiQuantityInput.vue';
import OTPInput from './OTPInput.vue';
import PasswordInput from './PasswordInput.vue';
import PersianDatePickerInput from './PersianDatePickerInput.vue';
import QuantityInput from './QuantityInput.vue';
import RangeInput from './RangeInput.vue';
import SimpleUploader from './SimpleUploader.vue';
import StarRatingInput from './StarRatingInput.vue';
import SubmitButton from './SubmitButton.vue';
import SwitchInput from './SwitchInput.vue';
import TelInput from './TelInput.vue';
import TextAreaInput from './TextAreaInput.vue';
import TextInput from './TextInput.vue';
import UppyInput from './UppyInput.vue';

import { configureBootstrap } from './utils/bootstrap.js';
import { configureI18n } from './i18n.js';

/** Backwards compatible names (v2 → v3). */
const Select2Input = ComboboxInput;
const RangeSliderInput = RangeInput;
const FormAdorn = FormAdornInput;

const components = {
    AmountInput,
    CaptchaInput,
    CheckboxButtonInput,
    CheckboxInput,
    CheckboxToggle,
    ChipsInput,
    ComboboxInput,
    DropzoneInput,
    EditorInput,
    EmailInput,
    FileInput,
    FormAdornInput,
    FormContainer,
    FormField,
    FormLabel,
    GroupControl,
    LocationInput,
    MobileInput,
    MultiQuantityInput,
    OTPInput,
    PasswordInput,
    PersianDatePickerInput,
    QuantityInput,
    RangeInput,
    SimpleUploader,
    StarRatingInput,
    SubmitButton,
    SwitchInput,
    TelInput,
    TextAreaInput,
    TextInput,
    UppyInput,
    // aliases
    Select2Input,
    RangeSliderInput,
    FormAdorn,
};

/**
 * Optional global registration:
 *   app.use(InertiaBootstrapForms, { locale: 'fa', bootstrap: { Combobox, Chips, OtpInput, Range, Menu } })
 */
const plugin = {
    install(app, options = {}) {
        if (options.locale || options.messages) configureI18n(options);
        if (options.bootstrap) configureBootstrap(options.bootstrap);

        Object.entries(components).forEach(([name, component]) => app.component(name, component));
    },
};

export default plugin;

export {
    AmountInput,
    CaptchaInput,
    CheckboxButtonInput,
    CheckboxInput,
    CheckboxToggle,
    ChipsInput,
    ComboboxInput,
    DropzoneInput,
    EditorInput,
    EmailInput,
    FileInput,
    FormAdornInput,
    FormContainer,
    FormField,
    FormLabel,
    GroupControl,
    LocationInput,
    MobileInput,
    MultiQuantityInput,
    OTPInput,
    PasswordInput,
    PersianDatePickerInput,
    QuantityInput,
    RangeInput,
    SimpleUploader,
    StarRatingInput,
    SubmitButton,
    SwitchInput,
    TelInput,
    TextAreaInput,
    TextInput,
    UppyInput,
    // aliases
    Select2Input,
    RangeSliderInput,
    FormAdorn,
};

export { configureBootstrap } from './utils/bootstrap.js';
export { configureI18n } from './i18n.js';
export { fieldProps, useField } from './composables/useField.js';
export { useFormApi } from './composables/useFormApi.js';
export { useDisposables } from './composables/useDisposables.js';
export { useBsInstance } from './composables/useBsInstance.js';
export { toEnglishDigits } from './utils/digits.js';
export { default as countryCodes } from './countryCodes.js';
