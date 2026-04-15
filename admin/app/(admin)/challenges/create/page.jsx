'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { buildFormData } from '../../../../utils/buildFormData';
import toast from 'react-hot-toast';
import challengeService from '../../../../services/challengeService';
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

export default function CreateChallengePage() {
  const router = useRouter();
  const [actions, setActions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eligibleActions, setEligibleActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'solo', start_date: '', end_date: '',
    about: '', target_type: 'count', target_value: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    Promise.all([actionService.getAll(), categoryService.getAll()])
      .then(([actRes, catRes]) => {
        setActions(actRes.data);
        setCategories(catRes.data);
      });
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleAddEligibleAction = () => {
    if (!selectedAction) return;
    const action = actions.find(a => String(a.id) === selectedAction);
    if (!action) return;
    if (eligibleActions.find(a => a.id === action.id)) {
      toast.error('Action already added.');
      return;
    }
    setEligibleActions(prev => [...prev, action]);
    setSelectedAction('');
  };

  const handleRemoveEligible = (id) => {
    setEligibleActions(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.name) e.name = 'Name is required.';
    if (!form.start_date) e.start_date = 'Start date required.';
    if (!form.end_date) e.end_date = 'End date required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const formData = buildFormData(form, imageFile);

      // Create challenge
      const res = await challengeService.create(formData);
      const challengeId = res.data.id;

      // Add eligible actions
      for (const action of eligibleActions) {
        await challengeService.addEligibleAction(challengeId, action.id);
      }

      toast.success('Challenge created!');
      router.push('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsLoading(false); }
  };

  const actionOptions = actions.map(a => ({
    value: String(a.id),
    label: `${a.name} (${a.category_name})`
  }));

  return (
    <div>
      <PageHeader
        title="Create Challenge"
        subtitle="Add a new challenge users can participate"
      />
      <FormCard>
        {/* Challenge Details */}
        <FormSection title="Challenge Details">
          <div className="md:col-span-2">
            <Input label="Challenge Name" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Weekly Zero Waste Hero"
              required error={errors.name} />
          </div>
          <Select label="Type" value={form.type}
            onChange={(e) => set('type', e.target.value)}
            options={[
              { value: 'solo', label: 'Solo' },
              { value: 'team', label: 'Team' },
            ]} />
          <Select label="Status" value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]} />
          <Input label="Start Date" type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            required error={errors.start_date} />
          <Input label="End Date" type="date"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
            required error={errors.end_date} />
          <div className="md:col-span-2">
            <Textarea label="About" value={form.about}
              onChange={(e) => set('about', e.target.value)}
              placeholder="Describe the challenge..."
              rows={3} />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              label="Challenge Image (Optional)"
              preview={imagePreview}
              onChange={(f) => {
                setImageFile(f);
                setImagePreview(URL.createObjectURL(f));
              }}
              onRemove={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />
          </div>
        </FormSection>

        {/* Challenge Goal */}
        <FormSection title="Challenge Goal">
          <Select label="Target Type" value={form.target_type}
            onChange={(e) => set('target_type', e.target.value)}
            options={[
              { value: 'count', label: 'Actions Count' },
              { value: 'co2_kg', label: 'kg CO₂' },
              { value: 'litre', label: 'Litres Water' },
              { value: 'kwh', label: 'kWh Energy' },
            ]} />
          <Input label="Target Value" type="number"
            value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)}
            placeholder="e.g. 10" />
        </FormSection>

        {/* Eligible Actions */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">
              Eligible Actions
            </h3>
          </div>

          {/* Add Action */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                options={actionOptions}
                placeholder="Select action to add..."
              />
            </div>
            <Button onClick={handleAddEligibleAction} variant="primary">
              <Plus className="w-4 h-4" />
              Add Eligible Actions
            </Button>
          </div>

          {/* Eligible Actions Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold
                    text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold
                    text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold
                    text-gray-600 w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleActions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center
                      text-gray-400 text-sm">
                      No Eligible Actions
                    </td>
                  </tr>
                ) : (
                  eligibleActions.map((action) => (
                    <tr key={action.id}
                      className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {action.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {action.category_name}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveEligible(action.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100
                            text-red-500 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Challenge
          </Button>
          <Button variant="outline"
            onClick={() => router.push('/challenges')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}