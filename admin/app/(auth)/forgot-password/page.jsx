'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import authService from '../../../services/authService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.validateOtp(email, otp);
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Image
          src="/app_logo.png"
          alt="LetzEco"
          width={64}
          height={64}
          className="rounded-2xl shadow-lg mx-auto block mb-4"
        />
        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email" required />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleValidateOtp} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              OTP sent to {email}. Expires in 5 minutes.
            </p>
            <Input label="OTP Code" value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456" maxLength={6} required />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Validate OTP
            </Button>
            <button type="button" onClick={() => setStep('email')}
              className="w-full text-sm text-gray-500 hover:text-gray-700">
              ← Resend OTP
            </button>
          </form>
        )}
        <div className="text-center mt-4">
          <a href="/login"
            className="text-sm text-green-600 hover:underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}