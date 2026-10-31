<script>
import { computed, defineComponent, inject, onMounted, provide, ref } from 'vue';

export default defineComponent({
    name: 'GroupControl',
    props: {
        /** Key of the object / array inside the form that holds the grouped values. */
        name: { type: String, required: true },
        /** Explicit item index (repeaters). When omitted it is detected from the DOM position. */
        index: { type: [Number, String], default: null },
    },
    setup(props) {
        const form = inject('form', null);
        const groupEl = ref(null);
        const detected = ref('0');

        const index = computed(() => (props.index !== null ? String(props.index) : detected.value));

        onMounted(() => {
            if (props.index !== null) return;
            const siblings = groupEl.value?.parentNode?.parentNode?.querySelectorAll('.form-control-group');
            siblings?.forEach((item, i) => {
                if (item === groupEl.value) detected.value = String(i);
            });
        });

        const api = {
            get name() {
                return props.name;
            },
            get index() {
                return index.value;
            },
            getData(field) {
                const container = form?.value?.[props.name];
                if (container === null || container === undefined) return null;
                if (Array.isArray(container)) return container[Number(index.value)]?.[field] ?? null;
                return container[field] ?? null;
            },
            setData(field, value) {
                const f = form?.value;
                if (!f) return;

                if (f[props.name] === null || f[props.name] === undefined) {
                    f[props.name] = props.index !== null ? [] : {};
                }

                if (Array.isArray(f[props.name])) {
                    const i = Number(index.value);
                    if (!f[props.name][i]) f[props.name][i] = {};
                    f[props.name][i][field] = value;
                } else {
                    f[props.name][field] = value;
                }
            },
        };

        provide('group', computed(() => api));

        return { groupEl, index };
    },
});
</script>

<template>
    <div ref="groupEl" class="form-control-group" :data-name="name" :data-group-id="index">
        <slot />
    </div>
</template>
