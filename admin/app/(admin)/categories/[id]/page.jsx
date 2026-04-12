'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Textarea from '../../../../components/common/Textarea';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

function CategoryDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const [form, setForm] = useState({
    name: '',
    description: '',
    tag_bg_colour_code: '',
    tag_text_colour_code: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    categoryService.getById(id)
      .then((res) => setForm({
        name: res.data.name || '',
        description: res.data.description || '',
        tag_bg_colour_code: res.data.tag_bg_colour_code || '',
        tag_text_colour_code: res.data.tag_text_colour_code || '',
      }))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await categoryService.update(id, form);
      toast.success('Category updated!');
      router.push('/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={isView
          ? `View Eco Action Category (Category ID: ${id})`
          : `Update Eco Action Category (Category ID: ${id})`}
        subtitle={isView
          ? 'View existing eco action category'
          : 'Update existing category'}
      />
      <FormCard>
        <FormSection title="Category Information">
          <Input label="Category Name" value={form.name}
            onChange={(e) => setForm(p => ({
              ...p, name: e.target.value
            }))}
            required disabled={isView} />
          <div className="md:col-span-2">
            <Textarea label="Description" value={form.description}
              onChange={(e) => setForm(p => ({
                ...p, description: e.target.value
              }))}
              rows={4} required disabled={isView} />
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
                    required disabled={isView}
                  />
                  <Input
                    value={form.tag_bg_colour_code}
                    onChange={(e) => set('tag_bg_colour_code', e.target.value)}
                    placeholder="#E3F2FD"
                    hint="Hex colour e.g. #E3F2FD"
                    required disabled={isView}
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
                    required disabled={isView}
                  />
                  <Input
                    value={form.tag_text_colour_code}
                    onChange={(e) => set('tag_text_colour_code', e.target.value)}
                    placeholder="#1565C0"
                    hint="Hex colour e.g. #1565C0"
                    required disabled={isView}
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
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Category
            </Button>
          )}
          <Button variant="outline"
            onClick={() => router.push('/categories')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}

export default function CategoryDetailPage() {
  return <Suspense><CategoryDetail /></Suspense>;
}