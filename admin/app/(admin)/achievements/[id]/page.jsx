'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import actionService from '../../../../services/actionService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';

const ACHIEVEMENT_TYPES = [
  { value: 'log', label: 'Log category' },
  { value: 'log_specific_action', label: 'Log action' },
  { value: 'reach_level', label: 'Reach level' },
  { value: 'maintain_streak', label: 'Maintain streak' },
  { value: 'earn_total_xp', label: 'Total XP' },
  { value: 'save_co2', label: 'Save CO2' },
  { value: 'save_litre', label: 'Save water' },
  { value: 'save_kwh', label: 'Save energy' },
  { value: 'add_friends', label: 'Friends' },
  { value: 'complete_challenges', label: 'Solo challenges' },
  { value: 'complete_team_challenges', label: 'Team challenges' },
];

const TYPE_LABELS = Object.fromEntries(
  ACHIEVEMENT_TYPES.map(type => [type.value, type.label])
);

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

const getGroupKey = (achievement) => [
  achievement.type || '',
  achievement.type === 'log' ? achievement.action_category_id || '' : '',
  achievement.type === 'log_specific_action' ? achievement.action_id || '' : '',
].join(':');

const isSameGroup = (achievement, groupKey) =>
  getGroupKey(achievement) === groupKey;

function AchievementDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';

  const [categories, setCategories] = useState([]);
  const [actions, setActions] = useState([]);
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [actionId, setActionId] = useState('');
  const [rows, setRows] = useState([]);
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileRefs = useRef({});

  const needsCategory = type === 'log' || type === 'log_specific_action';
  const needsAction = type === 'log_specific_action';

  useEffect(() => {
    Promise.all([
      achievementService.getById(id),
      achievementService.getAll(),
      categoryService.getAll(),
    ]).then(([achRes, allRes, catRes]) => {
      const current = achRes.data;
      const groupKey = searchParams.get('group') || getGroupKey(current);
      const groupRows = allRes.data
        .filter(item => isSameGroup(item, groupKey))
        .sort((a, b) => a.target_value - b.target_value);

      setCategories(catRes.data);
      setType(current.type || '');
      setCategoryId(String(current.action_category_id || ''));
      setActionId(String(current.action_id || ''));
      setRows(groupRows.map(item => ({
        id: item.id,
        target_value: String(item.target_value ?? ''),
        bonus_xp: String(item.bonus_xp ?? ''),
        name: item.name || '',
        badge_name: item.badge_name || '',
        badge_image: item.badge_image || null,
      })));
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id, searchParams]);

  useEffect(() => {
    if (!needsAction || !categoryId) {
      setActions([]);
      if (!needsAction) setActionId('');
      return;
    }

    actionService.getByCategory(categoryId)
      .then(res => setActions(res.data))
      .catch(console.error);
  }, [categoryId, needsAction]);

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleImageChange = (rowId, file) => {
    setImageFiles(prev => ({ ...prev, [rowId]: file }));
    setImagePreviews(prev => ({
      ...prev,
      [rowId]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await Promise.all(rows.map((row) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('action_category_id', needsCategory ? categoryId || '' : '');
        formData.append('action_id', needsAction ? actionId || '' : '');
        formData.append('name', row.name);
        formData.append('badge_name', row.badge_name);
        formData.append('target_value', row.target_value);
        formData.append('bonus_xp', row.bonus_xp);
        if (imageFiles[row.id]) {
          formData.append('image', imageFiles[row.id]);
        }
        return achievementService.update(row.id, formData);
      }));

      toast.success('Achievement group updated!');
      router.push('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-gray-200
        border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  const catOptions = categories.map(c => ({
    value: String(c.id), label: c.name
  }));
  const actionOptions = actions.map(a => ({
    value: String(a.id), label: a.name
  }));
  const selectedCategory = categories.find(c => String(c.id) === categoryId);
  const selectedAction = actions.find(a => String(a.id) === actionId);

  return (
    <div>
      <PageHeader
        title={isView ? 'View Achievement Group' : 'Update Achievement Group'}
        subtitle={`${TYPE_LABELS[type] || type} / ${
          type === 'log' ? selectedCategory?.name || '-' : '-'
        } / ${
          type === 'log_specific_action' ? selectedAction?.name || '-' : '-'
        }`}
      />

      <FormCard>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Select
              label="Achievement Type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategoryId('');
                setActionId('');
                setActions([]);
              }}
              options={ACHIEVEMENT_TYPES}
              required
              disabled={isView}
            />
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setActionId('');
              }}
              options={catOptions}
              placeholder="Select category"
              disabled={!needsCategory || isView}
            />
            <Select
              label="Action"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              options={actionOptions}
              placeholder={categoryId ? 'Select action' : 'Select category first'}
              disabled={!needsAction || !categoryId || isView}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Target Tiers
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  ({rows.length} achievement{rows.length === 1 ? '' : 's'})
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-28">Target</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-24">Bonus XP</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">Achievement Name</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">Badge Name</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-56">Badge Graphic</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const displayImage = imagePreviews[row.id]
                      || (row.badge_image
                        ? `${API_URL}/${row.badge_image.replace(/\\/g, '/')}`
                        : null);

                    return (
                      <tr key={row.id}
                        className="border-t border-gray-100 align-top">
                        <td className="px-4 py-3">
                          <input type="number"
                            value={row.target_value}
                            onChange={(e) =>
                              updateRow(row.id, 'target_value', e.target.value)
                            }
                            min="1"
                            disabled={isView}
                            className="w-full px-3 py-2 text-sm border
                              border-gray-300 rounded-lg focus:outline-none
                              focus:ring-2 focus:ring-green-500
                              disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number"
                            value={row.bonus_xp}
                            onChange={(e) =>
                              updateRow(row.id, 'bonus_xp', e.target.value)
                            }
                            disabled={isView}
                            className="w-full px-3 py-2 text-sm border
                              border-gray-300 rounded-lg focus:outline-none
                              focus:ring-2 focus:ring-green-500
                              disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text"
                            value={row.name}
                            onChange={(e) =>
                              updateRow(row.id, 'name', e.target.value)
                            }
                            disabled={isView}
                            className="w-full px-3 py-2 text-sm border
                              border-gray-300 rounded-lg focus:outline-none
                              focus:ring-2 focus:ring-green-500
                              disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text"
                            value={row.badge_name}
                            onChange={(e) =>
                              updateRow(row.id, 'badge_name', e.target.value)
                            }
                            disabled={isView}
                            className="w-full px-3 py-2 text-sm border
                              border-gray-300 rounded-lg focus:outline-none
                              focus:ring-2 focus:ring-green-500
                              disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-14 rounded-lg border-2
                              border-dashed border-gray-300 bg-gray-50
                              flex items-center justify-center overflow-hidden
                              shrink-0">
                              {displayImage ? (
                                <img src={displayImage} alt="badge"
                                  className="w-full h-full object-cover" />
                              ) : (
                                <Upload className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            {!isView && (
                              <div className="flex flex-col gap-1">
                                <button type="button"
                                  onClick={() =>
                                    fileRefs.current[row.id]?.click()
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100
                                    hover:bg-gray-200 border border-gray-300
                                    rounded-lg transition cursor-pointer">
                                  Choose Photo
                                </button>
                                <span className="text-xs text-gray-400
                                  max-w-[90px] truncate">
                                  {imageFiles[row.id]
                                    ? imageFiles[row.id].name
                                    : row.badge_image
                                      ? row.badge_image.split('/').pop()
                                      : 'No Photo Chosen'}
                                </span>
                                <input
                                  ref={el => fileRefs.current[row.id] = el}
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleImageChange(row.id, file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Achievement Group
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
