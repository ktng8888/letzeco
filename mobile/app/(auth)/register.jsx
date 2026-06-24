import { Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';
import {
  AuthButton,
  AuthFooter,
  AuthHeader,
  AuthInput,
  AuthPanel,
  AuthScreen,
} from '../../components/common/AuthShell';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    const result = await register(username.trim(), email.trim(), password);
    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
      return;
    }

    Alert.alert(
      'Registration Successful',
      'Please login with your new account.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    );
  };

  return (
    <AuthScreen scroll compact>
      <AuthPanel compact>
        <AuthHeader
          title="Register"
          subtitle="Start your eco-friendly journey"
          compact
        />

        <AuthInput
          label="Email"
          icon="mail-outline"
          placeholder="kayetee@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          compact
        />

        <AuthInput
          label="Password"
          icon="lock-closed-outline"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          compact
        />

        <AuthInput
          label="Confirm Password"
          icon="shield-checkmark-outline"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          compact
        />

        <AuthInput
          label="Username"
          icon="person-outline"
          placeholder="KayeTEE"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          compact
        />

        <AuthButton
          title="Register"
          loading={isLoading}
          onPress={handleRegister}
          compact
        />

        <Link href="/(auth)/login" asChild>
          <SoundTouchableOpacity>
            <AuthFooter text="Already have an account?" linkText="Login" compact />
          </SoundTouchableOpacity>
        </Link>
      </AuthPanel>
    </AuthScreen>
  );
}
