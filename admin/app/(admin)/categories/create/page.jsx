'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import categoryService from '../../../../services/categoryService';
import { buildFormData } from '../../../../utils/buildFormData';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Textarea from '../../../../components/common/Textarea';
import ImageUpload from '../../../../components/common/ImageUpload';
import Button from '../../../../components/common/Button';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', description: '',
    tag_bg_colour_code: '', tag_text_colour_code: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Category name is required.';
    if (!form.description) e.description = 'Description is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const formData = buildFormData(form, imageFile);
      await categoryService.create(formData);
      toast.success('Category created!');
      router.push('/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Create Eco Action Category"
        subtitle="Add a new category for eco-friendly actions"
      />
      <FormCard>
        <FormSection title="Category Information">
          <Input label="Category Name" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Water Conservation"
            required error={errors.name} />
          <div className="md:col-span-2">
            <Textarea label="Description" value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe this category..."
              required rows={3} error={errors.description} />
          </div>

          {/* Category Image */}
          <div className="md:col-span-2">
            <ImageUpload
              label="Category Icon"
              preview={imagePreview}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              hint="PNG, JPG (max. 5MB)"
            />
          </div>
        </FormSection>

        {/* Tag Colours */}
        <FormSection title="Tag Colours (Optional)">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-gray-300
                shrink-0 cursor-pointer"
              style={{
                backgroundColor: form.tag_bg_colour_code || '#ffffff'
              }}
              onClick={() =>
                document.getElementById('bg_picker').click()
              }
            />
            <input id="bg_picker" type="color"
              value={form.tag_bg_colour_code || '#ffffff'}
              onChange={(e) => set('tag_bg_colour_code', e.target.value)}
              className="hidden" />
            <Input label="Tag Background Colour"
              value={form.tag_bg_colour_code}
              onChange={(e) => set('tag_bg_colour_code', e.target.value)}
              placeholder="#E3F2FD" />
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-gray-300
                shrink-0 cursor-pointer"
              style={{
                backgroundColor: form.tag_text_colour_code || '#000000'
              }}
              onClick={() =>
                document.getElementById('text_picker').click()
              }
            />
            <input id="text_picker" type="color"
              value={form.tag_text_colour_code || '#000000'}
              onChange={(e) => set('tag_text_colour_code', e.target.value)}
              className="hidden" />
            <Input label="Tag Text Colour"
              value={form.tag_text_colour_code}
              onChange={(e) => set('tag_text_colour_code', e.target.value)}
              placeholder="#1565C0" />
          </div>
          {form.tag_bg_colour_code && (
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <span
                className="inline-flex px-3 py-1 rounded-full
                  text-xs font-semibold"
                style={{
                  backgroundColor: form.tag_bg_colour_code,
                  color: form.tag_text_colour_code || '#000'
                }}
              >
                {form.name || 'Category Name'}
              </span>
            </div>
          )}
        </FormSection>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Category
          </Button>
          <Button variant="outline"
            onClick={() => router.push('/categories')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}