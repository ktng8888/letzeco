'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import userService from '../../../../services/userService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  const isView = mode === 'view';

  const [form, setForm] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    userService.getById(id)
      .then((res) => {
        const u = res.data;
        setForm({ username: u.username || '', email: u.email || '' });
      })
      .catch(() => toast.error('Failed to load user.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await userService.update(id, form);
      toast.success('User updated!');
      router.push('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const title = isView
    ? `View User (User ID: ${id})`
    : `Update User (User ID: ${id})`;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={isView ? 'View user details' : 'Update existing user'}
      />
      <FormCard>
        <FormSection title="Account Details">
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
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
              Update User
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/users')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}