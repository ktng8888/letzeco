'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '../../../store/authStore';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src="/app_logo.png"
          alt="LetzEco"
          width={64}
          height={64}
          className="rounded-2xl shadow-lg mx-auto block mb-4"
        />
        <h1 className="text-2xl font-bold text-white">LetzEco Admin</h1>
        <p className="text-white text-sm mt-1">
          Sign in to access the admin dashboard
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border
        border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jecky.wong@letzeco.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="text-right">
            <a href="/forgot-password"
              className="text-sm text-green-600 hover:underline">
              Forgot Password?
            </a>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}