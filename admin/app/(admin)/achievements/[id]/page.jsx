'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const ACHIEVEMENT_TYPES = [
  { value: 'log', label: 'Log X actions in Y category' },
  { value: 'reach_level', label: 'Reach level X' },
  { value: 'streak', label: 'Maintain streak for X days' },
  { value: 'total_xp', label: 'Earn X total XP' },
];

function AchievementDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', type: '', target_value: '',
    bonus_xp: '', badge_name: '', action_category_id: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      achievementService.getById(id),
      categoryService.getAll(),
    ]).then(([achRes, catRes]) => {
      const a = achRes.data;
      setCategories(catRes.data);
      setForm({
        name: a.name || '',
        type: a.type || '',
        target_value: String(a.target_value || ''),
        bonus_xp: String(a.bonus_xp || ''),
        badge_name: a.badge_name || '',
        action_category_id: String(a.action_category_id || ''),
      });
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await achievementService.update(id, {
        ...form,
        target_value: parseInt(form.target_value),
        bonus_xp: parseInt(form.bonus_xp),
        action_category_id: form.action_category_id || null,
      });
      toast.success('Achievement updated!');
      router.push('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const catOptions = categories.map(c => ({
    value: String(c.id), label: c.name
  }));

  return (
    <div>
      <PageHeader
        title={isView
          ? `View Achievement (ID: ${id})`
          : `Update Achievement (ID: ${id})`}
        subtitle={isView ? 'View existing achievement'
          : 'Update existing achievement'}
      />
      <FormCard>
        <FormSection title="Achievement Type">
          <div className="md:col-span-2">
            <Select label="Achievement Type" value={form.type}
              onChange={(e) => set('type', e.target.value)}
              options={ACHIEVEMENT_TYPES}
              disabled={isView} />
          </div>
          {form.type === 'log' && (
            <Select label="Action Category"
              value={form.action_category_id}
              onChange={(e) => set('action_category_id', e.target.value)}
              options={catOptions}
              disabled={isView} />
          )}
        </FormSection>

        <FormSection title="Unlock Requirements">
          <Input label="Achievement Name" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            disabled={isView} />
          <Input label="Badge Name" value={form.badge_name}
            onChange={(e) => set('badge_name', e.target.value)}
            disabled={isView} />
          <Input label="Target Value" type="number"
            value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)}
            disabled={isView} />
          <Input label="Bonus XP" type="number"
            value={form.bonus_xp}
            onChange={(e) => set('bonus_xp', e.target.value)}
            disabled={isView} />
        </FormSection>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Achievement
            </Button>
          )}
          <Button variant="outline"
            onClick={() => router.push('/achievements')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}

export default function AchievementDetailPage() {
  return <Suspense><AchievementDetail /></Suspense>;
}