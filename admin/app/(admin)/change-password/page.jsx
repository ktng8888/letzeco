'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import PageHeader from '../../../components/layout/PageHeader';
import FormCard from '../../../components/common/FormCard';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword)
      e.currentPassword = 'Current password is required.';
    if (!form.newPassword)
      e.newPassword = 'New password is required.';
    if (form.newPassword.length < 6)
      e.newPassword = 'Minimum 6 characters.';
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await authService.changeMyPassword(
        form.currentPassword,
        form.newPassword
      );
      toast.success('Password changed successfully!');
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to change password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

return (
  <div>
    <PageHeader
      title="Change Password"
      subtitle="Update your account password"
    />

    <FormCard>  {/* ← removed max-w-2xl */}
      {/* Section Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          Password Details
        </h3>
      </div>

      {/* Form */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Password — full width across both columns */}
        <div className="md:col-span-2">
          <Input
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            placeholder="••••••••"
            required
            error={errors.currentPassword}
          />
        </div>

        {/* New + Confirm side by side */}
        <Input
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) => set('newPassword', e.target.value)}
          placeholder="••••••••"
          required
          error={errors.newPassword}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => set('confirmPassword', e.target.value)}
          placeholder="••••••••"
          required
          error={errors.confirmPassword}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Action Buttons */}
      <div className="flex gap-3 p-6">
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Change Password
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Cancel
        </Button>
      </div>
    </FormCard>
  </div>
);
}