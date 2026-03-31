'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email');
  const otp = params.get('otp');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully!');
      router.replace('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500 rounded-2xl
          flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
          🌿
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="New Password" type="password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••" required />
          <Input label="Confirm New Password" type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••" required />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}