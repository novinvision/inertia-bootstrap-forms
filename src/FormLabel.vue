<script>
import { computed, defineComponent, inject, onMounted, ref } from 'vue';

export default defineComponent({
    name: 'FormLabel',
    props: {
        /** id of the control. Detected automatically inside <FormField> or from the next element. */
        for: { type: String, default: null },
        required: { type: Boolean, default: false },
    },
    setup(props) {
        const ctx = inject('formField', null);
        const el = ref(null);
        const detected = ref(null);

        onMounted(() => {
            if (props.for || ctx?.id) return;
            const sibling = el.value?.nextElementSibling;
            if (sibling) detected.value = sibling.id || sibling.querySelector('[id]')?.id || null;
        });

        const target = computed(() => props.for || ctx?.id || detected.value || undefined);

        return { el, target };
    },
});
</script>

<template>
    <label ref="el" class="form-label" :for="target">
        <slot />
        <span v-if="required" class="fg-danger" aria-hidden="true"> *</span>
    </label>
</template>
