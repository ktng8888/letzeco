'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { buildFormData } from '../../../../utils/buildFormData';
import { getImageUrl } from '../../../../utils/imageUrl';
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
  const router       = useRouter();
  const { id }       = useParams();
  const searchParams = useSearchParams();
  const isView       = searchParams.get('mode') === 'view';

  const [actions, setActions]               = useState([]);
  const [eligibleActions, setEligibleActions] = useState([]);
  const [selectedAction, setSelectedAction]   = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'solo',
    start_date: '',
    end_date: '',
    about: '',
    target_type: 'count',
    target_value: '',
    unit: '',
    status: 'active',
  });
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  // ── Completion reward state
  const [completionReward, setCompletionReward] = useState({
    id: null, badge_id: null, xp_reward: '', badge_name: '', badge_file: null, badge_preview: null,
  });

  // ── Ranking reward tiers state
  const [rankingRewards, setRankingRewards] = useState([
    { id: null, badge_id: null, top_value: '', xp_reward: '', badge_name: '', badge_file: null, badge_preview: null }
  ]);

  useEffect(() => {
    Promise.all([
      challengeService.getById(id),
      challengeService.getEligibleActions(id),
      actionService.getAll(),
    ]).then(([chalRes, eligRes, actRes]) => {
      const c = chalRes.data;
      setForm({
        name:         c.name         || '',
        type:         c.type         || 'solo',
        start_date:   toDateInputValue(c.start_date),
        end_date:     toDateInputValue(c.end_date),
        about:        c.about        || '',
        target_type:  c.target_type  || 'count',
        target_value: c.target_value || '',
        unit:         c.unit         || '',
        status:       c.status       || 'active',
      });
      setCurrentImage(c.image || null);
      setEligibleActions(eligRes.data || []);
      setActions(actRes.data);

      // ── Pre-populate existing rewards
      const rewards = c.rewards || [];
      const completion = rewards.find(r => r.type === 'completion');
      if (completion) {
        setCompletionReward({
          id:           completion.id || null,
          badge_id:     completion.badge_id || null,
          xp_reward:    String(completion.xp_reward || ''),
          badge_name:   completion.badge_name  || '',
          badge_file:   null,
          badge_preview: completion.badge_image
            ? getImageUrl(completion.badge_image)
            : null,
        });
      }

      const ranking = rewards.filter(r => r.type === 'ranking');
      if (ranking.length > 0) {
        setRankingRewards(ranking.map(r => ({
          id:           r.id || null,
          badge_id:     r.badge_id || null,
          top_value:    String(r.top_value  || ''),
          xp_reward:    String(r.xp_reward  || ''),
          badge_name:   r.badge_name  || '',
          badge_file:   null,
          badge_preview: r.badge_image
            ? getImageUrl(r.badge_image)
            : null,
        })));
      }
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

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
      { id: null, badge_id: null, top_value: '', xp_reward: '', badge_name: '', badge_file: null, badge_preview: null }
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

  // ── Eligible action helpers (live save to API)
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
      setEligibleActions(prev => prev.filter(a => a.id !== eligibleActionId));
      toast.success('Action removed.');
    } catch (err) {
      toast.error('Failed to remove.');
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImage(null);
    setImageRemoved(true);
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // 1. Update challenge details
      await challengeService.update(id, buildFormData(form, imageFile, imageRemoved));

      // 2. Save completion reward
      if (completionReward.xp_reward || completionReward.badge_name) {
        const fd = new FormData();
        if (completionReward.id) {
          fd.append('reward_id', completionReward.id);
        }
        if (completionReward.badge_id) {
          fd.append('badge_id', completionReward.badge_id);
        }
        fd.append('type',       'completion');
        fd.append('xp_reward',  completionReward.xp_reward  || 0);
        fd.append('badge_name', completionReward.badge_name || '');
        if (completionReward.badge_file) {
          fd.append('badge_image', completionReward.badge_file);
        }
        await challengeService.saveReward(id, fd);
      }

      // 3. Save ranking reward tiers
      for (const tier of rankingRewards) {
        if (!tier.top_value) continue;
        const fd = new FormData();
        if (tier.id) {
          fd.append('reward_id', tier.id);
        }
        if (tier.badge_id) {
          fd.append('badge_id', tier.badge_id);
        }
        fd.append('type',       'ranking');
        fd.append('top_value',  tier.top_value);
        fd.append('xp_reward',  tier.xp_reward  || 0);
        fd.append('badge_name', tier.badge_name || '');
        if (tier.badge_file) {
          fd.append('badge_image', tier.badge_file);
        }
        await challengeService.saveReward(id, fd);
      }

      toast.success('Challenge updated!');
      router.push('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const actionOptions = actions.map(a => ({
    value: String(a.id),
    label: `${a.name} (${a.category_name})`
  }));

  return (
    <div>
      <PageHeader
        title={isView ? `View Challenge (ID: ${id})` : `Update Challenge (ID: ${id})`}
        subtitle={isView ? 'View existing challenge' : 'Update existing challenge'}
      />
      <FormCard>
        {/* ── Challenge Details ── */}
        <FormSection title="Challenge Details">
          <div className="md:col-span-2">
            <Input label="Challenge Name" value={form.name}
              onChange={(e) => set('name', e.target.value)} disabled={isView} />
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
              { value: 'active',   label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]} disabled={isView} />
          <Input label="Start Date" type="date" value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)} disabled={isView} />
          <Input label="End Date" type="date" value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)} disabled={isView} />
          <div className="md:col-span-2">
            <Textarea label="About" value={form.about}
              onChange={(e) => set('about', e.target.value)} rows={3} disabled={isView} />
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

        {/* ── Challenge Goal ── */}
        <FormSection title="Challenge Goal">
          <Select label="Target Type" value={form.target_type}
            onChange={(e) => set('target_type', e.target.value)}
            options={[
              { value: 'count',  label: 'Actions Count' },
              { value: 'co2_kg', label: 'kg CO₂' },
              { value: 'litre',  label: 'Litres Water' },
              { value: 'kwh',    label: 'kWh Energy' },
            ]} disabled={isView} />
          <Input label="Target Value" type="number" value={form.target_value}
            onChange={(e) => set('target_value', e.target.value)} disabled={isView} />
          <Input label="Unit" value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder='e.g. items, times, kg CO₂, litres'
            helper="Displayed on mobile as '6 / 10 {unit}'" 
            disabled={isView}/>
        </FormSection>

        {/* ── Eligible Actions ── */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">Eligible Actions</h3>
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
                  Add Eligible Actions
                </Button>
              </div>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  {!isView && (
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Remove</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {eligibleActions.length === 0 ? (
                  <tr>
                    <td colSpan={isView ? 2 : 3}
                      className="text-center px-4 py-6 text-gray-400">
                      No Eligible Actions
                    </td>
                  </tr>
                ) : (
                  eligibleActions.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-800">{a.action_name || a.name}</td>
                      <td className="px-4 py-3 text-gray-500">{a.category_name}</td>
                      {!isView && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveEligible(a.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                          >
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

        {/* ── Completion Reward ── */}
        <FormSection title="Completion Reward">
          <Input
            label="XP Reward"
            type="number"
            value={completionReward.xp_reward}
            onChange={(e) => setCompletionField('xp_reward', e.target.value)}
            placeholder="e.g. 300"
            disabled={isView}
          />
          <Input
            label="Badge Name"
            value={completionReward.badge_name}
            onChange={(e) => setCompletionField('badge_name', e.target.value)}
            placeholder='e.g. "Eco Warrior"'
            disabled={isView}
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
              disabled={isView}
            />
          </div>
        </FormSection>

        {/* ── Ranking Rewards ── */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">Ranking Rewards</h3>
            {!isView && (
              <Button onClick={addRankingTier} variant="secondary">
                <Plus className="w-4 h-4" />
                Add Tier
              </Button>
            )}
          </div>

          {rankingRewards.map((tier, i) => (
            <div key={i}
              className="border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Top N"
                type="number"
                value={tier.top_value}
                onChange={(e) => setRankingField(i, 'top_value', e.target.value)}
                placeholder="e.g. 1 or 10"
                disabled={isView}
              />
              <Input
                label="XP Reward"
                type="number"
                value={tier.xp_reward}
                onChange={(e) => setRankingField(i, 'xp_reward', e.target.value)}
                placeholder="e.g. 800"
                disabled={isView}
              />
              <Input
                label="Badge Name"
                value={tier.badge_name}
                onChange={(e) => setRankingField(i, 'badge_name', e.target.value)}
                placeholder='e.g. "Champion"'
                disabled={isView}
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
                  disabled={isView}
                />
              </div>
              {!isView && rankingRewards.length > 1 && (
                <div className="flex items-end">
                  <button
                    onClick={() => removeRankingTier(i)}
                    className="flex items-center gap-1 text-red-500 text-sm font-medium
                      hover:bg-red-50 px-3 py-2 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Submit ── */}
        {!isView && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Challenge
            </Button>
            <Button variant="secondary" onClick={() => router.push('/challenges')}>
              Cancel
            </Button>
          </div>
        )}
        {isView && (
          <div className="p-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => router.push('/challenges')}>
              Back
            </Button>
          </div>
        )}
      </FormCard>
    </div>
  );
}

function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (typeof value === 'string' && value.includes('T')) {
    return value.slice(0, 10);
  }
  return '';
}

export default function ChallengeDetailPage() {
  return <Suspense><ChallengeDetail /></Suspense>;
}
