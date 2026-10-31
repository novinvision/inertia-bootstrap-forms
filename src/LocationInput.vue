<script>
import { computed, defineAsyncComponent, defineComponent, onMounted, ref, watch } from 'vue';
import { fieldProps, useField } from './composables/useField.js';

const LMap = defineAsyncComponent(() => import('@vue-leaflet/vue-leaflet').then((m) => m.LMap));
const LTileLayer = defineAsyncComponent(() => import('@vue-leaflet/vue-leaflet').then((m) => m.LTileLayer));
const LMarker = defineAsyncComponent(() => import('@vue-leaflet/vue-leaflet').then((m) => m.LMarker));

/**
 * Leaflet map picker. The value is `{ lat, lng }`.
 * Import `leaflet/dist/leaflet.css` in your application.
 */
export default defineComponent({
    name: 'LocationInput',
    components: { LMap, LTileLayer, LMarker },
    emits: ['update:modelValue', 'change', 'ready'],
    props: {
        ...fieldProps,
        name: { type: String, default: 'location' },
        /** Initial map centre when there is no value yet. */
        center: { type: Object, default: () => ({ lat: 35.69293, lng: 51.36372 }) },
        zoom: { type: Number, default: 13 },
        height: { type: [Number, String], default: 300 },
        tileUrl: { type: String, default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
        attribution: { type: String, default: '&copy; OpenStreetMap contributors' },
    },
    setup(props, { emit }) {
        const field = useField(props, emit);
        const ready = ref(false);
        const zoomLevel = ref(props.zoom);

        onMounted(() => {
            ready.value = true; // Leaflet touches `window`, so it is rendered on the client only
        });

        const marker = computed(() => {
            const v = field.model.value;
            return v?.lat !== undefined && v?.lat !== null && v?.lng !== undefined && v?.lng !== null
                ? { lat: Number(v.lat), lng: Number(v.lng) }
                : null;
        });

        const mapCenter = computed(() => marker.value ?? props.center);
        const locked = computed(() => props.readonly || field.isDisabled.value);

        watch(() => props.zoom, (z) => (zoomLevel.value = z));

        function setMarker(event) {
            if (locked.value) return;
            const latlng = event?.latlng ?? event?.target?._latlng;
            if (!latlng) return;

            const next = { lat: latlng.lat, lng: latlng.lng };
            field.model.value = next;
            field.emitChange(next, event);
        }

        return {
            ...field,
            ready,
            zoomLevel,
            marker,
            mapCenter,
            locked,
            setMarker,
            heightCss: computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height)),
        };
    },
});
</script>

<template>
    <div
        class="location-map-container position-relative overflow-hidden"
        :class="{ disabled: locked, 'is-invalid': isInvalid }"
        :id="inputId"
        :style="{ width: '100%', height: heightCss }"
    >
        <l-map
            v-if="ready"
            v-model:zoom="zoomLevel"
            :use-global-leaflet="false"
            :center="mapCenter"
            @click="setMarker"
            @ready="$emit('ready', $event)"
        >
            <l-tile-layer :url="tileUrl" :attribution="attribution" layer-type="base" name="OpenStreetMap" />
            <l-marker v-if="marker" :lat-lng="marker" :draggable="!locked" @dragend="setMarker" />
        </l-map>
    </div>
</template>
