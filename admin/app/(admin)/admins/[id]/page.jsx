'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import adminService from '../../../../services/adminService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

function AdminDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  const isView = mode === 'view';

  const [form, setForm] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminService.getById(id)
      .then((res) => {
        const a = res.data;
        setForm({ username: a.username || '', email: a.email || '' });
      })
      .catch(() => toast.error('Failed to load admin.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await adminService.update(id, form);
      toast.success('Admin updated!');
      router.push('/admins');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={isView
          ? `View Admin (Admin ID: ${id})`
          : `Update Admin Account (Admin ID: ${id})`}
        subtitle={isView ? 'View existing admin'
          : 'Update existing admin'}
      />
      <FormCard>
        <FormSection title="Account Details">
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => setForm(p => ({
              ...p, email: e.target.value
            }))}
            disabled={isView} />
          <Input label="Username" value={form.username}
            onChange={(e) => setForm(p => ({
              ...p, username: e.target.value
            }))}
            disabled={isView} />
        </FormSection>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Admin
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/admins')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}

export default function AdminDetailPage() {
  return <Suspense><AdminDetail /></Suspense>;
}