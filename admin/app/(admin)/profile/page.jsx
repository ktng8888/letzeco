'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import useAuthStore from '../../../store/authStore';
import PageHeader from '../../../components/layout/PageHeader';
import FormCard from '../../../components/common/FormCard';
import FormSection from '../../../components/common/FormSection';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function MyProfilePage() {
  const router = useRouter();
  const { admin, updateAdmin } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    authService.getMyProfile()
      .then((res) => {
        const a = res.data;
        setForm({
          username: a.username || '',
          email: a.email || ''
        });
        setProfileImage(a.profile_image || null);
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setIsLoading(false));
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);

    // Upload immediately
    handleUploadPicture(file);
  };

  const handleUploadPicture = async (file) => {
    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authService.uploadMyProfilePicture(formData);
      setProfileImage(res.data.profile_image);
      updateAdmin({ profile_image: res.data.profile_image });
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload image.');
      setPreviewImage(null);
    } finally {
      setIsUploadingPic(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const res = await authService.updateMyProfile(form);
      updateAdmin({
        username: res.data.username,
        email: res.data.email
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  
  const avatarSrc = previewImage || getImageUrl(profileImage);

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage my account information"
      />

      <FormCard>
        {/* Account Details Section */}
        <div>
          <div className="flex items-center justify-between
            py-4 px-6 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">
              Account Details
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Email + Username row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                error={errors.email}
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                required
                error={errors.username}
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden
                    bg-gray-200 border-2 border-gray-300">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100
                        flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-xl">
                          {form.username?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                  {isUploadingPic && (
                    <div className="absolute inset-0 rounded-full
                      bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white
                        border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Choose Photo Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPic}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                      bg-gray-100 hover:bg-gray-200 text-gray-700
                      border border-gray-300 rounded-lg transition
                      disabled:opacity-50 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Choose Photo
                  </button>
                  {profileImage && (
                    <span className="text-sm text-gray-500">
                      {profileImage.split('/').pop()}
                    </span>
                  )}
                  {!profileImage && (
                    <span className="text-sm text-gray-400">
                      No photo chosen
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                PNG, JPG (max. 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Action Buttons */}
        <div className="flex gap-3 p-6">
          <Button
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            Update Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}