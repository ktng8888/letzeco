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
  const [form, setForm] = useState({ name: '', description: '' });
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