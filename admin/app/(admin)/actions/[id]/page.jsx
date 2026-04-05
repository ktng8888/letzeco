'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import actionService from '../../../../services/actionService';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Textarea from '../../../../components/common/Textarea';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

function ActionDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', action_category_id: '', time_limit: '',
    description: '', importance: '', xp_reward: 10,
    co2_saved: '', litre_saved: '', kwh_saved: '',
    calc_info: '', source: '',
    tag_bg_colour_code: '', tag_text_colour_code: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      actionService.getById(id),
      categoryService.getAll(),
    ]).then(([actRes, catRes]) => {
      const a = actRes.data;
      setCategories(catRes.data);
      setForm({
        name: a.name || '',
        action_category_id: String(a.action_category_id || ''),
        time_limit: extractMinutes(a.time_limit),
        description: a.description || '',
        importance: a.importance || '',
        xp_reward: a.xp_reward || 10,
        co2_saved: a.co2_saved || '',
        litre_saved: a.litre_saved || '',
        kwh_saved: a.kwh_saved || '',
        calc_info: a.calc_info || '',
        source: a.source || '',
        tag_bg_colour_code: a.tag_bg_colour_code || '',
        tag_text_colour_code: a.tag_text_colour_code || '',
      });
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key, val) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        time_limit: form.time_limit
          ? `00:${String(form.time_limit).padStart(2, '0')}:00`
          : null,
      };
      await actionService.update(id, payload);
      toast.success('Action updated!');
      router.push('/actions');
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
          ? `View Eco Action (Action ID: ${id})`
          : `Update Eco Action (Action ID: ${id})`}
        subtitle={isView ? 'View existing eco action'
          : 'Update existing eco action'}
      />
      <FormCard>
        <FormSection title="Action Details">
          <Input label="Action Name" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            disabled={isView} />
          <Select label="Category" value={form.action_category_id}
            onChange={(e) => set('action_category_id', e.target.value)}
            options={catOptions} disabled={isView} />
          <Input label="Time Provided (minutes)" type="number"
            value={form.time_limit}
            onChange={(e) => set('time_limit', e.target.value)}
            disabled={isView} />
          <div className="md:col-span-2">
            <Textarea label="Description" value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3} disabled={isView} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Why This Matters" value={form.importance}
              onChange={(e) => set('importance', e.target.value)}
              rows={3} disabled={isView} />
          </div>
        </FormSection>

        <FormSection title="Tag Colours">
          <Input label="Tag Background Colour"
            value={form.tag_bg_colour_code}
            onChange={(e) => set('tag_bg_colour_code', e.target.value)}
            disabled={isView} />
          <Input label="Tag Text Colour"
            value={form.tag_text_colour_code}
            onChange={(e) => set('tag_text_colour_code', e.target.value)}
            disabled={isView} />
        </FormSection>

        <FormSection title="Rewards">
          <Input label="XP Reward" type="number"
            value={form.xp_reward}
            onChange={(e) => set('xp_reward', e.target.value)}
            disabled={isView} />
        </FormSection>

        <FormSection title="Environmental Impact Metrics">
          <Input label="CO₂ Saved (kg)" type="number"
            value={form.co2_saved}
            onChange={(e) => set('co2_saved', e.target.value)}
            disabled={isView} />
          <Input label="Water Saved (litres)" type="number"
            value={form.litre_saved}
            onChange={(e) => set('litre_saved', e.target.value)}
            disabled={isView} />
          <Input label="Energy Saved (kWh)" type="number"
            value={form.kwh_saved}
            onChange={(e) => set('kwh_saved', e.target.value)}
            disabled={isView} />
          <div className="md:col-span-2">
            <Textarea label="How is this calculated"
              value={form.calc_info}
              onChange={(e) => set('calc_info', e.target.value)}
              rows={2} disabled={isView} />
          </div>
        </FormSection>

        <FormSection title="Source">
          <div className="md:col-span-2">
            <Input label="Source URL" value={form.source}
              onChange={(e) => set('source', e.target.value)}
              disabled={isView} />
          </div>
        </FormSection>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Action
            </Button>
          )}
          <Button variant="outline"
            onClick={() => router.push('/actions')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}

function extractMinutes(timeLimit) {
  if (!timeLimit) return '';
  if (typeof timeLimit === 'object') {
    return String((timeLimit.hours || 0) * 60 + (timeLimit.minutes || 0));
  }
  if (typeof timeLimit === 'string') {
    const [h, m] = timeLimit.split(':').map(Number);
    return String(h * 60 + m);
  }
  return '';
}

export default function ActionDetailPage() {
  return <Suspense><ActionDetail /></Suspense>;
}