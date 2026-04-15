'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';

const ACHIEVEMENT_TYPES = [
  { value: 'log', label: 'Log X actions in Y category' },
  { value: 'reach_level', label: 'Reach level X' },
  { value: 'streak', label: 'Maintain streak for X days' },
  { value: 'total_xp', label: 'Earn X total XP' },
  { value: 'total_actions', label: 'Log X actions' },
  { value: 'friends', label: 'Add X friends' },
  { value: 'challenges', label: 'Complete X challenges' },
  { value: 'team_challenges', label: 'Complete X team challenges' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

function AchievementDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isView = searchParams.get('mode') === 'view';

  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [row, setRow] = useState({
    target_value: '',
    bonus_xp: '',
    name: '',
    badge_name: '',
    badge_image: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      achievementService.getById(id),
      categoryService.getAll(),
    ]).then(([achRes, catRes]) => {
      const a = achRes.data;
      setCategories(catRes.data);
      setType(a.type || '');
      setCategoryId(String(a.action_category_id || ''));
      setRow({
        target_value: String(a.target_value || ''),
        bonus_xp: String(a.bonus_xp || ''),
        name: a.name || '',
        badge_name: a.badge_name || '',
        badge_image: a.badge_image || null,
      });
    }).catch(() => toast.error('Failed to load.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const updateRow = (field, value) =>
    setRow(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('action_category_id', categoryId || '');
      formData.append('name', row.name);
      formData.append('badge_name', row.badge_name);
      formData.append('target_value', row.target_value);
      formData.append('bonus_xp', row.bonus_xp);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await achievementService.update(id, formData);
      toast.success('Achievement updated!');
      router.push('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setIsSaving(false); }
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

  const needsCategory = type === 'log';
  const displayImage = imagePreview
    || (row.badge_image
      ? `${API_URL}/${row.badge_image.replace(/\\/g, '/')}`
      : null);

  return (
    <div>
      <PageHeader
        title={isView
          ? `View Achievements & Badges (Achievement ID: ${id})`
          : `Update Achievements & Badges (Achievement ID: ${id})`}
        subtitle={isView
          ? 'View existing achievement & badges'
          : 'Update existing achievement & badges'}
      />

      <FormCard>
        <div className="p-6 space-y-6">

          {/* Type + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Achievement Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={ACHIEVEMENT_TYPES}
              required
              disabled={isView}
            />
            <Select
              label="Action Category (if applicable)"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={catOptions}
              placeholder="Select category"
              disabled={!needsCategory || isView}
            />
          </div>

          {/* Single Row Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Different Target Value
                </span>
                <span className="text-red-500 ml-1">*</span>
                <span className="text-xs text-gray-400 ml-2">
                  (Minimum 1)
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-28">Target Value</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-24">Bonus XP</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">Achievement Name</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">Badge Name</th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-52">Badge Graphic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100 align-top">

                    {/* Target Value */}
                    <td className="px-4 py-3">
                      <input type="number"
                        value={row.target_value}
                        onChange={(e) =>
                          updateRow('target_value', e.target.value)
                        }
                        min="1"
                        disabled={isView}
                        className="w-full px-3 py-2 text-sm border
                          border-gray-300 rounded-lg focus:outline-none
                          focus:ring-2 focus:ring-green-500
                          disabled:bg-gray-100"
                        placeholder="e.g. 10"
                      />
                    </td>

                    {/* Bonus XP */}
                    <td className="px-4 py-3">
                      <input type="number"
                        value={row.bonus_xp}
                        onChange={(e) =>
                          updateRow('bonus_xp', e.target.value)
                        }
                        disabled={isView}
                        className="w-full px-3 py-2 text-sm border
                          border-gray-300 rounded-lg focus:outline-none
                          focus:ring-2 focus:ring-green-500
                          disabled:bg-gray-100"
                        placeholder="e.g. 200"
                      />
                    </td>

                    {/* Achievement Name */}
                    <td className="px-4 py-3">
                      <input type="text"
                        value={row.name}
                        onChange={(e) => updateRow('name', e.target.value)}
                        disabled={isView}
                        className="w-full px-3 py-2 text-sm border
                          border-gray-300 rounded-lg focus:outline-none
                          focus:ring-2 focus:ring-green-500
                          disabled:bg-gray-100"
                        placeholder="e.g. Bronze Eco Mobility Master"
                      />
                    </td>

                    {/* Badge Name */}
                    <td className="px-4 py-3">
                      <input type="text"
                        value={row.badge_name}
                        onChange={(e) =>
                          updateRow('badge_name', e.target.value)
                        }
                        disabled={isView}
                        className="w-full px-3 py-2 text-sm border
                          border-gray-300 rounded-lg focus:outline-none
                          focus:ring-2 focus:ring-green-500
                          disabled:bg-gray-100"
                        placeholder="e.g. Bronze Eco Mobility"
                      />
                    </td>

                    {/* Badge Graphic */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-14 rounded-lg border-2
                          border-dashed border-gray-300 bg-gray-50
                          flex items-center justify-center
                          overflow-hidden shrink-0">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt="badge"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        {!isView && (
                          <div className="flex flex-col gap-1">
                            <button type="button"
                              onClick={() => fileRef.current?.click()}
                              className="px-2 py-1 text-xs bg-gray-100
                                hover:bg-gray-200 border border-gray-300
                                rounded-lg transition cursor-pointer"
                            >
                              Choose Photo
                            </button>
                            <span className="text-xs text-gray-400
                              max-w-[80px] truncate">
                              {imageFile
                                ? imageFile.name
                                : row.badge_image
                                  ? row.badge_image.split('/').pop()
                                  : 'No Photo Chosen'
                              }
                            </span>
                            <span className="text-xs text-gray-300">
                              PNG, JPG (max. 5MB)
                            </span>
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setImageFile(file);
                                  setImagePreview(
                                    URL.createObjectURL(file)
                                  );
                                }
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </div>
                        )}
                        {isView && row.badge_image && (
                          <span className="text-xs text-gray-500">
                            {row.badge_image.split('/').pop()}
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          {!isView && (
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Update Achievement
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