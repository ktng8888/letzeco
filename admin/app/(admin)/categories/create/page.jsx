'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Textarea from '../../../../components/common/Textarea';
import Button from '../../../../components/common/Button';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    tag_bg_colour_code: '',
    tag_text_colour_code: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Category name is required.';
    if (!form.description) e.description = 'Description is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      await categoryService.create(form);
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
              required rows={4} error={errors.description} />
          </div>
        </FormSection>

        {/* Tag Colours */}
        <FormSection title="Tag Colours (Optional)">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Background Colour */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tag Background Colour
                </label>
                <div className="flex items-center gap-3">
                  {/* Colour preview box */}
                  <div
                    className="w-12 h-10 rounded-lg border border-gray-300
                      shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: form.tag_bg_colour_code || '#ffffff'
                    }}
                    onClick={() =>
                      document.getElementById('bg_colour_picker').click()
                    }
                  />
                  <input
                    id="bg_colour_picker"
                    type="color"
                    value={form.tag_bg_colour_code || '#ffffff'}
                    onChange={(e) => set('tag_bg_colour_code', e.target.value)}
                    className="hidden"
                  />
                  <Input
                    value={form.tag_bg_colour_code}
                    onChange={(e) => set('tag_bg_colour_code', e.target.value)}
                    placeholder="#E3F2FD"
                    hint="Hex colour e.g. #E3F2FD"
                  />
                </div>
              </div>

              {/* Text Colour */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tag Text Colour
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-10 rounded-lg border border-gray-300
                      shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: form.tag_text_colour_code || '#000000'
                    }}
                    onClick={() =>
                      document.getElementById('text_colour_picker').click()
                    }
                  />
                  <input
                    id="text_colour_picker"
                    type="color"
                    value={form.tag_text_colour_code || '#000000'}
                    onChange={(e) => set('tag_text_colour_code', e.target.value)}
                    className="hidden"
                  />
                  <Input
                    value={form.tag_text_colour_code}
                    onChange={(e) => set('tag_text_colour_code', e.target.value)}
                    placeholder="#1565C0"
                    hint="Hex colour e.g. #1565C0"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {form.tag_bg_colour_code && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-xs
                    font-semibold"
                  style={{
                    backgroundColor: form.tag_bg_colour_code,
                    color: form.tag_text_colour_code || '#000000'
                  }}
                >
                  {form.name || 'Category Name'}
                </span>
              </div>
            )}
          </div>
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