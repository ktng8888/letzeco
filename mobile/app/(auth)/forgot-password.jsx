import { Text, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import authService from '../../services/authService';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';
import {
  AuthButton,
  AuthHeader,
  AuthInput,
  AuthPanel,
  AuthScreen,
  authStyles,
} from '../../components/common/AuthShell';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setStep('otp');
      Alert.alert('OTP Sent', 'Check your email. Code expires in 5 minutes.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.validateOtp(email.trim(), otp);
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: email.trim(), otp },
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen>
      <AuthPanel>
        <AuthHeader
          title="Forgot Password"
          subtitle={
            step === 'email'
              ? 'Enter your email to receive a secure OTP'
              : `OTP sent to ${email}. Enter it within 5 minutes.`
          }
        />

        {step === 'email' ? (
          <>
            <AuthInput
              label="Email"
              icon="mail-outline"
              placeholder="kayetee@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthButton
              title="Send OTP"
              loading={isLoading}
              onPress={handleSendOtp}
            />
          </>
        ) : (
          <>
            <AuthInput
              label="OTP"
              icon="keypad-outline"
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              inputStyle={authStyles.otpInput}
            />

            <AuthButton
              title="Validate OTP"
              loading={isLoading}
              onPress={handleValidateOtp}
            />

            <SoundTouchableOpacity
              style={authStyles.secondaryAction}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              <Text style={authStyles.inlineActionText}>Resend OTP</Text>
            </SoundTouchableOpacity>
          </>
        )}

        <SoundTouchableOpacity
          style={authStyles.secondaryAction}
          onPress={() => router.back()}
          soundType="back"
        >
          <Text style={authStyles.secondaryActionText}>Back to Login</Text>
        </SoundTouchableOpacity>
      </AuthPanel>
    </AuthScreen>
  );
}
