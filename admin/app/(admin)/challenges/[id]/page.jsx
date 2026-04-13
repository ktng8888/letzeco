'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { buildFormData } from '../../../../utils/buildFormData';
import toast from 'react-hot-toast';
import challengeService from '../../../../services/challengeService';
import actionService from '../../../../services/actionService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Textarea from '../../../../components/common/Textarea';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ImageUpload from '../../../../components/common/ImageUpload';

function ChallengeDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';

  const [actions, setActions] = useState([]);
  const [eligibleActions, setEligibleActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'solo', start_date: '', end_date: '',
    about: '', target_type: 'count', target_value: '',
    status: 'active',
    tag_bg_colour_code: '', tag_text_colour_code: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    Promise.all([
      challengeService.getById(id),
      challengeService.getEligibleActions(id),
      actionService.getAll(),
    ]).then(([chalRes, eligRes, actRes]) => {
      const c = chalRes.data;
      setForm({
        name: c.name || '',
        type: c.type || 'solo',
        start_date: c.start_date?.split('T')[0] || '',
        end_date: c.end_date?.split('T')[0] || '',
        about: c.about || '',
        target_type: c.target_type || 'count',
        target_value: c.target_value || '',
        status: c.status || 'active',
        tag_bg_colour_code: c.tag_bg_colour_code || '',
        tag_text_colour_code: c.tag_text_colour_code || '',
      });

      setCurrentImage(c.image || null);

      setEligibleActions(eligRes.data || []);
      setActions(actRes.data);
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleAddEligibleAction = async () => {
    if (!selectedAction) return;
    try {
      await challengeService.addEligibleAction(id, selectedAction);
      const res = await challengeService.getEligibleActions(id);
      setEligibleActions(res.data);
      setSelectedAction('');
      toast.success('Action added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const handleRemoveEligible = async (eligibleActionId) => {
    try {
      await challengeService.removeEligibleAction(id, eligibleActionId);
      setEligibleActions(prev =>
        prev.filter(a => a.id !== eligibleActionId)
      );
      toast.success('Action removed.');
    } catch (err) {
      toast.error('Failed to remove.');
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImage(null);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const formData = buildFormData(form, imageFile);
      await categoryService.update(id, formData);
      toast.success('Challenge updated!');
      router.push('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const actionOptions = actions.map(a => ({
    value: String(a.id),
    label: `${a.name} (${a.category_name})`
  }));

  return (
    <div>
      <PageHeader
        title={isView
          ? `View Challenge (ID: ${id})`
          : `Update Challenge (ID: ${id})`}
        subtitle={isView
          ? 'View existing challenge'
          : 'Update existing challenge'}
      />
      <FormCard>
        <FormSection title="Challenge Details">
          <div className="md:col-span-2">
            <Input label="Challenge Name" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              disabled={isView} />
          </div>
          <Select label="Type" value={form.type}
            onChange={(e) => set('type', e.target.value)}
            options={[
              { value: 'solo', label: 'Solo' },
              { value: 'team', label: 'Team' },
            ]} disabled={isView} />
          <Select label="Status" value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]} disabled={isView} />
          <Input label="Start Date" type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            disabled={isView} />
          <Input label="End Date" type="date"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
            disabled={isView} />
          <div className="md:col-span-2">
            <Textarea label="About" value={form.about}
              onChange={(e) => set('about', e.target.value)}
              rows={3} disabled={isView} />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              label="Challenge Image (Optional)"
              value={currentImage}
              preview={imagePreview}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              disabled={isView}
            />
          </div>  
        </FormSection>

        <FormSection title="Challenge Goal">
          <Select label="Target Type" value={form.target_type}
            onChange={(e) => set('target_type', e.target.value)}
            options={[
              { value: 'count', label: 'Actions Count' },
              { value: 'co2_kg', label: 'kg CO₂' },
              { value: 'litre', label: 'Litres Water' },
              { value: 'kwh', label: 'kWh Energy' },
            ]} disabled={isView} />
          <Input label="Target Value" type="number"
            value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)}
            disabled={isView} />
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

        {/* Eligible Actions */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">
              Eligible Actions
            </h3>
            {!isView && (
              <div className="flex gap-3">
                <Select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  options={actionOptions}
                  placeholder="Select action..."
                  className="w-64"
                />
                <Button onClick={handleAddEligibleAction}>
                  <Plus className="w-4 h-4" />
                  + Add Eligible Actions
                </Button>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold
                    text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold
                    text-gray-600">Category</th>
                  {!isView && (
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-20">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {eligibleActions.length === 0 ? (
                  <tr>
                    <td colSpan={isView ? 2 : 3}
                      className="px-4 py-8 text-center text-gray-400">
                      No Eligible Actions
                    </td>
                  </tr>
                ) : (
                  eligibleActions.map((action) => (
                    <tr key={action.id}
                      className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {action.action_name || action.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {action.category_name}
                      </td>
                      {!isView && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveEligible(action.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100
                              text-red-500 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Challenge
            </Button>
          )}
          <Button variant="outline"
            onClick={() => router.push('/challenges')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}

export default function ChallengeDetailPage() {
  return <Suspense><ChallengeDetail /></Suspense>;
}