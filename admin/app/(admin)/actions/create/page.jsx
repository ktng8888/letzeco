'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildFormData } from '../../../../utils/buildFormData';
import { minutesToTimeLimit } from '../../../../utils/timeLimit';
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
import ImageUpload from '../../../../components/common/ImageUpload';

export default function CreateActionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', action_category_id: '', time_limit: '',
    description: '', importance: '', xp_reward: 10,
    co2_saved: '', litre_saved: '', kwh_saved: '',
    calc_info: '', source: '',
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

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Action name is required.';
    if (!form.action_category_id) e.action_category_id = 'Category is required.';
    if (!form.description) e.description = 'Description is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      // Convert time to interval format if provided
  const payload = { ...form };
      // Convert time
      if (payload.time_limit) {
        payload.time_limit = minutesToTimeLimit(payload.time_limit);
      }
      const formData = buildFormData(payload, imageFile);
      await actionService.create(formData);
      toast.success('Action created!');
      router.push('/actions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsLoading(false); }
  };

  const catOptions = categories.map(c => ({
    value: String(c.id), label: c.name
  }));

  return (
    <div>
      <PageHeader
        title="Create Eco Action"
        subtitle="Add a new eco-friendly action users can log"
      />
      <FormCard>
        {/* Action Details */}
        <FormSection title="Action Details">
          <Input label="Action Name" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Take a 5-minute shower"
            required error={errors.name} />
          <Select label="Category" value={form.action_category_id}
            onChange={(e) => set('action_category_id', e.target.value)}
            options={catOptions} placeholder="Select category"
            required error={errors.action_category_id} />
          <Input label="Time Provided (minutes)" type="number"
            value={form.time_limit}
            onChange={(e) => set('time_limit', e.target.value)}
            placeholder="e.g. 5" hint="Leave empty for no time limit" />
          <div className="md:col-span-2">
            <Textarea label="Description" value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe this eco action..."
              required rows={3} error={errors.description} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Why This Matters" value={form.importance}
              onChange={(e) => set('importance', e.target.value)}
              placeholder="Explain why this action matters..."
              rows={3} />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              label="Action Icon (Optional)"
              preview={imagePreview}
              onChange={handleImageChange}
              onRemove={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />
          </div>
        </FormSection>

        {/* Rewards */}
        <FormSection title="Rewards">
          <Input label="XP Reward" type="number"
            value={form.xp_reward}
            onChange={(e) => set('xp_reward', e.target.value)}
            required />
        </FormSection>

        {/* Environmental Impact */}
        <FormSection title="Environmental Impact Metrics">
          <Input label="CO₂ Saved (kg)" type="number"
            value={form.co2_saved}
            onChange={(e) => set('co2_saved', e.target.value)}
            placeholder="e.g. 1.05" />
          <Input label="Water Saved (litres)" type="number"
            value={form.litre_saved}
            onChange={(e) => set('litre_saved', e.target.value)}
            placeholder="e.g. 47.3" />
          <Input label="Energy Saved (kWh)" type="number"
            value={form.kwh_saved}
            onChange={(e) => set('kwh_saved', e.target.value)}
            placeholder="e.g. 2.5" />
          <div className="md:col-span-2">
            <Textarea label="How is this calculated"
              value={form.calc_info}
              onChange={(e) => set('calc_info', e.target.value)}
              placeholder="Explain the calculation method..."
              rows={2} />
          </div>
        </FormSection>

        {/* Source */}
        <FormSection title="Source">
          <div className="md:col-span-2">
            <Input label="Source URL" value={form.source}
              onChange={(e) => set('source', e.target.value)}
              placeholder="https://..." />
          </div>
        </FormSection>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Action
          </Button>
          <Button variant="outline"
            onClick={() => router.push('/actions')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
