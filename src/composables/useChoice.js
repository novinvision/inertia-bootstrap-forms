import { onMounted, watch } from 'vue';

/**
 * Shared behaviour of checkbox / radio / switch style fields:
 *  - the `checked` prop initialises the model when it is still empty
 *  - the `indeterminate` DOM property is kept in sync
 */
export function useChoice(props, field, elRef, { type = () => props.type } = {}) {
    function applyInitialChecked() {
        if (!props.checked) return;
        const current = field.model.value;

        if (type() === 'radio') {
            if (current === null || current === undefined || current === '') field.model.value = props.value;
        } else if (Array.isArray(current)) {
            if (!current.includes(props.value)) field.model.value = [...current, props.value];
        } else if (!current) {
            field.model.value = props.trueValue !== undefined ? props.trueValue : true;
        }
    }

    function syncIndeterminate() {
        if (elRef.value) elRef.value.indeterminate = !!props.indeterminate;
    }

    onMounted(() => {
        applyInitialChecked();
        syncIndeterminate();
    });

    watch(() => props.indeterminate, syncIndeterminate);

    return { applyInitialChecked };
}
