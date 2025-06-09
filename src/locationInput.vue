<script>
import "leaflet/dist/leaflet.css";
import {LMap, LTileLayer, LMarker} from "@vue-leaflet/vue-leaflet";
import {inject} from "vue";

export default {
  name: 'locationInput',
  components: {
    LMap, LTileLayer, LMarker
  },
  props: {
    name: {
      type: String,
      default: 'location',
      required: false,
    },
    disabled: {
      type: [Boolean, String],
      default: false,
    },
    modelValue: Object,
  },
  setup(props) {
    let form = inject('form');

    if (form === undefined) {
      form = {
        errors: {},
        zoom: 8,
        center: [47.41322, -1.219482],
        getID(name) {
        }
      };
    }

    return {form};
  },
  methods: {
    setMarker(event) {
      this.marker = {
        lat: event?.latlng?.lat || event?.target?._latlng?.lat,
        lng: event?.latlng?.lng || event?.target?._latlng?.lng,
      };

      this.$emit('update:modelValue', this.marker);
      this.form[this.name] = this.marker;
    }
  },
  data() {
    return {
      zoom: 13,
      marker: {
        lat: this.modelValue?.lat || this.form[this.name]?.lat || null,
        lng: this.modelValue?.lng || this.form[this.name]?.lng || null,
      },
      center: {
        lat: this.modelValue?.lat || this.form[this.name]?.lat || 35.69293,
        lng: this.modelValue?.lng || this.form[this.name]?.lng || 51.36372,
      },
    };
  },

}
</script>
<template>
  <div class="location-map-container"
       :class="{disabled: disabled || form.processing, 'is-invalid': form?.errors[name] !== undefined}">
    <l-map ref="map" v-model:zoom="zoom" :useGlobalLeaflet="false" :center="this.center" @click="setMarker">
      <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
      ></l-tile-layer>
      <LMarker :lat-lng="marker" v-if="marker" :draggable="true" @dragend="setMarker"/>
    </l-map>
  </div>
</template>
<style>
.location-map-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: var(--bs-border-radius);
}

.location-map-container.is-invalid {
  border: 1px solid var(--bs-form-invalid-border-color);
}

.location-map-container[disabled],
.location-map-container.disabled:before {
  content: "";
  background-color: rgba(var(--bs-light-rgb), 0.4);
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 9999;
}

.location-map-container {
  .leaflet-pane,
  .leaflet-tile,
  .leaflet-marker-icon,
  .leaflet-marker-shadow,
  .leaflet-tile-container,
  .leaflet-pane > svg,
  .leaflet-pane > canvas,
  .leaflet-zoom-box,
  .leaflet-image-layer,
  .leaflet-layer {
    left: auto;
    right: 0;
  }

  .leaflet-control-attribution.leaflet-control {
    display: none;
  }
}

</style>
