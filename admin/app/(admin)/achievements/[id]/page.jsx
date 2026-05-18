'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import actionService from '../../../../services/actionService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import ConfirmDelete from '../../../../components/common/ConfirmDelete';

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

const newRow = () => ({
  id: null,
  tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  target_value: '',
  bonus_xp: '',
  name: '',
  badge_name: '',
  badge_image: null,
});

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
  const [deleteRow, setDeleteRow] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const getRowKey = (row) => row.id || row.tempId;

  const updateRow = (rowKey, field, value) => {
    setRows(prev => prev.map(row =>
      getRowKey(row) === rowKey ? { ...row, [field]: value } : row
    ));
  };

  const handleImageChange = (rowKey, file) => {
    setImageFiles(prev => ({ ...prev, [rowKey]: file }));
    setImagePreviews(prev => ({
      ...prev,
      [rowKey]: URL.createObjectURL(file),
    }));
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, newRow()]);
  };

  const handleRemoveNewRow = (rowKey) => {
    setRows(prev => prev.filter(row => getRowKey(row) !== rowKey));
    setImageFiles(prev => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
    setImagePreviews(prev => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
  };

  const handleDeleteRowPress = (row) => {
    if (rows.length <= 1) {
      toast.error('Achievement group must have at least one tier.');
      return;
    }

    if (!row.id) {
      handleRemoveNewRow(getRowKey(row));
      return;
    }

    setDeleteRow(row);
  };

  const handleConfirmDeleteTier = async () => {
    if (!deleteRow?.id) return;

    setIsDeleting(true);
    try {
      await achievementService.delete(deleteRow.id);
      const rowKey = getRowKey(deleteRow);
      setRows(prev => prev.filter(row => getRowKey(row) !== rowKey));
      setImageFiles(prev => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
      setImagePreviews(prev => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
      setDeleteRow(null);
      toast.success('Tier deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tier.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      for (const row of rows) {
        if (!row.target_value || row.bonus_xp === '' || !row.name || !row.badge_name) {
          toast.error('Each tier needs target, bonus XP, achievement name and badge name.');
          setIsSaving(false);
          return;
        }
      }

      const existingRows = rows.filter(row => row.id);
      const addedRows = rows.filter(row => !row.id);

      await Promise.all(existingRows.map((row) => {
        const rowKey = getRowKey(row);
        const formData = new FormData();
        formData.append('type', type);
        formData.append('action_category_id', needsCategory ? categoryId || '' : '');
        formData.append('action_id', needsAction ? actionId || '' : '');
        formData.append('name', row.name);
        formData.append('badge_name', row.badge_name);
        formData.append('target_value', row.target_value);
        formData.append('bonus_xp', row.bonus_xp);
        if (imageFiles[rowKey]) {
          formData.append('image', imageFiles[rowKey]);
        }
        return achievementService.update(row.id, formData);
      }));

      if (addedRows.length > 0) {
        const formData = new FormData();
        formData.append('type', type);
        if (needsCategory && categoryId) formData.append('action_category_id', categoryId);
        if (needsAction && actionId) formData.append('action_id', actionId);
        formData.append('rows', JSON.stringify(addedRows.map(row => ({
          target_value: row.target_value,
          bonus_xp: row.bonus_xp,
          name: row.name,
          badge_name: row.badge_name,
        }))));

        addedRows.forEach((row, index) => {
          const rowKey = getRowKey(row);
          if (imageFiles[rowKey]) {
            formData.append(`image_${index}`, imageFiles[rowKey]);
          }
        });

        await achievementService.createBatch(formData);
      }

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
              {!isView && (
                <Button onClick={handleAddRow} size="sm">
                  <Plus className="w-4 h-4" />
                  Add Tier
                </Button>
              )}
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
                    {!isView && (
                      <th className="w-12" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rowKey = getRowKey(row);
                    const displayImage = imagePreviews[rowKey]
                      || (row.badge_image
                        ? `${API_URL}/${row.badge_image.replace(/\\/g, '/')}`
                        : null);

                    return (
                      <tr key={rowKey}
                        className="border-t border-gray-100 align-top">
                        <td className="px-4 py-3">
                          <input type="number"
                            value={row.target_value}
                            onChange={(e) =>
                              updateRow(rowKey, 'target_value', e.target.value)
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
                              updateRow(rowKey, 'bonus_xp', e.target.value)
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
                              updateRow(rowKey, 'name', e.target.value)
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
                              updateRow(rowKey, 'badge_name', e.target.value)
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
                                    fileRefs.current[rowKey]?.click()
                                  }
                                  className="px-2 py-1 text-xs bg-gray-100
                                    hover:bg-gray-200 border border-gray-300
                                    rounded-lg transition cursor-pointer">
                                  Choose Photo
                                </button>
                                <span className="text-xs text-gray-400
                                  max-w-[90px] truncate">
                                  {imageFiles[rowKey]
                                    ? imageFiles[rowKey].name
                                    : row.badge_image
                                      ? row.badge_image.split('/').pop()
                                      : 'No Photo Chosen'}
                                </span>
                                <input
                                  ref={el => fileRefs.current[rowKey] = el}
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleImageChange(rowKey, file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        {!isView && (
                          <td className="px-2 py-3">
                            {rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRowPress(row)}
                                disabled={isSaving || isDeleting}
                                className="p-1.5 bg-red-50 hover:bg-red-100
                                  text-red-500 rounded-lg transition
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete tier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
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

      <ConfirmDelete
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleConfirmDeleteTier}
        itemName={deleteRow?.name || 'this tier'}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function AchievementDetailPage() {
  return <Suspense><AchievementDetail /></Suspense>;
}
