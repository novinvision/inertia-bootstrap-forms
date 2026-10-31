import { inject } from 'vue';

/** Programmatic access to the parent FormContainer: submit(), reset(), form. */
export function useFormApi() {
    const form = inject('form', null);
    const api = inject('formApi', null);
    return {
        form: form,
        submit: (...args) => api?.submit?.(...args),
        reset: () => api?.reset?.(),
    };
}
