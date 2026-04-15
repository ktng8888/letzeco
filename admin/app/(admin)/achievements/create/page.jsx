'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import achievementService from '../../../../services/achievementService';
import categoryService from '../../../../services/categoryService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';

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

// Empty row template
const emptyRow = () => ({
  target_value: '',
  bonus_xp: '',
  name: '',
  badge_name: '',
  imageFile: null,
  imagePreview: null,
});

export default function CreateAchievementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Refs for file inputs per row
  const fileRefs = useRef([]);

  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  const needsCategory = type === 'log';

  // Update a specific field in a row
  const updateRow = (index, field, value) => {
    setRows(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  };

  // Handle image select for a row
  const handleImageChange = (index, file) => {
    updateRow(index, 'imageFile', file);
    updateRow(index, 'imagePreview', URL.createObjectURL(file));
  };

  // Add new empty row
  const handleAddRow = () => {
    setRows(prev => [...prev, emptyRow()]);
    fileRefs.current.push(null);
  };

  // Remove a row
  const handleRemoveRow = (index) => {
    if (rows.length === 1) return; // keep at least 1
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!type) e.type = 'Achievement type is required.';
    rows.forEach((row, i) => {
      if (!row.target_value) e[`target_${i}`] = 'Required';
      if (!row.bonus_xp) e[`bonus_${i}`] = 'Required';
      if (!row.name) e[`name_${i}`] = 'Required';
      if (!row.badge_name) e[`badge_name_${i}`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      if (categoryId) formData.append('action_category_id', categoryId);

      // Append rows as JSON (without image files)
      const rowsData = rows.map(({ imageFile, imagePreview, ...rest }) => rest);
      formData.append('rows', JSON.stringify(rowsData));

      // Append image files keyed by index
      rows.forEach((row, i) => {
        if (row.imageFile) {
          formData.append(`image_${i}`, row.imageFile);
        }
      });

      await achievementService.createBatch(formData);
      toast.success(`${rows.length} achievement(s) created!`);
      router.push('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create.');
    } finally {
      setIsLoading(false);
    }
  };

  const catOptions = categories.map(c => ({
    value: String(c.id), label: c.name
  }));

  return (
    <div>
      <PageHeader
        title="Create Achievements & Badges"
        subtitle="Add new achievement badge for users to unlock"
      />

      <FormCard>
        <div className="p-6 space-y-6">

          {/* Achievement Type + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Achievement Type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategoryId('');
                setErrors(p => ({ ...p, type: '' }));
              }}
              options={ACHIEVEMENT_TYPES}
              placeholder="Select Achievement Type"
              required
              error={errors.type}
            />
            <Select
              label="Action Category (if applicable)"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={catOptions}
              placeholder="Select category"
              disabled={!needsCategory}
            />
          </div>

          {/* Different Target Value Table */}
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
              <Button onClick={handleAddRow} size="sm">
                <Plus className="w-4 h-4" />
                + Add
              </Button>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-28">
                      Target Value
                    </th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-24">
                      Bonus XP
                    </th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">
                      Achievement Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600">
                      Badge Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold
                      text-gray-600 w-52">
                      Badge Graphic
                    </th>
                    {rows.length > 1 && (
                      <th className="w-12" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}
                      className="border-t border-gray-100 align-top">

                      {/* Target Value */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.target_value}
                          onChange={(e) =>
                            updateRow(i, 'target_value', e.target.value)
                          }
                          min="1"
                          className={`w-full px-3 py-2 text-sm border
                            rounded-lg focus:outline-none focus:ring-2
                            focus:ring-green-500
                            ${errors[`target_${i}`]
                              ? 'border-red-400'
                              : 'border-gray-300'}`}
                          placeholder="e.g. 10"
                        />
                        {errors[`target_${i}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`target_${i}`]}
                          </p>
                        )}
                      </td>

                      {/* Bonus XP */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.bonus_xp}
                          onChange={(e) =>
                            updateRow(i, 'bonus_xp', e.target.value)
                          }
                          className={`w-full px-3 py-2 text-sm border
                            rounded-lg focus:outline-none focus:ring-2
                            focus:ring-green-500
                            ${errors[`bonus_${i}`]
                              ? 'border-red-400'
                              : 'border-gray-300'}`}
                          placeholder="e.g. 200"
                        />
                        {errors[`bonus_${i}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`bonus_${i}`]}
                          </p>
                        )}
                      </td>

                      {/* Achievement Name */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            updateRow(i, 'name', e.target.value)
                          }
                          className={`w-full px-3 py-2 text-sm border
                            rounded-lg focus:outline-none focus:ring-2
                            focus:ring-green-500
                            ${errors[`name_${i}`]
                              ? 'border-red-400'
                              : 'border-gray-300'}`}
                          placeholder="e.g. Bronze Eco Mobility Master"
                        />
                        {errors[`name_${i}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`name_${i}`]}
                          </p>
                        )}
                      </td>

                      {/* Badge Name */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.badge_name}
                          onChange={(e) =>
                            updateRow(i, 'badge_name', e.target.value)
                          }
                          className={`w-full px-3 py-2 text-sm border
                            rounded-lg focus:outline-none focus:ring-2
                            focus:ring-green-500
                            ${errors[`badge_name_${i}`]
                              ? 'border-red-400'
                              : 'border-gray-300'}`}
                          placeholder="e.g. Bronze Eco Mobility"
                        />
                        {errors[`badge_name_${i}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`badge_name_${i}`]}
                          </p>
                        )}
                      </td>

                      {/* Badge Graphic */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Preview */}
                          <div className="w-14 h-14 rounded-lg border-2
                            border-dashed border-gray-300 bg-gray-50
                            flex items-center justify-center
                            overflow-hidden shrink-0">
                            {row.imagePreview ? (
                              <img
                                src={row.imagePreview}
                                alt="badge"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Upload className="w-5 h-5 text-gray-300" />
                            )}
                          </div>

                          {/* Choose + filename */}
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                fileRefs.current[i]?.click()
                              }
                              className="px-2 py-1 text-xs bg-gray-100
                                hover:bg-gray-200 border border-gray-300
                                rounded-lg transition cursor-pointer"
                            >
                              Choose Photo
                            </button>
                            <span className="text-xs text-gray-400
                              max-w-[80px] truncate">
                              {row.imageFile
                                ? row.imageFile.name
                                : 'No Photo Chosen'
                              }
                            </span>
                            <span className="text-xs text-gray-300">
                              PNG, JPG (max. 5MB)
                            </span>
                          </div>

                          {/* Hidden file input */}
                          <input
                            ref={el => fileRefs.current[i] = el}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageChange(i, file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </div>
                      </td>

                      {/* Remove Row */}
                      {rows.length > 1 && (
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(i)}
                            className="p-1.5 bg-red-50 hover:bg-red-100
                              text-red-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Buttons */}
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