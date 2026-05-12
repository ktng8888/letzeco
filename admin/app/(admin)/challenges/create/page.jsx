'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import ImageUpload from '../../../../components/common/ImageUpload';

export default function CreateChallengePage() {
  const router = useRouter();
  const [actions, setActions]                   = useState([]);
  const [eligibleActions, setEligibleActions]   = useState([]);
  const [selectedAction, setSelectedAction]     = useState('');
  const [form, setForm] = useState({
    name: '', type: 'solo', start_date: '', end_date: '',
    about: '', target_type: 'count', target_value: '',
    unit: '', 
    status: 'active',
  });
  const [errors, setErrors]         = useState({});
  const [isLoading, setIsLoading]   = useState(false);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Completion reward state
  const [completionReward, setCompletionReward] = useState({
    xp_reward: '', badge_name: '', badge_file: null, badge_preview: null,
  });

  // ── Ranking reward tiers state
  const [rankingRewards, setRankingRewards] = useState([
    { top_value: '', xp_reward: '', badge_name: '', badge_file: null, badge_preview: null }
  ]);

  useEffect(() => {
    actionService.getAll().then(res => setActions(res.data));
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  // ── Completion reward helpers
  const setCompletionField = (key, val) =>
    setCompletionReward(prev => ({ ...prev, [key]: val }));

  const handleCompletionBadgeChange = (file) => {
    setCompletionReward(prev => ({
      ...prev,
      badge_file:    file,
      badge_preview: URL.createObjectURL(file),
    }));
  };

  // ── Ranking reward helpers
  const addRankingTier = () =>
    setRankingRewards(prev => [
      ...prev,
      { top_value: '', xp_reward: '', badge_name: '', badge_file: null, badge_preview: null }
    ]);

  const removeRankingTier = (i) =>
    setRankingRewards(prev => prev.filter((_, idx) => idx !== i));

  const setRankingField = (i, key, val) =>
    setRankingRewards(prev =>
      prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r)
    );

  const handleRankingBadgeChange = (i, file) => {
    setRankingRewards(prev =>
      prev.map((r, idx) =>
        idx === i
          ? { ...r, badge_file: file, badge_preview: URL.createObjectURL(file) }
          : r
      )
    );
  };

  // ── Eligible action helpers
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

  const handleRemoveEligible = (id) =>
    setEligibleActions(prev => prev.filter(a => a.id !== id));

  const handleSubmit = async () => {
    const e = {};
    if (!form.name)       e.name       = 'Name is required.';
    if (!form.start_date) e.start_date = 'Start date required.';
    if (!form.end_date)   e.end_date   = 'End date required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      // 1. Create the challenge
      const res         = await challengeService.create(buildFormData(form, imageFile));
      const challengeId = res.data.id;

      // 2. Add eligible actions
      for (const action of eligibleActions) {
        await challengeService.addEligibleAction(challengeId, action.id);
      }

      // 3. Save completion reward (if XP or badge name provided)
      if (completionReward.xp_reward || completionReward.badge_name) {
        const fd = new FormData();
        fd.append('type',       'completion');
        fd.append('xp_reward',  completionReward.xp_reward  || 0);
        fd.append('badge_name', completionReward.badge_name || '');
        if (completionReward.badge_file) {
          fd.append('badge_image', completionReward.badge_file);
        }
        await challengeService.saveReward(challengeId, fd);
      }

      // 4. Save ranking reward tiers
      for (const tier of rankingRewards) {
        if (!tier.top_value) continue;
        const fd = new FormData();
        fd.append('type',       'ranking');
        fd.append('top_value',  tier.top_value);
        fd.append('xp_reward',  tier.xp_reward  || 0);
        fd.append('badge_name', tier.badge_name || '');
        if (tier.badge_file) {
          fd.append('badge_image', tier.badge_file);
        }
        await challengeService.saveReward(challengeId, fd);
      }

      toast.success('Challenge created!');
      router.push('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setIsLoading(false);
    }
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
        {/* ── Challenge Details ── */}
        <FormSection title="Challenge Details">
          <div className="md:col-span-2">
            <Input label="Challenge Name" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Weekly Zero Waste Hero"
              error={errors.name} />
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
              { value: 'active',    label: 'Active' },
              { value: 'inactive',  label: 'Inactive' },
            ]} />
          <Input label="Start Date" type="date" value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            error={errors.start_date} />
          <Input label="End Date" type="date" value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
            error={errors.end_date} />
          <div className="md:col-span-2">
            <Textarea label="About This Challenge" value={form.about}
              onChange={(e) => set('about', e.target.value)} rows={3} />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              label="Challenge Image (Optional)"
              value={imagePreview}
              preview={imagePreview}
              onChange={(file) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              onRemove={() => { setImageFile(null); setImagePreview(null); }}
            />
          </div>
        </FormSection>

        {/* ── Challenge Goal ── */}
        <FormSection title="Challenge Goal">
          <Select label="Target Type" value={form.target_type}
            onChange={(e) => set('target_type', e.target.value)}
            options={[
              { value: 'count',  label: 'Actions Count' },
              { value: 'co2_kg', label: 'kg CO₂' },
              { value: 'litre',  label: 'Litres Water' },
              { value: 'kwh',    label: 'kWh Energy' },
            ]} />
          <Input label="Target Value" type="number" value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)}
            placeholder="e.g. 10" />
          <Input label="Unit" value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder='e.g. items, times, kg CO₂, litres'
            helper="Displayed on mobile as '6 / 10 {unit}'" />
        </FormSection>

        {/* ── Eligible Actions ── */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Eligible Actions
          </h3>
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
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Remove</th>
                </tr>
              </thead>
              <tbody>
                {eligibleActions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center px-4 py-6 text-gray-400">
                      No Eligible Actions
                    </td>
                  </tr>
                ) : (
                  eligibleActions.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-800">{a.name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.category_name}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveEligible(a.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                        >
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

        {/* ── Completion Reward ── */}
        <FormSection title="Completion Reward">
          <Input
            label="XP Reward"
            type="number"
            value={completionReward.xp_reward}
            onChange={(e) => setCompletionField('xp_reward', e.target.value)}
            placeholder="e.g. 300"
          />
          <Input
            label="Badge Name"
            value={completionReward.badge_name}
            onChange={(e) => setCompletionField('badge_name', e.target.value)}
            placeholder='e.g. "Eco Warrior"'
          />
          <div className="md:col-span-2">
            <ImageUpload
              label="Badge Image (Optional)"
              value={completionReward.badge_preview}
              preview={completionReward.badge_preview}
              onChange={handleCompletionBadgeChange}
              onRemove={() => setCompletionReward(prev => ({
                ...prev, badge_file: null, badge_preview: null
              }))}
            />
          </div>
        </FormSection>

        {/* ── Ranking Rewards ── */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">
              Ranking Rewards
            </h3>
            <Button onClick={addRankingTier} variant="secondary">
              <Plus className="w-4 h-4" />
              Add Tier
            </Button>
          </div>

          {rankingRewards.map((tier, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Input
                label="Top N"
                type="number"
                value={tier.top_value}
                onChange={(e) => setRankingField(i, 'top_value', e.target.value)}
                placeholder="e.g. 1 or 10"
              />
              <Input
                label="XP Reward"
                type="number"
                value={tier.xp_reward}
                onChange={(e) => setRankingField(i, 'xp_reward', e.target.value)}
                placeholder="e.g. 800"
              />
              <Input
                label="Badge Name"
                value={tier.badge_name}
                onChange={(e) => setRankingField(i, 'badge_name', e.target.value)}
                placeholder='e.g. "Champion"'
              />
              <div className="md:col-span-2">
                <ImageUpload
                  label="Badge Image (Optional)"
                  value={tier.badge_preview}
                  preview={tier.badge_preview}
                  onChange={(file) => handleRankingBadgeChange(i, file)}
                  onRemove={() => setRankingRewards(prev =>
                    prev.map((r, idx) =>
                      idx === i ? { ...r, badge_file: null, badge_preview: null } : r
                    )
                  )}
                />
              </div>
              <div className="flex items-end">
                {rankingRewards.length > 1 && (
                  <button
                    onClick={() => removeRankingTier(i)}
                    className="flex items-center gap-1 text-red-500 text-sm font-medium
                      hover:bg-red-50 px-3 py-2 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Submit ── */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Challenge'}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/challenges')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
