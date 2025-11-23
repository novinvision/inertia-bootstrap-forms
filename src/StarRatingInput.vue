<script>
import {defineComponent, inject} from 'vue';

export default defineComponent({
    emits: ['update:modelValue'],
    props: {
        name: {
            type: String,
            default: null,
        },
        modelValue: {
            type: Number,
            default: 0
        },
        value: {
            type: Number,
            default: 0
        },
        maxStars: {
            type: Number,
            default: 5
        },
        precision: {
            type: Number,
            default: 2
        },
        showValue: {
            type: Boolean,
            default: true
        },
        readonly: {
            type: Boolean,
            default: false
        },
    },
    setup(props) {
        let form = inject('form');
        if (form === undefined) {
            form = {
                errors: {},
                getID(name) {
                }
            };
        }
        return {form};
    },
    computed: {
        displayRating() {
            return (this.hoveredRating ?? (this.modelValue ?? (this.name ? this.form[this.name] : null)) ?? this.value).toFixed(1);
        }
    },
    methods: {
        getStarFill(star) {
            const rating = this.hoveredRating ?? (this.modelValue || this.form[this.name]);
            const fullStars = Math.floor(rating);
            const remainder = rating - fullStars;

            if (star <= fullStars) return 100;
            if (star === fullStars + 1) return remainder * 100;
            return 0;
        },
        setHover(event) {
            if (this.readonly) return;

            const rect = this.$refs.ratingContainer.getBoundingClientRect();
            let offsetX = event.clientX - rect.left;

            if (this.isRTL) {
                offsetX = rect.width - (event.clientX - rect.left); // اصلاح برای حالت راست‌چین
            }

            const starWidth = rect.width / this.maxStars;
            let newRating = Math.round((offsetX / starWidth) * this.precision) / this.precision;
            newRating = Math.min(newRating, this.maxStars);

            this.hoveredRating = newRating;
        },
        updateRating() {
            if (this.readonly) return;

            if (this.name) this.form[this.name] = this.hoveredRating.toFixed(1);
            this.$emit('update:modelValue', this.hoveredRating.toFixed(1));
        },
        resetHover() {
            if (this.readonly) return;

            this.hoveredRating = null;
        }
    },
    mounted() {
        if (this.$refs.ratingContainer) {
            this.isRTL = getComputedStyle(this.$refs.ratingContainer).direction === 'rtl';
        }
    },
    data() {
        return {
            hoveredRating: parseFloat(this.modelValue || ((this.name ? this.form[this.name] : null) ?? this.value)),
            isRTL: false,
        }
    }
})
</script>
<template>
    <div class="star-rating">
        <div class="star-rating-container" ref="ratingContainer" @mouseleave="resetHover" @mousemove="setHover" @click="updateRating">
            <div v-for="star in maxStars" :key="star" class="star-wrapper">
                <div class="star-bg">★</div>
                <span class="star-overlay" :style="{ width: getStarFill(star) + '%' }">★</span>
            </div>
        </div>
        <div class="rating-value fanum" v-if="showValue && displayRating> 0">{{ displayRating }}</div>
    </div>
</template>

<style>
.star-rating,
.star-rating-container {
    display: flex;
    align-items: center;
}

.star-rating {
    gap: 8px;
}

.star-rating .star-rating-container {
    cursor: pointer;
    position: relative;
}

.star-rating .star-wrapper {
    position: relative;
    font-size: 28px;
    line-height: 1;
    display: inline-block;
}

.star-rating .star-bg {
    color: #ccc;
}

.star-rating .star-overlay {
    position: absolute;
    top: 0;
    left: 0; /* 👈 اصلاح برای RTL */
    overflow: hidden;
    color: gold;
    white-space: nowrap;
    width: 0;
    transition: width 0.2s ease-in-out;
}

.star-rating .rating-value {
    font-size: 18px;
    color: #444;
    margin-right: 8px;
}
</style>
