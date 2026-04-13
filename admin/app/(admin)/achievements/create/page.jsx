'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildFormData } from '../../../../utils/buildFormData';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import ImageUpload from '../../../../components/common/ImageUpload';

const ACHIEVEMENT_TYPES = [
  { value: 'log', label: 'Log X actions in Y category' },
  { value: 'reach_level', label: 'Reach level X' },
  { value: 'streak', label: 'Maintain streak for X days' },
  { value: 'total_xp', label: 'Earn X total XP' },
];

export default function CreateAchievementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', type: '', target_value: '',
    bonus_xp: '', badge_name: '', action_category_id: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Achievement name is required.';
    if (!form.type) e.type = 'Type is required.';
    if (!form.target_value) e.target_value = 'Target value is required.';
    if (!form.bonus_xp) e.bonus_xp = 'Bonus XP is required.';
    if (!form.badge_name) e.badge_name = 'Badge name is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const formData = buildFormData({
          ...form,
          target_value: parseInt(form.target_value),
          bonus_xp: parseInt(form.bonus_xp),
          action_category_id: form.action_category_id || '',
        }, imageFile);

      await achievementService.create(formData);
      toast.success('Achievement created!');
      router.push('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsLoading(false); }
  };

  const catOptions = categories.map(c => ({
    value: String(c.id), label: c.name
  }));

  const needsCategory = form.type === 'log';

  return (
    <div>
      <PageHeader
        title="Create Achievements & Badges"
        subtitle="Add new achievement badge for users to unlock"
      />
      <FormCard>
        <FormSection title="Achievement Type">
          <div className="md:col-span-2">
            <Select label="Achievement Type" value={form.type}
              onChange={(e) => set('type', e.target.value)}
              options={ACHIEVEMENT_TYPES}
              placeholder="Select Achievement Type"
              required error={errors.type} />
          </div>
          {needsCategory && (
            <Select label="Action Category (if applicable)"
              value={form.action_category_id}
              onChange={(e) => set('action_category_id', e.target.value)}
              options={catOptions}
              placeholder="Select category" />
          )}
        </FormSection>

        <FormSection title="Unlock Requirements">
          <Input label="Achievement Name" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Bronze Eco Mobility Master"
            required error={errors.name} />
          <Input label="Badge Name" value={form.badge_name}
            onChange={(e) => set('badge_name', e.target.value)}
            placeholder="e.g. Silver Eco Mobility Master"
            required error={errors.badge_name} />
          <Input label="Target Value" type="number"
            value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)}
            placeholder="e.g. 10" required error={errors.target_value}
            hint="Minimum 1" />
          <Input label="Bonus XP" type="number"
            value={form.bonus_xp}
            onChange={(e) => set('bonus_xp', e.target.value)}
            placeholder="e.g. 200" required error={errors.bonus_xp} />
          <div className="md:col-span-2">
            <ImageUpload
              label="Badge Graphic"
              preview={imagePreview}
              onChange={(f) => {
                setImageFile(f);
                setImagePreview(URL.createObjectURL(f));
              }}
              onRemove={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              hint="PNG, JPG (max. 5MB)"
            />
          </div>
        </FormSection>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Achievement
          </Button>
          <Button variant="outline"
            onClick={() => router.push('/achievements')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}