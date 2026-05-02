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
  const [proof, setProof] = useState({
    required: false,
    type: 'photo',        // only 'photo' supported (camera only)
    bonus_xp: '',
    requirement: '',
  });

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

      // In handleSubmit, add these fields to payload before buildFormData:
      if (proof.required) {
        payload.proof_required = 'true';
        payload.proof_type = proof.type;
        payload.proof_bonus_xp = proof.bonus_xp;
        payload.proof_requirement = proof.requirement;
      } else {
        payload.proof_required = 'false';
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

        {/* Provide Proof */}
        <FormSection title="Provide Proof">
          <div className="md:col-span-2 flex flex-col gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={proof.required}
                onChange={(e) => setProof(p => ({ ...p, required: e.target.checked }))}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Require proof for this action
              </span>
            </label>

            {proof.required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proof Type — photo only */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Proof Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" checked readOnly className="w-4 h-4 accent-green-500" />
                    <span className="text-sm text-gray-600">Photo (camera only)</span>
                  </div>
                </div>

                <Input
                  label="Bonus XP Points"
                  type="number"
                  value={proof.bonus_xp}
                  onChange={(e) => setProof(p => ({ ...p, bonus_xp: e.target.value }))}
                  placeholder="e.g. 60"
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Proof Instructions"
                    value={proof.requirement}
                    onChange={(e) => setProof(p => ({ ...p, requirement: e.target.value }))}
                    placeholder="e.g. Photo inside the public transport"
                    rows={2}
                  />
                </div>
              </div>
            )}
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
