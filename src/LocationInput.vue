<script>
import "leaflet/dist/leaflet.css";
import "./css/location.scss";
import {LMap, LTileLayer, LMarker} from "@vue-leaflet/vue-leaflet";
import {defineComponent, inject} from "vue";

export default defineComponent({
  name: 'LocationInput',
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

})
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
