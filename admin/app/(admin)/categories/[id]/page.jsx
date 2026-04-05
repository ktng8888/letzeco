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

  const [form, setForm] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    categoryService.getById(id)
      .then((res) => setForm({
        name: res.data.name || '',
        description: res.data.description || ''
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