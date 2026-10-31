<script>
import { defineComponent, h } from 'vue';
import FileInput from './FileInput.vue';

/** @deprecated Kept for backwards compatibility — identical to <FileInput>. */
export default defineComponent({
    name: 'SimpleUploader',
    inheritAttrs: true,
    setup(_, { attrs, slots }) {
        return () => h(FileInput, attrs, slots);
    },
});
</script>
