<script>
import { computed, defineComponent, h } from 'vue';
import Audio from '@uppy/audio';
import Webcam from '@uppy/webcam';
import Dashboard from '@uppy/vue/dashboard';
import UppyInput from './UppyInput.vue';

/**
 * UppyInput with the Uppy Dashboard UI and optional camera / voice recorder.
 * Every UppyInput prop and event works here too.
 *
 * Needs: @uppy/dashboard, @uppy/webcam, @uppy/audio (+ their CSS).
 */
export default defineComponent({
    name: 'UppyDashboardInput',
    inheritAttrs: false,
    props: {
        /** Camera: true or @uppy/webcam options, e.g. { modes: ['picture'], mirror: true }. Needs HTTPS / localhost. */
        webcam: { type: [Boolean, Object], default: false },
        /** Voice recorder: true or @uppy/audio options, e.g. { showAudioSourceDropdown: true }. Needs HTTPS / localhost. */
        audio: { type: [Boolean, Object], default: false },
        /** Dashboard options: { height, width, theme, note, … }. */
        dashboardProps: { type: Object, default: () => ({}) },
    },
    setup(props, { attrs, slots }) {
        const plugins = computed(() => {
            const list = [];
            if (props.webcam) {
                list.push({ plugin: Webcam, options: { id: 'Webcam', ...(typeof props.webcam === 'object' ? props.webcam : {}) } });
            }
            if (props.audio) {
                list.push({ plugin: Audio, options: { id: 'Audio', ...(typeof props.audio === 'object' ? props.audio : {}) } });
            }
            return list;
        });

        return () =>
            h(
                UppyInput,
                { ...attrs, plugins: plugins.value, dashboardComponent: Dashboard, dashboardProps: props.dashboardProps },
                slots
            );
    },
});
</script>
