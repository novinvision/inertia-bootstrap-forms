<script>
import {inject} from "vue";

export default {
    props: {
        modelValue: '',
        name: {
            type: String,
            required: true,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        endpoint: {
            type: String,
            default: '/upload',
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
        allFiles() {
            return this.files
        },
    },
    methods: {
        addFile(file) {
            let uploadedFile = {
                id: crypto.randomUUID(),
                percent: 0,
                error: 0,
                file: file,
            };

            if (this.multiple) {
                this.files.push(uploadedFile);
            } else {
                this.files = [uploadedFile];
            }

            this.uploadFile(uploadedFile);
            this.$refs.input.value = '';
        },
        calculatePercent(event, file) {
            if (event.lengthComputable) {
                this.files.find(item => item.id === file.id)['percent'] = Math.round((event.loaded / event.total) * 100);
            }
        },
        addFileToInputValue(file, res) {
            this.files.find(item => item.id === file.id).path = res.data.path;

            this.form[this.name] = this.multiple ? this.files.map(item => item.path) : this.files[0].path;
            this.$emit('update:modelValue', this.form[this.name]);
        },
        async uploadFile(file) {
            let _this = this;
            let formData = new FormData();
            formData.append('file', file.file);

            _this.files.find(item => item.id === file.id)['error'] = '';

            await axios.post(this.endpoint,
                formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: progressEvent => _this.calculatePercent(progressEvent, file)
                }
            ).then(function (res) {
                _this.addFileToInputValue(file, res)
            }).catch(function (err) {
                _this.files.find(item => item.id === file.id)['error'] = (err.response?.data?.message || err.message);
            });
        },
        async deleteFile(file) {
            this.files = this.files.filter(item => item.id !== file.id);
            await axios.delete(this.endpoint, {
                data: file.path
            });
        },
        fileSelected(e) {
            Array.from(e.target.files).forEach(file => this.addFile(file));
        }
    },
    data() {
        return {
            files: [],
        }
    }
}
</script>
<template>
    <div class="file-input-uploader">
        <input
            ref="input"
            :name="name"
            :class="{'is-invalid': form?.errors[name] !== undefined}"
            :disabled="form?.processing"
            type="file"
            :multiple="multiple"
            @change="fileSelected"
            class="form-control">
        <div class="file-input-uploader--list">
            <div :id="'file-'+file.id" class="file-input-uploader--list-item" v-for="file in allFiles">
                <div class="file-input-uploader--progress" v-if="file.percent && file.percent< 100">
                    <div :style="{width: file.percent + '%'}"></div>
                </div>
                <div>{{ file.file.name }}</div>
                <div class="file-input-uploader--list-error" v-if="file.error">{{ file.error }}</div>
                <div class="file-input-uploader--list-item--size" dir="ltr">{{ Math.round(file.file.size / 1024) }}Kb</div>
                <div class="file-input-uploader--list-item--actions">
                    <button @click="uploadFile(file)" type="button" class="file-input-uploader--list-item--btn" v-if="file.error">
                        <svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1,12A11,11,0,0,1,17.882,2.7l1.411-1.41A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707l1.128-1.128A8.994,8.994,0,0,0,3,12a1,1,0,0,1-2,0Zm21-1a1,1,0,0,0-1,1,9.01,9.01,0,0,1-9,9,8.9,8.9,0,0,1-4.42-1.166l1.127-1.127A1,1,0,0,0,8,17H4a1,1,0,0,0-1,1v4a1,1,0,0,0,.617.924A.987.987,0,0,0,4,23a1,1,0,0,0,.707-.293L6.118,21.3A10.891,10.891,0,0,0,12,23,11.013,11.013,0,0,0,23,12,1,1,0,0,0,22,11Z"/>
                        </svg>
                    </button>
                    <button @click="deleteFile(file)" type="button" class="file-input-uploader--list-item--btn" v-if="file.path || file.error">
                        <svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.file-input-uploader .file-input-uploader--list .file-input-uploader--list-item {
    background-color: var(--bs-secondary-bg);
    border-radius: var(--bs-border-radius);
    position: relative;
    display: flex;
    align-items: center;
    margin: 5px 0;
    padding: 5px 10px;
}

.file-input-uploader .file-input-uploader--list .file-input-uploader--list-item--size {
    margin-left: auto;
    font-size: 90%;
    padding: 0 5px;
    color: var(--bs-secondary-color);
}

.file-input-uploader .file-input-uploader--list-item--btn {
    display: inline-block;
    outline: none;
    border: 0;
    padding: 7px 2px;
}

.file-input-uploader .file-input-uploader--list-item--btn:not(:last-child){
    margin-right: 5px;
}

.file-input-uploader .file-input-uploader--list-item--btn > svg {
    height: 20px;
    width: 20px;
    vertical-align: middle;
}

.file-input-uploader .file-input-uploader--progress {
    position: absolute;
    top: 2px;
    left: 5px;
    right: 5px;
}

.file-input-uploader .file-input-uploader--progress > div {
    background-color: #de0021;
    height: 7px;
    width: 0;
    min-width: 1%;
    border-radius: var(--bs-border-radius)
}

.file-input-uploader .file-input-uploader--list-error {
    font-size: 90%;
    margin: 0 5px;
    color: var(--bs-danger, #de0021);
}
</style>
