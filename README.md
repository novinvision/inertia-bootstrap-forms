# InertiaJS Form Components for Laravel

If you're using InertiaJS in Laravel and are tired of creating repetitive forms and numerous components, we've created this package for ourselves and decided to share it with you. Everything is easily usable through Vue.

## Example:

```vue
<FormContainer v-model="formData">
    <div class="row g-3">
        <div class="col-12 col-sm-6">
            <FormLabel>Name</FormLabel>
            <TextInput name="name" />
        </div>
        <div class="col-12 col-sm-3">
            <FormLabel>Alias</FormLabel>
            <TextInput name="slug"/>
        </div>
        <div class="col-12 col-sm-3">
            <FormLabel>Status</FormLabel>
            <Select2Input name="status" :options="[
                { id: 'active', name: 'Active' },
                { id: 'disable', name: 'Disabled' },
                { id: 'draft', name: 'Draft' }
            ]"/>
        </div>
        <div class="col-12 col-sm-6">
            <FormLabel>New Image</FormLabel>
            <FileInput name="new_thumbnail" />
        </div>
        <div class="col-12">
            <FormLabel>Description</FormLabel>
            <EditorInput name="description" />
        </div>
        <div class="col-12 text-end">
            <SubmitButton />
        </div>
    </div>
</FormContainer>
```

This package simplifies form creation and management in your InertiaJS and Laravel applications, reducing redundancy and improving development efficiency.

If you need to upload files using the `FileInput` component in Laravel and manage them server-side, use our prepared package:

**novinvision/simple-uploader**

