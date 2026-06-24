import { Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import authService from '../../services/authService';
import {
  AuthButton,
  AuthHeader,
  AuthInput,
  AuthPanel,
  AuthScreen,
} from '../../components/common/AuthShell';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      Alert.alert(
        'Success!',
        'Password reset successfully. Please login.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen>
      <AuthPanel>
        <AuthHeader
          title="Reset Password"
          subtitle="Choose a new password for your LetzECO account"
        />

        <AuthInput
          label="New Password"
          icon="lock-closed-outline"
          placeholder="Enter a new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <AuthInput
          label="Confirm New Password"
          icon="shield-checkmark-outline"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <AuthButton
          title="Reset Password"
          loading={isLoading}
          onPress={handleReset}
        />
      </AuthPanel>
    </AuthScreen>
  );
}
