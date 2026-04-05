'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import userService from '../../../../services/userService';
import PageHeader from '../../../../components/layout/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import FormSection from '../../../../components/common/FormSection';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'Username is required.';
    if (!form.email) e.email = 'Email is required.';
    if (!form.password) e.password = 'Password is required.';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await userService.create({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success('User created successfully!');
      router.push('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create.');
    } finally { setIsLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Create User Account"
        subtitle="Add a new user account"
      />
      <FormCard>
        <FormSection title="Account Details">
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="user@email.com" required error={errors.email} />
          <Input label="Username" value={form.username}
            onChange={(e) => set('username', e.target.value)}
            placeholder="Username" required error={errors.username} />
          <Input label="Password" type="password" value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••" required error={errors.password} />
          <Input label="Confirm Password" type="password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            placeholder="••••••••" required error={errors.confirmPassword} />
        </FormSection>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create User
          </Button>
          <Button variant="outline" onClick={() => router.push('/users')}>
            Cancel
          </Button>
        </div>
      </FormCard>
    </div>
  );
}