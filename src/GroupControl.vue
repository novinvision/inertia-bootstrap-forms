<script>
import {computed, defineComponent, inject} from "vue";

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        let form = inject('form', {
            errors: {},
            getID(name) {
                return name;
            }
        });

        return {form};
    },
    provide() {
        return {
            group: computed(() => this)
        }
    },
    mounted() {
        this.$refs.groupEl?.parentNode?.parentNode.querySelectorAll('.form-control-group').forEach((item, index) => {
            if(item === this.$refs.groupEl){
                this.groupID = (index).toString();
            }
        })
    },
    methods: {
        setData(fieldName, value) {
            if (!this.form[this.name]) {
                this.form[this.name] = {};
            }
            if (this.groupID && this.form[this.name]?.length >= 0) {
                if(!this.form[this.name][this.groupID]){
                    this.form[this.name][this.groupID] = {};
                }
                this.form[this.name][this.groupID][fieldName] = value;
            }else{
                this.form[this.name][fieldName] = value;
            }

        },
        getData(fieldName) {
            if (this.groupID && this.form[this.name]?.length >= 0) {
                return this.form[this.name][this.groupID]?.[fieldName] || null;
            }else{
                return this.form[this.name][fieldName];
            }
        }
    },
    data() {
        return {
            groupID: '0',
        };
    }
})
</script>
<template>
    <div class="form-control-group" :data-group-id="groupID" ref="groupEl">
        <slot/>
    </div>
</template>
